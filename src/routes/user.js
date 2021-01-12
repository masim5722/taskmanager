const express = require('express')
const router = express.Router()
const User = require('./../models/user')
const auth = require('./../middleware/auth')
const multer = require('multer')
const sharp = require('sharp')
const {sendWelcomeEmail} = require('../emails/accounts')

// routes
router.post('/users/login', async (req, res) => {
    const body = req.body
    try{
        const user = await User.findByCredentials(body.email, body.password)
        const token = await user.generateAuthToken()
        res.send({user, token})
    } catch (e) {
        res.status(400).send(e)
    }
})

router.post('/users/logout', auth, async (req, res) => {
    try{
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token
        })
        await req.user.save()
        res.send()
    } catch (e) {
        res.status(500).send()
    }
})

router.post('/users/logoutAll', auth, async (req, res) => {
    try{
        req.user.tokens = []
        await req.user.save()
        res.send()
    } catch (e) {
        res.status(500).send()
    }
})

router.post('/users', async (req, res) => {
    const user = new User(req.body)
    try {
        await user.save()
        sendWelcomeEmail(user.email, user.name)
        const token = await user.generateAuthToken()
        res.status(201).send({user, token})
    } catch (error){
        res.status(400).send(error)
    }
})

router.get('/users/me', auth, async (req, res) => {
    res.send(req.user)
})

router.patch('/users/me', auth, async (req, res) =>{
    const body = req.body
    const user = req.user
    const updates = Object.keys(body)
    const allowedUpdates = ['name', 'email', 'password', 'age']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))
    if(!isValidOperation){
        return res.status(400).send({error: 'Invalid Updates!'})
    }
    try{
        updates.forEach((update) => user[update] = body[update])

        await user.save()
        // const user = await User.findByIdAndUpdate(params.id, body, {new: true, runValidators: true})
        // if(!user){
        //     res.status(404).send()
        // }
        res.send(user)
    } catch (e) {
        res.status(500).send(e)
    }
})

router.delete('/users/me', auth, async (req, res) =>{
    const params = req.params
    const user = req.user

    try{
        // const user = await User.findByIdAndDelete(user.id)
        // if(!user){
        //     res.status(404).send()
        // }

        await req.user.remove()
        res.send(user)
    } catch (e) {
        res.status(500).send(e)
    }
})

const upload = multer({
    limits: {
        fileSize: 1000000  // in MBs
    },
    fileFilter(req, file, cb){
        if(!file.originalname.toLowerCase().match(/\.(jpg|png|jpeg|gif)$/)){
            return cb(new Error('File must be an image'))
        }

        cb(undefined, true)
        // cb(new Error('File must be an image'))
        // cb(undefined, true)
        // cb(undefined, false)
    }
})
router.post('/users/me/avatar', auth, upload.single('upload'), async (req, res) => {
    const user = req.user
    const roundedCorners = Buffer.from(
        '<svg><rect x="0" y="0" width="200" height="200" rx="50" ry="50"/></svg>'
    );


    const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).composite([{
        input: roundedCorners,
        blend: 'dest-in'
    }]).png().toBuffer()
    // user.avatar = req.file.buffer
    user.avatar = buffer
    await user.save()
    res.send()
}, (error, req, res, next) => {
    res.status(400).send({error: error.message})
})

router.delete('/users/me/avatar', auth, async (req, res) => {
    const user = req.user
    user.avatar = undefined
    await user.save()

    res.send()
})

router.get('/users/:id/avatar', async (req, res) =>{
    const params = req.params
    try{
        const user = await User.findById(params.id)
        if(!user || !user.avatar){
            throw new Error()
        }

        res.set('Content-Type', 'image/png')
        res.send(user.avatar)
    } catch (e) {

    }
})

module.exports=router
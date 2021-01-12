const express = require('express')
const router = express.Router()
const auth = require('./../middleware/auth')
const Task = require('./../models/tasks')

// routes
router.post('/tasks', auth, async (req, res) => {
    const task = new Task({
        ...req.body,
        owner: req.user._id
    })
    try{
        await task.save()
        res.send(task)
    } catch (error) {
        res.status(400).send(error)
    }
})

router.get('/tasks', auth, async (req, res) => {
    const query = req.query
    const user = req.user
    const match = {}
    const sort = {}

    if(query.sortBy){
       const parts = query.sortBy.split(':')
        console.log(parts)
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
    }
    if(query.completed){
        match.completed = query.completed === 'true'
    }

    try{
        // const tasks = await Task.find({owner: user._id})
        await user.populate({
            path: 'tasks',
            match,
            options:{
                limit: parseInt(query.limit),
                skip: parseInt(query.skip),
                sort
            }
        }).execPopulate()
        res.send(user.tasks)
    }catch (e) {
        res.status(500).send(e)
    }
})

router.get('/tasks/:id', auth, async (req, res) => {
    const user = req.user
    const _id = req.params.id
    try{
        // console.log( user._id)
        // const task = await Task.findById(params.id)
        const task = await Task.findOne({_id, owner: user._id})
        if(!task){
            return res.status(404).send()
        }
        res.send(task)
    }catch (e) {
        res.status(500).send(e)
    }
})

router.patch('/tasks/:id', auth,async (req, res) => {
    const body = req.body
    const user = req.user
    const params = req.params

    const updates = Object.keys(body)
    const allowedUpdates = ['description','completed']
    const isValidated = updates.every((update) => allowedUpdates.includes(update))

    if(!isValidated){
        res.status(400).send({error: 'Invalid Updates'})
    }
    try{
        const task = await Task.findOne({_id: params.id, owner: user._id})
        // const task = await Task.findById(params.id)

        updates.forEach((update) => task[update] = body[update])
        await task.save()
        // const task =  await Task.findByIdAndUpdate(params.id, body,{new: true, runValidators: true})
        if(!task){
            res.status(404).send()
        }
        res.send(task)
    }catch (e) {
        res.status(500).send(e)
    }
})

router.delete('/tasks/:id', auth, async (req, res) => {
    const params = req.params
    const user = req.user
    try{
        const task = await Task.findOneAndDelete({_id: params.id, owner: user._id})
        if(!task){
            res.status(404).send()
        }
        res.send(task)
    } catch (e) {
        res.status(500).send(e)
    }
})


module.exports=router
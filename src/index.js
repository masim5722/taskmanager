const express = require('express')
require('./database/mongoose')
// routers
const userRouter = require('./routes/user')
const taskRouter = require('./routes/task')

const app = express()
const port = process.env.PORT || 3000



// use
app.use(express.json())
app.use(userRouter)
app.use(taskRouter)

// starting server
app.listen(port, () => {
    console.log('Server is running on port ' +port)
})
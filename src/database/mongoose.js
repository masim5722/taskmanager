const mongoose = require('mongoose')

// const databaseName = process.env.DATABASE_NAME
const connectionURL = process.env.DATABASE_URL

//connection
mongoose.connect(connectionURL,{
    useUnifiedTopology:true,
    useCreateIndex: true,
    useNewUrlParser: true
})
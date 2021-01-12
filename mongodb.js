// CRUD

const {MongoClient} = require('mongodb')

const databaseName = 'task-manager'
const connectionURL = 'mongodb://127.0.0.1:27017'

MongoClient.connect(connectionURL,{  useUnifiedTopology: true  }, (error, client) =>{
    if(error){
        return console.log(error+ 'Unable to connect to database')
    }

    const db = client.db(databaseName)

    db.collection('users').find({name:'Muhammad Asim'})
        .then((result) => {
            console.log(result)
        }).catch((error) => {
            return console.log('Unable to find the user')
        })

})

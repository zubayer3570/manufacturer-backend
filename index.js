//requires
const express = require('express')
const app = express()
const cors = require('cors')
const { MongoClient, ObjectId } = require('mongodb')
require('dotenv').config()

//cors
const corsConfig = {
    origin: true,
    credentials: true
}
app.use(cors(corsConfig))
app.options("*", cors(corsConfig))

//middleware
app.use(express.json())

//port
const port = process.env.PORT || 5000

//root get request
app.get('/', (req, res) => {
    res.send('Assignment-12 server is working fine')
})

//mongodb
const uri = `mongodb+srv://database-user-1:databaseofzubayer@cluster0.1f3iy.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`
const client = new MongoClient(uri)
const run = () => {
    try {
        client.connect()
        // const collection1 = client.db().collection()
        // const collection2 = client.db().collection()
        // const collection3 = client.db().collection()
        app.get('/', async (req, res) => { })
        app.post('/', async (req, res) => { })
        app.delete('/', async (req, res) => { })
        app.put('/', async (req, res) => { })
    } finally { }
}
run()
//listen
app.listen(port)
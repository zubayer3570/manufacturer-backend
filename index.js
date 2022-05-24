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
        const collection1 = client.db('manufacture').collection('tools')
        const collection2 = client.db('manufacture').collection('users')
        const collection3 = client.db('manufacture').collection('orders')
        // app.get('/', async (req, res) => { })
        // app.post('/', async (req, res) => { })
        // app.delete('/', async (req, res) => { })
        // app.put('/', async (req, res) => { })
        app.post('/addUser', async (req, res) => {
            const email = req.body.email
            await collection2.insertOne({ email })
            res.send({ message: 'user added' })
        })
        app.post('/addTools', async (req, res) => {
            const tools = req.body.tools
            await collection1.insertOne(tools)
            res.send({ message: 'tools added' })
        })
        app.post('/checkAdmin', async (req, res) => {
            const email = req.body.email
            const result = await collection2.findOne({ email })
            if (result?.admin) {
                res.send({ message: true })
            } else {
                res.send({ message: false })
            }
        })
        app.get('/tools', async (req, res) => {
            const tools = await collection1.find({}).toArray()
            res.send(tools)
        })
        app.get('/toolDetails/:id', async (req, res) => {
            const { id } = req.params
            const toolDetails = await collection1.findOne({ _id: ObjectId(id) })
            res.send(toolDetails)
        })
        app.post('/placeOrder', async (req, res) => {
            const order = req.body.order
            await collection3.insertOne(order)
            res.send({ message: 'hi' })
        })
        app.get('/allUsers', async (req, res) => {
            const allUser = await collection2.find({}).toArray()
            res.send(allUser)
        })
        app.post('/makeAdmin', async (req, res) => {
            const email = req.body.email
            await collection2.updateOne({ email }, {
                $set: { admin: true }
            }, {
                upsert: true
            })
            res.send({ message: 'hi' })
        })
        app.get('/allOrders', async (req, res) => {
            const allOrders = await collection3.find({}).toArray()
            res.send(allOrders)
        })
        app.delete('/cancelOrder', async (req, res) => {
            const id = req.body.orderId;
            await collection3.deleteOne({ _id: ObjectId(id) })
            res.send({ message: 'ordered canceled' })
        })
        app.get('/myOrders/:email', async (req, res) => {
            const email = req.params.email
            const myOrders = await collection3.find({ email }).toArray()
            res.send(myOrders)
        })
    } finally { }
}
run()
//listen
app.listen(port)
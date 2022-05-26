//requires
const express = require('express')
const app = express()
const cors = require('cors')
const { MongoClient, ObjectId } = require('mongodb')
const jwt = require('jsonwebtoken')
require('dotenv').config()
const stripe = require("stripe")('sk_test_51L1tk9Hl8mJ3Qhh0resZLZzbuekQXbGN1GLfLSSUnb44Xv2VVAIzqZfaC8lZ07geVW7jJZzRn3lgXQhlkXrvAkb900uRcgQCe6');

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
const uri = `mongodb+srv://${process.env.DBUSER}:${process.env.DBPASSWORD}@cluster0.1f3iy.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`
const client = new MongoClient(uri)
//jwt verify
const jwtVerify = (req, res, next) => {
    const authHeader = req.headers.authorization
    if (!authHeader) {
        console.log('no auth')
        return
    }
    const token = authHeader.split(' ')[1]
    jwt.verify(token, process.env.JWT_SECRET_KEY, (error, decoded) => {
        if (error) {
            console.log('verification error')
            return
        }
        req.decoded = decoded
    })
    next()
}
const run = async () => {
    try {
        await client.connect()
        const collection1 = client.db('manufacture').collection('tools')
        const collection2 = client.db('manufacture').collection('users')
        const collection3 = client.db('manufacture').collection('orders')
        const collection4 = client.db('manufacture').collection('review')

        //get calls
        app.get('/tools', async (req, res) => {
            const tools = await collection1.find({}).toArray()
            res.send(tools)
        })
        app.get('/toolDetails/:id', async (req, res) => {
            const { id } = req.params
            const toolDetails = await collection1.findOne({ _id: ObjectId(id) })
            res.send(toolDetails)
        })
        app.get('/allUsers', async (req, res) => {
            const allUser = await collection2.find({}).toArray()
            res.send(allUser)
        })
        app.get('/allOrders', async (req, res) => {
            const allOrders = await collection3.find({}).toArray()
            res.send(allOrders)
        })
        app.get('/myOrders/:email', jwtVerify, async (req, res) => {
            const email = req.params.email
            if (req.decoded?.email != email) {
                return
            }
            const myOrders = await collection3.find({ email }).toArray()
            res.send(myOrders)
        })
        app.get('/userData/:email', jwtVerify, async (req, res) => {
            const email = req.params.email;
            if (req.decoded?.email != email) {
                return
            }
            const userData = await collection2.findOne({ email })
            res.send(userData)
        })
        app.get('/getPayment/:orderID', async (req, res) => {
            const orderID = req.params.orderID
            const order = await collection3.findOne({ _id: ObjectId(orderID) })
            res.send(order)
        })
        app.get('/ship/:orderID', async (req, res) => {
            const orderID = req.params.orderID
            await collection3.updateOne({ _id: ObjectId(orderID) }, { $set: { shipped: true, status: 'Shipped' } }, { upsert: true })
            res.send({ message: 'shipped' })
        })
        //post calls
        app.post('/getToken', async (req, res) => {
            const user = req.body.user
            const token = jwt.sign(user, process.env.JWT_SECRET_KEY, { expiresIn: '2d' })
            res.send({ accessToken: token })
        })
        app.post('/create-payment-intent', async (req, res) => {
            const price = req.body.price
            if (!price) {
                return
            }
            const amount = price * 100
            const paymentIntent = await stripe.paymentIntents.create({
                amount: amount,
                currency: 'usd',
                payment_method_types: ['card']
            })
            res.send({ clientSecret: paymentIntent.client_secret })
        })
        app.post('/addUser', async (req, res) => {
            const user = req.body.userCredential
            const userExists = await collection2.findOne({ email: user.email })
            if (!userExists) {
                await collection2.insertOne(user)
            }
            res.send({ message: 'User added' })
        })
        app.post('/addTools', async (req, res) => {
            const tools = req.body.tools
            await collection1.insertOne(tools)
            res.send({ message: 'tools added' })
        })
        app.post('/checkAdmin', jwtVerify, async (req, res) => {
            const email = req.body.email
            if (req.decoded?.email != email) {
                return
            }
            const result = await collection2.findOne({ email })
            if (result?.admin) {
                res.send({ message: true })
            } else {
                res.send({ message: false })
            }
        })

        app.post('/placeOrder', async (req, res) => {
            const order = req.body.order
            order.status = 'To be Paid'
            const result = await collection3.insertOne(order)
            res.send({ orderID: result.insertedId })
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
        app.post('/updatePayment', async (req, res) => {
            const { orderID, transId } = req.body
            const order = await collection3.updateOne(
                { _id: ObjectId(orderID) },
                { $set: { paid: true, transactionID: transId, status: 'Paid' } },
                { upsert: true }
            )
            res.send({ message: 'Payment Completed' })
        })

        app.post('/updateProfile', jwtVerify, async (req, res) => {
            const userCredential = req.body.userCredential
            await collection2.updateOne(
                { email: userCredential.email },
                {
                    $set: {
                        name: userCredential.name,
                        phone: userCredential.phone,
                        address: userCredential.address,
                        education: userCredential.education
                    }
                },
                { upsert: true }
            )
            res.send({ message: 'Profile updated' })
        })
        app.post('/placeOrder', async (req, res) => {
            const review = req.body.review;
            await collection4.insertOne({ review })
            res.send({ message: "Review Added" })
        })
        //delete calls
        app.delete('/deleteTool/:toolID', async (req, res) => {
            const toolID = req.params.toolID
            await collection1.deleteOne({ _id: ObjectId(toolID) })
            res.send({ message: 'Tool Deleted' })
        })
        app.delete('/cancelOrder', async (req, res) => {
            const id = req.body.orderId;
            await collection3.deleteOne({ _id: ObjectId(id) })
            res.send({ message: 'ordered canceled' })
        })
    } finally { }
}
run()
//listen
app.listen(port)
const express = require('express');
const app = express();
const cors = require('cors');
const { ObjectId } = require("mongodb");
require('dotenv').config();
const port = process.env.PORT || 5000;


app.use(cors());
app.use(express.json())

app.get('/', (req,res) => {
    res.send('Summer Camp Running')
})




const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.bioniru.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const classCollection = client.db('schoolDb').collection('classes');
    const instructorsCollection = client.db('schoolDb').collection('instructors');
    const selectedClassCollection = client.db('schoolDb').collection('selectedClass');
    const usersCollection = client.db('schoolDb').collection('users');



    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");


    app.get('/users', async(req, res) => {
        const result = await usersCollection.find().toArray();
        res.send(result)
    })

    app.post('/users', async(req,res) => {
        const user = req.body;
        const query = {email: user.email};
        const existingUser = await usersCollection.findOne(query);
        console.log(user)
        if(existingUser){
            return res.send({message: 'User Already Exists'})
        }
        const result = await usersCollection.insertOne(user);
        res.send(result)
    })

    app.patch('/users/admin/:id', async(req, res) => {
        const id = req.params.id;
        const query = {_id: new ObjectId(id)};
        const updatedDoc = {
            $set: {
                role: 'admin'
            }
        };
        const result = await usersCollection.updateOne(query, updatedDoc);
        res.send(result)
    })
    
    app.patch('/users/instructor/:id', async(req, res) => {
        const id = req.params.id;
        const query = {_id: new ObjectId(id)};
        const updatedDoc = {
            $set: {
                role: 'instructor'
            }
        };
        const result = await usersCollection.updateOne(query, updatedDoc);
        res.send(result)
    })

    app.get('/classes', async(req, res) => {
        const result = await classCollection.find().sort({enrolled_students: -1}).toArray();
        res.send(result)
    })

    app.get('/instructors', async(req, res) => {
        const result = await instructorsCollection.find().toArray();
        res.send(result)
    })

    //selected class
    app.get('/selectedClass', async(req, res) => {
        const result = await selectedClassCollection.find().toArray()
        res.send(result)
    })
    app.post('/selectedClass', async(req, res) => {
        const course = req.body;
        const result = await selectedClassCollection.insertOne(course)
        res.send(result)
    })
    app.delete('/selectedClass/:id', async(req, res) => {
        const id = req.params.id;
        const query = {_id: new ObjectId(id)};
        const result = await selectedClassCollection.deleteOne(query);
        res.send(result)
    })

  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);




app.listen(port, () => {
    console.log(`Summer Camp Running on port: ${port}`)
})
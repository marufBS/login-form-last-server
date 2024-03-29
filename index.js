const { MongoClient } = require('mongodb');
const express = require('express');
const cors = require('cors');
const app = express();
const admin = require("firebase-admin");
require('dotenv').config();

// middleware
app.use(cors());
app.use(express.json());


const port = process.env.PORT || 5000;



const serviceAccount = require("./user-form-875c2-firebase-adminsdk-8487u-ff475783e2.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.iascy.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function verifyToken(req, res, next) {
    if (req.headers?.authorization?.startsWith('Bearer')) {
        const token = req.headers.authorization.split(' ')[1];
        console.log(token);

        try {
            const decodedUser = await admin.auth().verifyIdToken(token);
            req.decodedUserEmail = decodedUser.email;
            console.log('decoded co', decodedUser);
            if (decodedUser) {
                next();
            }
            else {
                res.status(401).json({ message: 'unatharized' })
            }

        }
        catch {

        }
    }

}

async function run() {
    try {
        await client.connect();
        const database = client.db('user_form');
        const usersCollection = database.collection('users');


        app.post('/users', verifyToken, async (req, res) => {
            const user = req.body;
            console.log(user);
            const result = await usersCollection.insertOne(user);
            res.json(result);


        })

        app.put('/users', /* verifyToken, */ async (req, res) => {
            /* console.log(req.body.email);
            const email = req.body.email;
            if (req.decodedUserEmail == email) {
                res.json({ message: 'valid user' })
            }
            else {
                res.status(401).json({ message: 'unauthurized access' })
            } */
        })

        app.get('/users', async (req, res) => {
            const cursor = usersCollection.find({});
            const users = await cursor.toArray();
            res.json(users);
        })

    }
    finally {
        // await client.close();
    }
}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.json('Hello Form Backend')
});

app.listen(port, () => {
    console.log(' lintening at', port);
})

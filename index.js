const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const Port = process.env.PORT || 5000;
const cors = require('cors');
require('dotenv').config()

app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
    res.send('hello world')
})

const uri = process.env.DB_URI;

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
        const Database = client.db('Programmer_Xpress')

        const CategoryData = Database.collection('Category');
        const ProjectData = Database.collection('Data');


        const DictionaryData = Database.collection('Dictionary_Category_Data')
        const MainData = Database.collection('Main_Data')
        const Word = Database.collection('word')
        const Sentence = Database.collection('sentence')

        // letter api
        app.get('/dictionary_category', async (req, res) => {
            const query = {};
            const result = await DictionaryData.find(query).toArray()
            res.send(result)
        })
        // sentence api
        app.get('/sentence', async (req, res) => {
            const word = req.query.word;
            const query = {
                sentence: new RegExp(word)
            }
            console.log(query);
            const data = await Sentence.find(query).toArray()
            res.send(data)
        })

        //word api
        app.get('/word', async (req, res) => {
            const firstLetter = req.query.letter;
            const query = {
                word: { $regex: new RegExp(`^${firstLetter}`) }
            }
            const result = await Word.find(query).toArray()
            res.send(result)
        })

        //sentence save api
        app.post('/data-save', async (req, res) => {
            const data = req.body;
            // console.log(data);
            const result = await Sentence.insertMany(data);
            // console.log(result);
            res.send(result)
        })

        // word save api
        app.post('/word-save', async (req, res) => {
            const data = req.body;
            const query = {
                word: data.word
            }
            const filter = await Word.findOne(query)
            if (filter) {
                const err = { message: 'word all Ready added' }
                return res.send(err)
            }
            const result = await Word.insertOne(data)
            res.send(result)
        })

    } finally {

    }
}
run().catch(err => console.log(err))


app.listen(Port, () => {
    console.log(`server is running on ${Port}`);
})

module.exports = app;
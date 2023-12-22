const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const Port = process.env.PORT || 5000;
const cors = require('cors');
require('dotenv').config()

app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
    res.send({ data: 'hello world' })
})

const uri = process.env.DB_URI;
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});


function DataCustomize(Letter, words, AllSentence) {
    // console.log(Letter);
    let allData = [];
    Letter.map((l) => {
        switch (l.letter) {
            case 'a':
                let a = {
                    ...l,
                    words: [
                        ...wordsFinds('a', words, AllSentence),
                    ]
                };
                allData.push(...allData, a);

            case 'b':
                let b = {
                    ...l,
                    words: [
                        ...wordsFinds('b', words, AllSentence),
                    ]
                };
                allData.push(...allData, b);


            default:
                break;
        }
        allData.push()
    })
    return allData;
}


const wordsFinds = (l, word, AllSentence) => {

    const WordData = word.map(item => ({
        ...item,
    }))
    const FindWords = word.filter(item => {
        return item['word'].toLowerCase().startsWith(l.toLowerCase())
    });
    const completedFind = FindWords.map(item => {

        return {
            ...item,
            sentences: [
                ...sentenceFind(item.word, AllSentence),
            ]
        }
    })
    return completedFind;
}


const sentenceFind = (word, AllSentence) => {
    const regex = new RegExp(`\\b${word}\\b`, 'i');
    const sen = AllSentence.filter(item => regex.test(item.sentence.split(/[.!?]/)))
    // let firstObject = sen[0];
    // let secondObject = sen[1];
    // let thirdObject = sen[2];

    return sen
}

async function run() {
    try {
        const Database = client.db('Programmer_Xpress')

        // const CategoryData = Database.collection('Category');
        // const ProjectData = Database.collection('Data');

        const Letters = Database.collection('Dictionary_Category_Data')
        const Words = Database.collection('word')
        const Sentence = Database.collection('sentence')

        app.get('/all-data', async (req, res) => {
            const query = {}
            const Letter = await Letters.find({}).toArray()
            const AllWords = await Words.find(query).toArray()
            const AllSentence = await Sentence.find(query).toArray()
            if (Letter && AllWords && AllSentence) {
                const result = DataCustomize(Letter, AllWords, AllSentence);
                res.send({ count: result[0].words.length, result })
            }
            // res.send({ err: 'error' })
        })


        // letter api
        app.get('/letter', async (req, res) => {
            const query = {};
            const result = await Letter.find(query).toArray()
            res.send(result)
        })
        // sentence api
        app.get('/sentence', async (req, res) => {
            const word = req.query.word;
            const query = {
                sentence: new RegExp(word)
            }
            // console.log(query);
            const data = await Sentence.find(query).toArray()
            res.send(data)
        })

        //word api
        app.get('/word', async (req, res) => {
            const firstLetter = req.query.letter;
            const query = {
                word: { $regex: new RegExp(`^${firstLetter}`) }
            }
            const result = await Words.find(query).toArray()
            res.send(result)
        })

        app.get('/all-word', async (req, res) => {
            const perPage = parseInt(req.query.perPage);
            const pageNumber = parseInt(req.query.pageNumber);
            const query = {};
            const count = await Words.estimatedDocumentCount()
            const skip = (pageNumber - 1) * perPage
            const data = await Words.find(query).skip(skip).limit(perPage).toArray()
            res.send({ words: data, count: count })
        })

        // json format change 
        // app.post('/change-format', async (req, res) => {
        //     const query = {}
        //     const doc = {
        //         $set: { pronunciation: '' },
        //     }
        //     const result = await Word.updateMany(query, doc, { upsert: true })
        //     res.send(result)
        // })

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
            const filter = await Words.findOne(query)
            if (filter) {
                const err = { message: 'word all Ready added' }
                return res.send(err)
            }
            const result = await Words.insertOne(data)
            res.send(result)
        })



        app.post('/update', async (req, res) => {
            // try {
            const data = {
                ...req.body,
                _id: new ObjectId(req.body._id)
            }

            const query = { _id: new ObjectId(data._id) };
            const result = await Words.findOne(query);

            if (result) {
                if (JSON.stringify(data) !== JSON.stringify(result)) {
                    const dataUpdate = await Words.updateOne(query, { $set: { ...data } }, { upsert: true })
                    console.log(dataUpdate);
                    res.send(dataUpdate);
                } else {
                    // If data is the same as the existing record, you might want to handle it differently
                    res.send({ message: 'Data is the same, no update needed.' });
                }
            } else {
                res.send({ err: 'Record not found' });
            }
            // } 
            // catch (error) {
            //     // Handle other errors
            //     console.error(error);
            //     res.status(500).send({ error: 'Internal Server Error' });
            // }
        });


        // app.post('/update', async (req, res) => {
        //     const data = {
        //         ...req.body,
        //         _id: new ObjectId(req.body._id)
        //     }
        //     const query = { _id: new ObjectId(data._id) };
        //     const result = await Words.findOne(query);
        //     if (result) {
        //         if (JSON.stringify(data) !== JSON.stringify(result)) {
        //             const dataUpdate = await Words.updateOne(query, { $set: { ...data } }, { upsert: true })
        //             res.send(dataUpdate)
        //         }
        //         else {
        //             // If data is the same as the existing record, you might want to handle it differently
        //             res.send({ message: 'Data is the same, no update needed.' });
        //         }
        //     }
        //     res.send({ err: 'err' })

        // })

        // app.get('/data-check', async (req, res) => {
        //     const query = {}
        //     const result = await Sentence.find(query).toArray()
        //     res.send({ result: result.length })
        // })
        // app.delete('/delete', async (req, res) => {
        //     const query = {}
        //     const result = await Sentence.deleteMany(query)
        //     res.send(result)
        // })

    } finally {

    }
}
run().catch(err => console.log(err))


app.listen(Port, () => {
    console.log(`server is running on ${Port}`);
})

module.exports = app;
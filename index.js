const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const Port = process.env.PORT || 5500;
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

        // MY Blog API DATA
        // app.get('/category', async (req, res) => {
        //     const query = {}
        //     const result = await CategoryData.find(query).toArray()
        //     // console.log(result);
        //     res.send(result);
        // })

        // // app.post('/delete', async (req, res) => {
        // //     const query = {};
        // //     const result = await CategoryData.updateMany(query,)
        // //     res.send(result)
        // // })
        // app.get('/project', async (req, res) => {
        //     const params = req.query;
        //     const pageNumber = parseInt(params.pageNumber);
        //     const perPage = parseInt(params.perPage);
        //     const query = {};
        //     const dataCount = await ProjectData.estimatedDocumentCount();
        //     const skip = (pageNumber - 1) * perPage;
        //     const result = await ProjectData.find(query).skip(skip).limit(perPage).toArray()
        //     res.send({ dataCount, result })
        // })

        // app.get('/project/:id', async (req, res) => {
        //     const title = req.params.id;
        //     const currentPage = parseInt(req.query.currentPage);
        //     const perPage = parseInt(req.query.perPage);

        //     const query = { category_project: title };
        //     const skipData = perPage * (currentPage - 1);

        //     const count = await ProjectData.find(query).toArray()

        //     const result = await ProjectData.find(query).skip(skipData).limit(perPage).toArray()
        //     // console.log(result);
        //     res.send({ count: count.length, result })
        // })

        // app.get('/details', async (req, res) => {
        //     const id = req.query.id;
        //     const query = { _id: new ObjectId(id) }
        //     const result = await ProjectData.findOne(query)
        //     res.send(result)
        // })
        // API DATA END

        const DictionaryData = Database.collection('Dictionary_Category_Data')
        const MainData = Database.collection('Main_Data')
        app.get('/dictionary_category', async (req, res) => {
            const query = {};
            const result = await DictionaryData.find(query).toArray()
            res.send(result)
        })

        app.get('/dictionary-word/:id', async (req, res) => {
            const Category = req.params.id;
            const query = {
                category: Category,
            }
            const result = await MainData.find(query).toArray()
            // console.log(result);
            res.send(result)
        })


        // app.post('/updatedata/:id', async (req, res) => {
        //     const data = req.params.id;
        //     const query = {
        //         category: 'D'
        //     }
        //     const updateData = {
        //         $set: {
        //             category: data
        //         }
        //     }
        //     const result = await MainData.updateOne(query, updateData, { upsert: true })
        //     console.log(result);
        //     res.send(result)
        // })


    } finally {

    }
}
run().catch(err => console.log(err))


app.listen(Port, () => {
    console.log(`server is running on ${Port}`);
})
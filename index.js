const express = require('express');
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
const cors = require('cors');
require('dotenv').config();

const port = process.env.PORT || 5000;
const app = express();
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.eeiu8.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;


// console.log('mogno  :',uri);
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


async function run() {
    try {
        await client.connect();
        const database = client.db("Tourblogs");
        const blogsCollection = database.collection('blogs');
        const reviewCollection = database.collection('review');
        // const customerReviewCollection = database.collection('review');
        const userCollection = database.collection('user');




        // Get api
        app.get('/blogs', async (req, res) => {
            console.log(req.query);
            const filter = req.query.filter;
            if (filter === '' || filter === 'all' || (!filter)) {
                backendFilter = { status: "approved" }
            }
            else {
                backendFilter = { status: "approved", transportation: `${filter}` }
            }
            const cursor = blogsCollection.find(backendFilter)

            const page = req.query.page;
            const size = parseInt(req.query.size);
            let blogs;
            const count = await cursor.count()
            if (page) {
                blogs = await cursor.skip(page * size).limit(size).toArray()
            }
            else {
                blogs = await cursor.toArray();
            }

            res.send({

                count,
                blogs
            });

        })

        // Get single blog

        app.get('/blogs/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const blog = await blogsCollection.findOne(query);
            res.json(blog)

        })


        // // make review 
        app.post('/addReview', async (req, res) => {
            const orders = req.body
            delete orders._id
            const result = await reviewCollection.insertOne(req.body)
            res.send(result)
        })




        // get review

        app.get('/review/:id', async (req, res) => {
            const result = await reviewCollection.find({ blogId: req.params.id }).toArray()
            res.send(result)
        })




        // // get my blogs

        app.get('/myOrder/:email', async (req, res) => {
            const result = await blogsCollection.find({ email: req.params.email }).toArray()
            res.send(result)
        })



        // get all orders 
        app.get('/allBlogs', async (req, res) => {
            const cursor = blogsCollection.find({});
            const result = await cursor.toArray();
            res.send(result);
        })


        // // get all review

        // app.get('/review', async (req, res) => {
        //     const cursor = customerReviewCollection.find({});
        //     const review = await cursor.toArray();
        //     res.send(review);
        // })




        // delete my blog 

        app.delete('/cancelOrder/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await blogsCollection.deleteOne(query);
            res.json(result);


        })





        // add user info
        app.post("/addUserInfo", async (req, res) => {
            const result = await userCollection.insertOne(req.body)
            res.send(result)
        })



        // POST blogs
        app.post('/blogs', async (req, res) => {
            const blog = req.body;
            const result = await blogsCollection.insertOne(blog);
            res.json(result);

        });


        // Delete blog 

        app.delete('/blogs/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await blogsCollection.deleteOne(query);
            res.json(result);


        })


        // make a user admin 
        app.put("/makeAdmin", async (req, res) => {

            const filter = { email: req.body.email };
            const result = await userCollection.find(filter).toArray();
            if (result) {
                const documents = await userCollection.updateOne(filter, {
                    $set: { role: "admin" },
                });
            }

        });


        // check admin or not 
        app.get("/checkAdmin/:email", async (req, res) => {
            const result = await userCollection
                .find({ email: req.params.email })
                .toArray();

            res.send(result);
        });



        // update order status 

        app.put("/statusUpdate/:id", async (req, res) => {

            const filter = { _id: ObjectId(req.params.id) };

            const result = await blogsCollection.updateOne(filter, {
                $set: {
                    status: req.body.status,
                },
            });
            res.send(result);
        });
    }
    finally {
        // await client.close()
    }
}

run().catch(console.dir);



app.get('/', (req, res) => {
    res.send('Running Server')

});

app.listen(port, () => {
    console.log('Running server is port', port);
});
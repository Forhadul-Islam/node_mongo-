const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;
require('dotenv').config()


const app = express();
app.use(cors());
// parse application/json
app.use(bodyParser.json())
    +
    app.get('/', (req, res) => {
        res.send('Thank you for calling me')
    })

// database connection
const uri = process.env.DB_PATH;
let client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


//Loading data(products) from database for home page 
app.get('/products', (req, res) => {
    client.connect(err => {
        const collection = client.db("onlineStore").collection("products");
        // collection.find().limit(10).toArray((err, document) => {
        collection.find().toArray((err, document) => {
            if (err) {
                console.log('failed to load data');
                res.send({ message: err });
            } else {
                res.send(document);
            }
        })
    })
    // client.close();

})


app.get('/products/:key', (req, res) => {
    // console.log(req.params)
    const key = req.params.key;
    client.connect(err => {
        const collection = client.db("onlineStore").collection("products");
        collection.find({ key }).toArray((err, document) => {
            if (err) {
                console.log('failed to load data');
                res.send({ message: err });
            } else {
                res.send(document[0]);
            }
        })
    })

});

//for loading data for review page
app.post('/getProductByKey', (req, res) => {
    const productKey = req.body;
    console.log(productKey);
    client.connect(err => {
        const collection = client.db("onlineStore").collection("products");
        collection.find({ key: { $in: productKey } }).toArray((err, documents) => {
            if (err) {
                console.log('failed to load data');
                res.send({ message: err });
            } else {
                // console.log(document)
                res.send(documents);
            }
        })
    })

})

// posting user email and cart (placeOrder)
app.post('/placeOrder', (req, res) => {
    const orderDetails = req.body;
    orderDetails.orderTime = new Date();
    console.log(orderDetails)
    client.connect(err => {
        const collection = client.db("onlineStore").collection("orders");
        collection.insertOne(orderDetails, (error, result) => {
            if (error) {
                console.log(error);
                res.send({ message: error });
            } else {
                res.send(result.ops[0]);
            }
        })
    })
})

//API for courses
const courses = [
    { Course: "HTML", id: 1 },
    { Course: "CSS", id: 2 },
    { Course: "JS", id: 3 },
]
app.get('/course/:id', (req, res) => {
    // res.send(req.params.id)
    const course = courses.find(c => c.id === parseInt(req.params.id));
    if (!course) res.status(404).send('The course you wanted is not found');
    else res.send(course);
});

//post data

app.post('/addProducts', (req, res) => {
    // console.log("data received", req.body);
    const product = req.body;
    client.connect(err => {
        const collection = client.db("onlineStore").collection("products");
        collection.insertMany(product, (err, result) => {
            if (err) {
                console.log(err);
                res.status(500).send({ message: err });
            }
            else {
                res.send(result.ops[0]);
            }
        })
        console.log('database connected');
        // client.close();
    });
})

const port = process.env.PORT || 4200
app.listen(port, () => console.log("listening to port 4200"));
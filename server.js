const express = require('express');
const bodyparser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');



mongoose.connect('mongodb+srv://shubham321raj:nikhil4840@cluster0.lcexdtm.mongodb.net/roxilersystems?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true });
const connection = mongoose.connection;
connection.once('open', function() {
    console.log("MongoDB database connection established successfully");
    
});

const app = express();
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: false }));
app.use(cors());
var data;
const storeData=async()=>{
    const response = await fetch('http://s3.amazonaws.com/roxiler.com/product_transaction.json');
    data = await response.json();

    console.log(data.length);
}
const transaction = new mongoose.Schema({

    id: {
        type: Number,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    description: {
        type: String,

    },
    category: {
        type: String,
        required: true
    },
    image: {
        type: String,
    },
    sold: {
        type: Boolean,
        default: false
    },
    dateOfSale: {
        type: Date,
    }
});
const Transaction = mongoose.model('Transaction', transaction);



async function getPosts() {
    for (let i = 0; i < data.length; i++) {
        const product = new Transaction({
            id: data[i].id,
            title: data[i].title,
            price: data[i].price,
            description: data[i].description,
            category: data[i].category,
            image: data[i].image,
            sold: data[i].sold,
            dateOfSale: data[i].dateOfSale
        });
        try {
            const savedProduct = await product.save();
            console.log(savedProduct);
        } catch (err) {
            console.log(err);
        }
    }
}
// API to initialise database
app.get('/products', async(req, res) => {
    getPosts();
    const products = await Transaction.find();
    res.send(products);
});


// GET API to list all transactions with search and pagination
app.get('/transactions', async (req, res) => {
   
    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.perPage) || 10;
    const search = req.query.search;

    // Build the search query
    const searchQuery = search
        ? {
            $or: [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
                
            ],
        }
        : {};

    try {
        // Fetch transactions based on search and pagination
        const transactions = await Transaction.find(searchQuery)
            .skip((page - 1) * perPage)
            .limit(perPage);

        res.send(transactions);
    } catch (error) {
        console.error('Error fetching transactions:', error);
        res.status(500).send('Internal Server Error');
    }
});



// API for statistics
app.get('/salesMonth', async(req, res) => {
    const map1 = new Map();
    map1.set("January", "01");
    map1.set("February", "02");
    map1.set("March", "03");
    map1.set("April", "04");
    map1.set("May", "05");
    map1.set("June", "06");
    map1.set("July", "07");
    map1.set("August", "08");
    map1.set("September", "09");
    map1.set("October", "10");
    map1.set("November", "11");
    map1.set("December", "12");
    var search = req.query.keyword;
    search.toString();

    // if (!map1.has(search)) {
    //     return res.status(400).send('Invalid month keyword');
    // }

    let sales = 0,
        soldItems = 0,
        totalItems = 0;
    
    for (let i = 0; i < data.length; i++) {
        let originalString = data[i].dateOfSale;
        let sold = data[i].sold;
        originalString.toString();
        let text = originalString.substring(5, 7);
        if (text == search) {
            sales += data[i].price;
            totalItems += 1;
            if (sold == true)
                soldItems += 1;
        }
    }
    res.json({totalSales:sales, 
        totalSoldItems:soldItems, 
        totalNotSoldItems:totalItems-soldItems});
});



// API for bar chart
app.get('/barChart', (req, res) => {
    const map1 = new Map();
        map1.set("January", "01");
        map1.set("February", "02");
        map1.set("March", "03");
        map1.set("April", "04");
        map1.set("May", "05");
        map1.set("June", "06");
        map1.set("July", "07");
        map1.set("August", "08");
        map1.set("September", "09");
        map1.set("October", "10");
        map1.set("November", "11");
        map1.set("December", "12");
        var search = req.query.keyword;
        search.toString();

   

    const selectedMonthNumber = search;
    const map2 = new Map([
        [100, 0],
        [200, 0],
        [300, 0],
        [400, 0],
        [500, 0],
        [600, 0],
        [700, 0],
        [800, 0],
        [900, 0],
        [1000, 0]
    ]);

    for (const transaction of data) {
        const originalString = transaction.dateOfSale;
        const sold = transaction.sold;

        if (originalString.substring(5, 7) === selectedMonthNumber) {
            const price = transaction.price;

            for (const [range, count] of map2) {
                if (price < range) {
                    map2.set(range, count + 1);
                    
                }
            }
        }
    }

    //res.setHeader('Content-Type', 'text/html');
    //res.write(`<h2>Price range and the number of items in that range for the selected month regardless of the year</h2>`);
    var obj=[];
    for (const [key, value] of map2) {
        obj.push({key:key,value:value})
    }
    res.json({obj});
});





// API for piechart

app.get('/pieChart', (req, res) => {
    const monthMap = {
        "January": "01",
        "February": "02",
        "March": "03",
        "April": "04",
        "May": "05",
        "June": "06",
        "July": "07",
        "August": "08",
        "September": "09",
        "October": "10",
        "November": "11",
        "December": "12"
    };

    const search = req.query.keyword;
    const targetMonth = monthMap[search] || search;  // Use the mapped value if available, otherwise use the original

    const map2 = new Map();

    for (let i = 0; i < data.length; i++) {
        const originalString = data[i].dateOfSale;
        const text = originalString.substring(5, 7);

        if (text === targetMonth) {
            const category = data[i].category;

            if (!map2.has(category)) {
                map2.set(category, 0);
            }

            map2.set(category, map2.get(category) + 1);
        }
    }

    // res.setHeader('Content-Type', 'text/html');
    // res.write(`<h2>Unique categories and number of items from that category for the selected month</h2>`);
    var obj={};
    for (let [key, value] of map2) {
        obj[`${key}`]=value;
    }

    res.json(obj);
});

// Combined Data API
app.get('/combinedData', async (req, res) => {
    try {
        const keyword = req.query.keyword;

        const salesMonthData = await fetch(`http://localhost:${port}/salesMonth?keyword=${keyword}`).then(async(res) =>await res.json());
        const barChartData = await fetch(`http://localhost:${port}/barChart?keyword=${keyword}`).then(async(res) =>await res.json());
        const pieChartData = await fetch(`http://localhost:${port}/pieChart?keyword=${keyword}`).then(async(res) =>await res.json());
        
        const combinedData = {
            salesMonthData,
            barChartData,
            pieChartData,
        };

        res.json(combinedData);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});



const port = 3000;
app.listen(port, () =>{storeData();
     console.log(`Hello world app listening on port ${port}!`)});
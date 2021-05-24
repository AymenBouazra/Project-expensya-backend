const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const bodyParser = require('body-parser');
const dotenv = require('dotenv')
dotenv.config({debug: process.env.DEBUG});
const port = 3000;

const app = express()
app.use(cors());
app.use(morgan('dev'));
app.use(bodyParser.json({limit: "52428800"}));
app.use(bodyParser.urlencoded({limit: "52428800", extended: true, parameterLimit:50000}));
app.use(express.json());
app.use(express.urlencoded({extended:false}));

//import connection to database
const connect = require('./database/connect');

//import routing
const headerAPI = require('./routes/headerAPI');
app.get('/', async (req, res) => {
    res.json({message: "Hello World!"});
});
//use routing
app.use('',headerAPI);

app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`);
});
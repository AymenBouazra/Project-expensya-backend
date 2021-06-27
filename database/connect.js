const mongoose = require('mongoose');
const option = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
};
const local='mongodb://localhost:27017/Expensya'
const prod='mongodb+srv://Expensya-admin:Expensya@cluster0.3yws1.mongodb.net/test'

mongoose.connect('mongodb+srv://Expensya-admin:Expensya@cluster0.3yws1.mongodb.net/test', option).then(success =>{
    console.log("Successfully connected to database!");
}).catch(error =>{
    console.log("Error in connection to database!");
});
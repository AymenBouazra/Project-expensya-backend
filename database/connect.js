const mongoose = require('mongoose');
const option = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
};
const local='mongodb://localhost:27017/Expensya'
const prod='mongodb+srv://Expensya-admin:Expensya@cluster0.3yws1.mongodb.net/test'

<<<<<<< HEAD
mongoose.connect('mongodb+srv://Expensya-admin:Expensya@cluster0.3yws1.mongodb.net/test', option).then(success =>{
=======
mongoose.connect(prod, option).then(success =>{
>>>>>>> 38619e2686981fd3e62001e950f2b0c2b5f7a75f
    console.log("Successfully connected to database!");
}).catch(error =>{
    console.log("Error in connection to database!");
});
const mongoose = require('mongoose');
const login = mongoose.Schema({
    Email: String,
    Password: String
},
 {
    versionKey: false,
    timestamps: true
})
module.exports = mongoose.model('login', login);
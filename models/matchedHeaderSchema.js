const mongoose = require('mongoose');
const matchedHeaders = mongoose.Schema({
   key: String,
   matchedKey: String 
}, {
    versionKey: false,
    timestamps: true
})

module.exports = mongoose.model('matchedHeaders', matchedHeaders)
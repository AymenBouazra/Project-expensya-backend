const mongoose = require('mongoose');
const headerSchema = mongoose.Schema({
    matchingString: [],
    header: String,
}
    , {
        versionKey: false,
        timestamps: true
    })
module.exports = mongoose.model('header', headerSchema);
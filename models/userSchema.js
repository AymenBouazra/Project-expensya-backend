const mongoose = require('mongoose');
const userSchema = mongoose.Schema({
    lastname: String,
    firstname: String,
    language: String,
    payid: String,
    payid2: String,
    payid3: String,
    payid4: String,
    payid5: String,
    payid6: String,
    mail: String,
    managermail: String,
    managerpayid: String,
    isadmin: String,
    isaccountant: String,
    tags: String,
    localcountry: String,
    localcurrency: String,
    reviewermail: String,
    reviewerPayId: String,
    defaultprojectexternalid: String,
    isactive: String,
    mailalias: String,
    mileagerate: String,
    ikreference: String,
}
    , {
        versionKey: false,
        timestamps: true
    })
module.exports = mongoose.model('users', userSchema);
const mongoose = require('mongoose');
const header = mongoose.Schema({
    LastName: String,
    FirstName: String,
    Language: String,
    PayId: String,
    PayId2: String,
    PayId3: String,
    PayId4: String,
    PayId5: String,
    PayId6: String,
    Mail: String,
    ManagerMail: String,
    ManagerPayId: String,
    IsAdmin: String,
    IsAccountant: String,
    Tags: String,
    LocalCountry: String,
    LocalCurrency: String,
    ReviewerMail: String,
    ReviewerPayId: String,
    DefaultProjectExternalId: String,
    IsActive: String,
    MailAlias: String,
    MileageRate: String,
    IKReference: String,
}
    , {
        versionKey: false,
        timestamps: true
    })
module.exports = mongoose.model('header', header);
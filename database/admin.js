const login = require('../models/adminLoginSchema');
// const env = require('dotenv')
login.countDocuments().then(account => {
    if (account == 0) {
        login.create(
            { Email: process.env.EMAIL, Password: process.env.PASSWORD}
        )
    }
})

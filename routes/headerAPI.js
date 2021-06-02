const express = require('express');
const router = express.Router();
const Users = require('../models/userSchema');
const multer = require('multer');
const path = require('path');
const csv = require('csv-parser');
const parser = require('simple-excel-to-json');
const translate = require('@vitalets/google-translate-api');
const fs = require('fs');
const match = require('fuzzball');
let results = [];
const choices = [
    "LastName",
    "FirstName",
    "Language",
    "PayId",
    "PayId2",
    "PayId3",
    "PayId4",
    "PayId5",
    "PayId6",
    "Mail",
    "ManagerMail",
    "ManagerPayId",
    "IsAdmin",
    "IsAccountant",
    "Tags",
    "LocalCountry",
    "LocalCurrency",
    "ReviewerMail",
    "ReviewerPayId",
    "DefaultProjectExternalId",
    "IsActive",
    "MailAlias",
    "MileageRate",
    "IKReference"
]
const date= new Date()
const myStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const folder = path.resolve('./uploads');
        cb(null, folder);
    },
    filename: async (req, file, cb) => {
        const extension = path.extname(file.originalname);
        const newFileName = Date.now() + extension;
        const fileLink = 'http://localhost:3000/uploads/' + newFileName;
        cb(null, newFileName);
    }
});
const myFileFilter = (req, file, cb) => {
    const allowedFileExtensions = ['.csv', '.xlsx', '.xls'];
    const extension = path.extname(file.originalname);
    cb(null, allowedFileExtensions.includes(extension));
}
const upload = multer({
    storage: myStorage,
    fileFilter: myFileFilter,
});

router.post('/uploadFile', upload.single('file'), async (req, res) => {
    if (req.file == undefined) {
        res.status(400).json({ message: 'File not found!' })
    } else {

        if (path.extname(req.file.filename) === ".csv") {
            fs.createReadStream(path.resolve(`./uploads/${req.file.filename}`))
                .pipe(csv())
                .on('data', (data) => results.push(data))
                .on('end', async () => {
                    const keys = Object.keys(results[0]);
                    //translate
                    let arrayWithScore = [];
                    let headerClient = [];
                    await Promise.all(keys.map(async (key) => {
                        const res = await translate(key, { to: 'en' })
                        await arrayWithScore.push(match.extract(res.text, choices, {sortBySimilarity: true}))
                        await headerClient.push(key)
                    }))
                    await arrayWithScore.push(headerClient);
                    res.json(arrayWithScore)
                })
        } else {
            const results = parser.parseXls2Json(path.resolve(`./uploads/${req.file.filename}`));
            const keys = Object.keys(results);
            console.log(keys);
            res.status(201).json(results)
        }
    }
})
router.get('/header', async (req, res) => {
    res.json({ message: 'Successfully got header' })
});

module.exports = router;
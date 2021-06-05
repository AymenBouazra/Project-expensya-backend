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
const date = new Date()
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
        // console.log(req.file.filename);

        if (path.extname(req.file.filename) === ".csv") {
            fs.createReadStream(path.resolve(`./uploads/${req.file.filename}`))
                .pipe(csv())
                .on('data', (data) => results.push(data))
                .on('end', async () => {
                    const keys = Object.keys(results[0]);
                    const value = Object.values(results[0]);
                    const keys2 = Object.keys(results);
                    // console.log(keys);
                    // console.log(keys2);
                    // console.log(value);
                    //translate
                    let arrayWithScore = [];
                    let headerClient = [];
                    let keyMatched = []
                    let scoreMatched = [];
                    await Promise.all(keys.map(async (key) => {
                        if (key !== "") {
                            const res = await translate(key, { to: 'en' })
                            if (match.extract(res.text, choices, { sortBySimilarity: true })[0][1] == 100) {
                                keyMatched.push(key)
                                scoreMatched.push(match.extract(res.text, choices, { sortBySimilarity: true })[0])
                            } else {
                                arrayWithScore.push(match.extract(res.text, choices, { sortBySimilarity: true }))
                                headerClient.push(key)
                            }
                        }
                    }))
                    arrayWithScore.push(headerClient, keyMatched, scoreMatched,req.file.filename);
                    res.json(arrayWithScore)
                })
        } else {
            results = parser.parseXls2Json(path.resolve(`./uploads/${req.file.filename}`));
            const keys = Object.keys(results[0][0]);
            let arrayWithScore = [];
            let headerClient = [];
            let keyMatched = []
            let scoreMatched = [];
            await Promise.all(keys.map(async (key) => {
                if (key !== "") {
                    const res = await translate(key, { to: 'en' })
                    if (match.extract(res.text, choices, { sortBySimilarity: true })[0][1] == 100) {
                        keyMatched.push(key)
                        scoreMatched.push(match.extract(res.text, choices, { sortBySimilarity: true })[0])
                    } else {
                        arrayWithScore.push(match.extract(res.text, choices, { sortBySimilarity: true }))
                        headerClient.push(key)
                    }
                }

            }))
            arrayWithScore.push(headerClient, keyMatched, scoreMatched);
            res.json(arrayWithScore)
            console.log(arrayWithScore);
        }
    }
})
router.post('/readFile/:filename', async(req, res) => {
    if (path.extname(req.params.filename) === ".csv" ) {
        fs.createReadStream(path.resolve(`./uploads/${req.params.filename}`))
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', async () =>{
            res.json(results)
        })
    }else{
        results = parser.parseXls2Json(path.resolve(`./uploads/${req.params.filename}`));
        res.json(results)
    }
})
router.get('/header', async (req, res) => {
    res.json({ message: 'Successfully got header' })
});

module.exports = router;
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
let importedData = []
let tab = []
const choices = [
    "lastname",
    "firstname",
    "language",
    "payid",
    "payid2",
    "payid3",
    "payid4",
    "payid5",
    "payid6",
    "mail",
    "managermail",
    "managerpayid",
    "isadmin",
    "isaccountant",
    "tags",
    "localcountry",
    "localcurrency",
    "reviewermail",
    "revieweriayid",
    "defaultprojectexternalid",
    "isactive",
    "mailalias",
    "mileagerate",
    "ikreference"
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
        console.log(req.file.filename);

        if (path.extname(req.file.filename) === ".csv") {
            fs.createReadStream(path.resolve(`./uploads/${req.file.filename}`))
                .pipe(csv())
                .on('data', (data) => results.push(data))
                .on('end', async () => {
                    const keys = Object.keys(results[0]);
                    let headersNotMatched = [];
                    let headersMatched = [];
                    await Promise.all(keys.map(async (key) => {
                        if (key !== "") {
                            if (choices.includes(key.toLowerCase())) {
                                headersMatched.push({ key: key, matchedKey: key.toLowerCase() })
                            } else {
                                const translatedKey = await translate(key.toLowerCase(), { to: 'en' });
                                const similarityOfKey = await match.extractAsPromised(translatedKey.text, choices, { sortBySimilarity: true });
                                headersNotMatched.push({ key: key, similarityOfKey: similarityOfKey });
                            }
                        }
                    }))
                    res.json({ headersNotMatched: headersNotMatched, headersMatched: headersMatched, filename: req.file.filename })
                })
        } else {
            results = parser.parseXls2Json(path.resolve(`./uploads/${req.file.filename}`));
            const keys = Object.keys(results[0][0]);
            let headersNotMatched = [];
            let headersMatched = [];
            await Promise.all(keys.map(async (key) => {
                if (choices.includes(key.toLowerCase())) {
                    // is matched
                    headersMatched.push({ key: key, matchedKey: key.toLowerCase() })
                } else {
                    // is not matched
                    const translatedKey = await translate(key.toLowerCase(), { to: 'en' });
                    const similarityOfKey = await match.extractAsPromised(translatedKey.text, choices, { sortBySimilarity: true })
                    headersNotMatched.push({ key: key, similarityOfKey: similarityOfKey })

                }
            }))
            res.json({ headersNotMatched: headersNotMatched, headersMatched: headersMatched, filename: req.file.filename })
        }
    }
})

router.post('/startImport/:filename', async (req, res) => {
    console.log(req.body);
    console.log(req.params.filename);
    if (path.extname(req.params.filename) === ".csv") {
        fs.createReadStream(path.resolve(`./uploads/${req.params.filename}`))
            .pipe(csv())
            .on('data', (data) => { importedData.push(data) })
            .on('end', async () => {
                // console.log(importedData);
                const keys = Object.keys(importedData[0])
                console.log(keys);
                let c = 0
                for (let i = 0; i < importedData.length; i++) {
                    for (let j = 0; j < req.body.length; j++) {
                        c = 0
                        while (c <= Object.keys(importedData[i]).length) {
                            if (Object.keys(importedData[i])[c] == req.body[j].key) {

                                importedData[i][req.body[j].matchedKey] = importedData[i][Object.keys(importedData[i])[c]]
                                delete importedData[i][Object.keys(importedData[i])[c]]
                            }
                            c++
                        }
                    }
                }
                console.log(importedData);
                const users =await Users.insertMany(importedData);
                res.json(users)
            })
    }
    else {
        importedData = parser.parseXls2Json(path.resolve(`./uploads/${req.params.filename}`));
        res.json(importedData)
    }
});

module.exports = router;
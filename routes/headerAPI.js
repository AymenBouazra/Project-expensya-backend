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
        // console.log(req.file.filename);

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
                                headersMatched.push({ key: key, score: 100 })
                            } else {
                                const translatedKey = await translate(key.toLowerCase(), { to: 'en' });
                                const similarityOfKey = await match.extractAsPromised(translatedKey.text, choices, { sortBySimilarity: true });
                                headersNotMatched.push({ key: key, similarityOfKey: similarityOfKey });
                            }
                        }
                    }))
                    res.json({ headersNotMatched: headersNotMatched, headersMatched: headersMatched })
                })
        } else {
            results = parser.parseXls2Json(path.resolve(`./uploads/${req.file.filename}`));
            const keys = Object.keys(results[0][0]);
            let headersNotMatched = [];
            let headersMatched = [];
            await Promise.all(keys.map(async (key) => {
                if (choices.includes(key.toLowerCase())) {
                    // is matched
                    headersMatched.push({ key: key, score: 100 })
                } else {
                    // is not matched
                    const translatedKey = await translate(key.toLowerCase(), { to: 'en' });
                    const similarityOfKey = await match.extractAsPromised(translatedKey.text, choices, { sortBySimilarity: true })
                    headersNotMatched.push({ key: key, similarityOfKey: similarityOfKey })

                }
            }))
            res.json({ headersNotMatched: headersNotMatched, headersMatched: headersMatched })
        }
    }
})
router.post('/readFile/:filename', async (req, res) => {
    if (path.extname(req.params.filename) === ".csv") {
        fs.createReadStream(path.resolve(`./uploads/${req.params.filename}`))
            .pipe(csv())
            .on('data', (data) => results.push(data))
            .on('end', async () => {
                res.json(results)
            })
    } else {
        results = parser.parseXls2Json(path.resolve(`./uploads/${req.params.filename}`));
        res.json(results)
    }
})
router.get('/header', async (req, res) => {
    res.json({ message: 'Successfully got header' })
});

module.exports = router;
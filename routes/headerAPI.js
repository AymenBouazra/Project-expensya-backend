const express = require('express');
const router = express.Router();
const Users = require('../models/userSchema');
const userChoices = require('../models/choicesSchema');
const multer = require('multer');
const path = require('path');
const csv = require('csv-parser');
const parser = require('simple-excel-to-json');
const translate = require('@vitalets/google-translate-api');
const fs = require('fs');
const match = require('fuzzball');
const passport = require('passport');
let results = [];
let importedData = [];

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
router.post('/uploadFile',  passport.authenticate('bearer', { session: false }), upload.single('file'), async (req, res) => {
    if (req.file == undefined) {
        res.status(400).json({ message: 'File not found!' })
    } else {
        // find all choices
        const allMatchedHeaderFromDB = await userChoices.aggregate([{ $match: {} }, { $unwind: "$matchingString" },]);
        const choices = allMatchedHeaderFromDB.map((item) => item.matchingString);

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

router.post('/startImport/:filename', passport.authenticate('bearer', { session: false }), async (req, res) => {
    // console.log(req.body);
    if (path.extname(req.params.filename) === ".csv") {
        fs.createReadStream(path.resolve(`./uploads/${req.params.filename}`))
            .pipe(csv())
            .on('data', (data) => { importedData.push(data) })
            .on('end', async () => {
                // console.log(importedData);
                await Promise.all(importedData.map(async (currentObject) => {
                    let objectsKeys = Object.keys(currentObject);
                    await Promise.all(objectsKeys.map(async (key) => {
                        if (key !== '') {
                            const headerFound = await userChoices.findOne({ matchingString: key.toLowerCase() })
                            if (headerFound !== null) {
                                // remplace attribute (matched headers)
                                // console.log(key, "=>", currentObject[key]);
                                (currentObject)[headerFound.header] = currentObject[key]
                                delete currentObject[key]
                                console.log(currentObject);
                            } else {
                                // remplace attribute (not matched headers)
                                const matchedObject = req.body.find((x) => { return x.header === key });
                                if (matchedObject !== undefined) {
                                    console.log(key, " => not found => ", matchedObject.matchingString);
                                    // match this key 
                                    const headerToMatch = await userChoices.findOne({ matchingString: matchedObject.matchingString.toLowerCase() });
                                    if (headerToMatch !== null) {
                                        (currentObject)[headerToMatch.header] = currentObject[key]
                                        delete currentObject[key]
                                        console.log(currentObject);
                                        // add to matching string
                                        await userChoices.findByIdAndUpdate(headerToMatch._id, { $push: { matchingString: matchedObject.matchingString } }, { new: true, upsert: true })
                                    }
                                }

                            }
                            // console.log(headerFound);
                        }
                    }));
                    // return currentObject;
                    // const importData = await Users.create(currentObject);
                }))

                /*let c = 0
                for (let i = 0; i < importedData.length; i++) {
                    for (let j = 0; j < req.body.length; j++) {
                        c = 0
                        while (c <= Object.keys(importedData[i]).length) {
                            if (Object.keys(importedData[i])[c] == req.body[j].key) {
                                const res = await userChoices.findOneAndUpdate({header:(importedData[i])[c]}, {$push : {matchingString:importedData[i][Object.keys(importedData[i])[c]] }}, {new : true})
                                console.log(res);
                                importedData[i][req.body[j].matchedKey] = importedData[i][Object.keys(importedData[i])[c]];
                                delete importedData[i][Object.keys(importedData[i])[c]]
                            }
                            c++
                        }
                    }
                }*/
                // console.log(importe
                const users = await Users.insertMany(importedData);
                res.json(users);
            });
    }
    else {
        importedData = parser.parseXls2Json(path.resolve(`./uploads/${req.params.filename}`));
        res.json(importedData)
    }
});

router.get('/getHeaders',  passport.authenticate('bearer', { session: false }), async(req,res)=>{
    const header = await userChoices.find();
    res.json(header)
})

module.exports = router;
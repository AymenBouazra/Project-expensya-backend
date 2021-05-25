const express = require('express');
const router = express.Router();
const Header = require('../models/headerSchema');
const multer = require('multer');
const path = require('path');
// const FileType = require('file-type');
const csvToJson = require('convert-csv-to-json');
const csv = require('csv-parser')
const fs = require('fs')
const results = [];

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
    // console.log(req.file);
    if (req.file == undefined) {
        res.status(400).json({ message: 'File not found!' })
    } else {
        // console.log(req.file);
        // console.log(path.extname(req.file.filename));
        if (path.extname(req.file.filename) === ".csv") {
            // const json = await csvToJson.formatValueByType().getJsonFromCsv(path.resolve(`./uploads/${req.file.filename}`))
            // console.log(json);
            // res.status(201).json(json);
            fs.createReadStream(path.resolve(`./uploads/${req.file.filename}`))
                .pipe(csv())
                .on('data', (data) => results.push(data))
                .on('end', () => {
                    console.log(results);
                    //translate
                    //matching
                    //sabén fi database
                    res.status(201).json(results)
            })
        }else{
            
        }
    }
    })
router.get('/header', async (req, res) => {
    res.json({ message: 'successfully got header' })
});

module.exports = router;
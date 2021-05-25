const express = require('express');
const router = express.Router();
const Header = require('../models/headerSchema');
const multer = require('multer');
const path = require('path');

const myStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const folder = path.resolve('./uploads');
        cb(null, folder);
    },
    filename: async(req, file, cb) => {
        const extension = path.extname(file.originalname);
        const newFileName = Date.now() + extension;
        const fileLink = 'http://localhost:3000/uploads/' + newFileName ;
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

router.post('/uploadFile',upload.single('file'), async(req, res) => {
    console.log(req.body);
    res.json({message: 'uploaded'});
})
router.get('/header', async (req, res) => {
    res.json({ message: 'successfully got header' })
});

module.exports = router;
const express = require('express');
const router = express.Router();
const Header = require('../models/headerSchema');
const multer = require('multer');


router.get('/header', async (req, res) => {
    res.json({ message: 'successfully got header' })
});

module.exports = router;
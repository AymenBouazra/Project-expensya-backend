const express = require('express');
const router = express.Router();
const Login = require('../models/adminLoginSchema');
const jwt = require('jsonwebtoken');
//Sign In
router.post('/login', async (req, res) => {
    console.log(req.body.Email);
    const login = await Login.findOne({ Email: req.body.Email });
    console.log(login);
    if (login.length != 0) {
        if (login.Password === req.body.Password) {
            res.status(200).json({ message: 'Logged in successfully' });
        } else {
            res.status(400).json({ message: 'Please verify your E-mail or Password' });
        }
    } else {
        res.status(400).json({ message: 'Please verify your E-mail or Password' });
    }
})

// Logout
router.get('/logout', (req, res) => {
    req.logout();
    res.json({ message: 'Logged out!' })
});


module.exports = router;
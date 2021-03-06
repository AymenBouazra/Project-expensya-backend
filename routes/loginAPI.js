const express = require('express');
const router = express.Router();
const Login = require('../models/adminLoginSchema');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const bcrypt = require('bcryptjs');
const env = require('dotenv')
//Sign In
router.post('/login', async (req, res) => {
    const login = await Login.findOne({ Email: req.body.Email });
    console.log("Login ",login);
    if (login !== null) {
        const validPassword = await bcrypt.compare(req.body.Password, login.Password);
        console.log("Password ",validPassword);
        if (validPassword) {
            const tokenData = {
                expensyaId: login._id,
                Email : login.Email
            }
            const createdToken = jwt.sign(tokenData, process.env.JWT_SECRET, { expiresIn: process.env.EXPIRE });
            res.status(200).json({ message: 'Logged in successfully', token: createdToken });
        }else{
            res.status(400).json({ message: 'Please verify your E-mail or Password 1' });
        }
    }else{
        res.status(400).json({ message: 'Please verify your E-mail or Password 2' });
    }
});

// Logout
router.get('/logout', (req, res) => {
    req.logout();
    res.json({ message: 'Logged out!' })
});


module.exports = router;
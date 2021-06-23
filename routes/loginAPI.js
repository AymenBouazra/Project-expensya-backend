const express = require('express');
const router = express.Router();
const Login = require('../models/adminLoginSchema');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const bcrypt = require('bcryptjs')
//Sign In
router.post('/login', async (req, res) => {
    console.log(req.body.Email);
    const login = await Login.findOne({ Email: req.body.Email });
    if (login.length != 0) {
        bcrypt.compare(req.body.password, login.Password, async (response, err) => {
            if(err){
                res.status(400).json({ message: 'Please verify your E-mail or Password' });
            }
            if (response) {
                const tokenData = {
                    name :'Expensya',
                    Email : process.env.EMAIL
                }
                const createdToken = jwt.sign(tokenData, process.env.JWT_SECRET, { expiresIn: process.env.EXPIRE });
                res.status(200).json({ message: 'Logged in successfully', token: createdToken });
            } else {
                res.status(400).json({ message: 'Please verify your E-mail or Password' });
            }
        })
        
    }
});

// Logout
router.get('/logout', (req, res) => {
    req.logout();
    res.json({ message: 'Logged out!' })
});


module.exports = router;
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const AppUser = require('../models/AppUser');
require('dotenv').config();
var auth = require('../services/authentication');

// Public signup endpoint - no authentication required
router.post('/signup', async (req, res) => {
    try {
        const user = req.body;
        
        // Check if user already exists
        const existingUser = await AppUser.findOne({ email: user.email });
        if (existingUser) {
            return res.status(400).json({ message: "Email already exists" });
        }

        // Create new user
        const newUser = new AppUser({
            name: user.name,
            email: user.email,
            password: user.password,
            status: 'false',
            isDeletable: 'true'
        });

        await newUser.save();
        return res.status(200).json({ message: "Successfully registered. Please wait for admin approval." });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

router.post('/addnewAppuser', auth.autheticateToken, async (req, res) => {
    try {
        const user = req.body;
        
        // Check if user already exists
        const existingUser = await AppUser.findOne({ email: user.email });
        if (existingUser) {
            return res.status(400).json({ message: "Email already exists" });
        }

        // Create new user
        const newUser = new AppUser({
            name: user.name,
            email: user.email,
            password: user.password,
            status: 'false',
            isDeletable: 'true'
        });

        await newUser.save();
        return res.status(200).json({ message: "Successfully registered" });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

router.post('/login', async (req, res) => {
    try {
        const user = req.body;
        
        // Find user by email
        const foundUser = await AppUser.findOne({ email: user.email });
        
        if (!foundUser || foundUser.password !== user.password) {
            return res.status(401).json({ message: "Incorrect email or Password" });
        }
        
        if (foundUser.status === 'false') {
            return res.status(401).json({ message: "Wait for admin approval" });
        }
        
        if (foundUser.password === user.password) {
            const response = { email: foundUser.email, isDeletable: foundUser.isDeletable };
            const accessToken = jwt.sign(response, process.env.ACCESS_TOKEN, { expiresIn: '8h' });
            res.status(200).json({ token: accessToken });
        } else {
            return res.status(400).json({ message: "Something went Wrong. Please Try again later" });
        }
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

router.get('/getAllAppuser', auth.autheticateToken, async (req, res) => {
    try {
        const tokenPayload = res.locals;
        let users;
        
        if (tokenPayload.isDeletable === 'false') {
            users = await AppUser.find({ isDeletable: 'true' }, 'name email status');
        } else {
            users = await AppUser.find({ 
                isDeletable: 'true', 
                email: { $ne: tokenPayload.email } 
            }, 'name email status');
        }
        
        return res.status(200).json(users);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

router.post('/updateUserStatus', auth.autheticateToken, async (req, res) => {
    try {
        const user = req.body;
        
        const updatedUser = await AppUser.findOneAndUpdate(
            { _id: user.id, isDeletable: 'true' },
            { status: user.status },
            { new: true }
        );
        
        if (!updatedUser) {
            return res.status(404).json({ message: "User ID does not Exist" });
        }
        
        return res.status(200).json({ message: "User Updated Successfully" });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

router.post('/updateUser', auth.autheticateToken, async (req, res) => {
    try {
        const user = req.body;
        
        const updatedUser = await AppUser.findByIdAndUpdate(
            user.id,
            { name: user.name, email: user.email },
            { new: true }
        );
        
        if (!updatedUser) {
            return res.status(404).json({ message: "User ID does not Exist" });
        }
        
        return res.status(200).json({ message: "User Updated Successfully" });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

// New endpoint to delete a user
router.delete('/deleteUser/:id', auth.autheticateToken, async (req, res) => {
    try {
        const id = req.params.id;
        
        const deletedUser = await AppUser.findOneAndDelete({ 
            _id: id, 
            isDeletable: 'true' 
        });
        
        if (!deletedUser) {
            return res.status(404).json({ message: "User ID does not exist or cannot be deleted" });
        }
        
        return res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

router.get('/checkToken', auth.autheticateToken, (req, res) => {
    return res.status(200).json({ message: "true" });
});

module.exports = router;
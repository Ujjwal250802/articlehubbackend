const express = require('express');
const router = express.Router();
const Chat = require('../models/Chat');
const auth = require('../services/authentication');

// Get all unique users who have sent messages
router.get('/users', auth.autheticateToken, async (req, res) => {
    try {
        const users = await Chat.distinct('userName', { userId: { $ne: 'admin' } });
        return res.status(200).json(users.sort());
    } catch (error) {
        console.error('Error fetching users:', error);
        return res.status(500).json({ error: error.message });
    }
});

// Get messages for a specific user
router.get('/userMessages/:userName', async (req, res) => {
    try {
        const userName = req.params.userName;
        
        const messages = await Chat.find({
            $or: [
                { userName: userName },
                { userId: 'admin', recipient: userName }
            ]
        }).sort({ timestamp: 1 });
        
        return res.status(200).json(messages);
    } catch (error) {
        console.error('Error fetching user messages:', error);
        return res.status(500).json({ error: error.message });
    }
});

// Send a message
router.post('/send', async (req, res) => {
    try {
        const { userId, userName, message, recipient } = req.body;
        
        if (!userName || !message || !recipient) {
            return res.status(400).json({ error: 'Username, message, and recipient are required' });
        }

        const newMessage = new Chat({
            userId,
            userName,
            message,
            recipient,
            read: false,
            timestamp: new Date()
        });

        await newMessage.save();
        return res.status(200).json({ message: 'Message sent successfully' });
    } catch (error) {
        console.error('Error sending message:', error);
        return res.status(500).json({ error: error.message });
    }
});

// Mark messages as read
router.put('/markAsRead', auth.autheticateToken, async (req, res) => {
    try {
        await Chat.updateMany({ read: false }, { read: true });
        return res.status(200).json({ message: 'Messages marked as read' });
    } catch (error) {
        console.error('Error marking messages as read:', error);
        return res.status(500).json({ error: error.message });
    }
});

module.exports = router;
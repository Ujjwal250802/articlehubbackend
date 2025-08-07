const express = require('express');
const router = express.Router();
const Branch = require('../models/Branch');
var auth = require('../services/authentication');

router.post("/addNewBranch", auth.autheticateToken, async (req, res) => {
    try {
        const branch = req.body;
        
        const newBranch = new Branch({
            name: branch.name
        });
        
        await newBranch.save();
        return res.status(200).json({ message: "Branch Added Successfully" });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: "Branch name already exists" });
        }
        return res.status(500).json({ error: error.message });
    }
});

router.get('/getAllBranch', auth.autheticateToken, async (req, res) => {
    try {
        const branches = await Branch.find().sort({ name: 1 });
        return res.status(200).json(branches);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

router.post('/updateBranch', auth.autheticateToken, async (req, res) => {
    try {
        const branch = req.body;
        
        const updatedBranch = await Branch.findByIdAndUpdate(
            branch.id,
            { name: branch.name },
            { new: true }
        );
        
        if (!updatedBranch) {
            return res.status(404).json({ message: "Branch Id Does not found" });
        }
        
        return res.status(200).json({ message: "Branch Updated Successfully" });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: "Branch name already exists" });
        }
        return res.status(500).json({ error: error.message });
    }
});

router.get('/deleteBranch/:id', auth.autheticateToken, async (req, res) => {
    try {
        const id = req.params.id;
        
        const deletedBranch = await Branch.findByIdAndDelete(id);
        
        if (!deletedBranch) {
            return res.status(404).json({ message: "Branch Id Does not found" });
        }
        
        return res.status(200).json({ message: "Branch deleted Successfully" });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

module.exports = router;
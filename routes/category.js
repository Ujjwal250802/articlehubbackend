const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
var auth = require('../services/authentication');

router.post("/addNewCategory", auth.autheticateToken, async (req, res) => {
    try {
        const category = req.body;
        
        const newCategory = new Category({
            name: category.name
        });
        
        await newCategory.save();
        return res.status(200).json({ message: "Category Added Successfully" });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: "Category name already exists" });
        }
        return res.status(500).json({ error: error.message });
    }
});

router.get('/getAllCategory', auth.autheticateToken, async (req, res) => {
    try {
        const categories = await Category.find().sort({ name: 1 });
        return res.status(200).json(categories);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

router.post('/updateCategory', auth.autheticateToken, async (req, res) => {
    try {
        const category = req.body;
        
        const updatedCategory = await Category.findByIdAndUpdate(
            category.id,
            { name: category.name },
            { new: true }
        );
        
        if (!updatedCategory) {
            return res.status(404).json({ message: "Category Id Does not found" });
        }
        
        return res.status(200).json({ message: "Category Updated Successfully" });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: "Category name already exists" });
        }
        return res.status(500).json({ error: error.message });
    }
});

router.get('/deleteCategory/:id', auth.autheticateToken, async (req, res) => {
    try {
        const id = req.params.id;
        
        const deletedCategory = await Category.findByIdAndDelete(id);
        
        if (!deletedCategory) {
            return res.status(404).json({ message: "Category Id Does not found" });
        }
        
        return res.status(200).json({ message: "Category deleted Successfully" });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

module.exports = router;
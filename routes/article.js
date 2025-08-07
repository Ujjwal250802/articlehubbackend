const express = require('express');
const multer = require('multer');
const router = express.Router();
const Article = require('../models/Article');
const Category = require('../models/Category');
const Branch = require('../models/Branch');
const Student = require('../models/Student');
var auth = require('../services/authentication');
const path = require('path');
const jwt = require('jsonwebtoken');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

router.use('/uploads', express.static('uploads'));

router.post('/upload/editor-image', auth.autheticateToken, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }
  // Use environment variable for production URL
  const baseUrl = process.env.NODE_ENV === 'production' 
    ? process.env.RENDER_EXTERNAL_URL || 'https://your-backend-app.onrender.com'
    : 'http://localhost:8080';
  const imageUrl = `${baseUrl}/uploads/${req.file.filename}`;
  return res.status(200).json({ url: imageUrl });
});

router.get('/getAllPublishedArticle', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.SECRET || 'secretKey');
    const studentId = decoded.id;

    // Find student and get their branch
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const studentBranch = student.branch;

    // Find branch by name
    const branch = await Branch.findOne({ name: studentBranch });
    if (!branch) {
      return res.status(404).json({ message: "Branch not found" });
    }

    // Get published articles for the student's branch
    const articles = await Article.find({ 
      status: 'published', 
      branchID: branch._id 
    })
    .populate('categoryID', 'name')
    .populate('branchID', 'name')
    .sort({ publication_date: -1 });

    // Format the response to match the original structure
    const formattedArticles = articles.map(article => ({
      id: article._id,
      title: article.title,
      content: article.content,
      status: article.status,
      publication_date: article.publication_date,
      categoryID: article.categoryID._id,
      categoryName: article.categoryID.name,
      branchID: article.branchID._id,
      branchName: article.branchID.name
    }));

    return res.status(200).json(formattedArticles);
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: "Invalid token" });
    }
    return res.status(500).json({ error: error.message });
  }
});

router.post('/addNewArticle', auth.autheticateToken, async (req, res) => {
  try {
    const article = req.body;
    
    const newArticle = new Article({
      title: article.title,
      content: article.content,
      publication_date: new Date(),
      categoryID: article.categoryID,
      branchID: article.branchID,
      status: article.status
    });

    await newArticle.save();
    return res.status(200).json({ message: "Article Added Successfully" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.get('/getAllarticle', auth.autheticateToken, async (req, res) => {
  try {
    const articles = await Article.find()
      .populate('categoryID', 'name')
      .populate('branchID', 'name')
      .sort({ publication_date: -1 });

    // Format the response to match the original structure
    const formattedArticles = articles.map(article => ({
      id: article._id,
      title: article.title,
      content: article.content,
      status: article.status,
      publication_date: article.publication_date,
      categoryID: article.categoryID._id,
      categoryName: article.categoryID.name,
      branchID: article.branchID._id,
      branchName: article.branchID.name
    }));

    return res.status(200).json(formattedArticles);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.post('/updateArticle', auth.autheticateToken, async (req, res) => {
  try {
    const article = req.body;
    
    const updatedArticle = await Article.findByIdAndUpdate(
      article.id,
      {
        title: article.title,
        content: article.content,
        categoryID: article.categoryID,
        branchID: article.branchID,
        publication_date: new Date(),
        status: article.status
      },
      { new: true }
    );

    if (!updatedArticle) {
      return res.status(404).json({ message: "Article Id Does not found" });
    }

    return res.status(200).json({ message: "Article Updated Successfully" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.get('/deleteArticle/:id', auth.autheticateToken, async (req, res) => {
  try {
    const id = req.params.id;
    
    const deletedArticle = await Article.findByIdAndDelete(id);
    
    if (!deletedArticle) {
      return res.status(404).json({ message: "Article Id Does not found" });
    }
    
    return res.status(200).json({ message: "Article deleted Successfully" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;
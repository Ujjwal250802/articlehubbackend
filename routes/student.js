const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
require('dotenv').config();

// Secret key for JWT
const secretKey = process.env.SECRET || 'secretKey';

// Student signup route
router.post('/signup', async (req, res) => {
  try {
    const student = req.body;
    
    // Check if student with same email already exists
    const existingStudent = await Student.findOne({ email: student.email });
    if (existingStudent) {
      return res.status(400).json({ message: "Email already exists" });
    }
    
    // Hash the password
    const hash = await bcrypt.hash(student.password, 10);
    
    // Create new student with hashed password
    const newStudent = new Student({
      email: student.email,
      password: hash,
      branch: student.branch
    });

    await newStudent.save();
    return res.status(200).json({ message: "Student registered successfully" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// Student login route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find student by email
    const student = await Student.findOne({ email });
    if (!student) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    
    // Compare the provided password with the stored hash
    const isMatch = await bcrypt.compare(password, student.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    
    // Create JWT token
    const token = jwt.sign({ id: student._id, email: student.email }, secretKey, { expiresIn: '1d' });
    
    // Remove password from student object
    const { password: _, ...studentWithoutPassword } = student.toObject();
    
    return res.status(200).json({
      token,
      student: studentWithoutPassword,
      message: "Login successful"
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// Middleware to verify student token
const verifyStudentToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }
  
  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Invalid token" });
    }
    
    req.student = decoded;
    next();
  });
};

// Get student profile
router.get('/profile', verifyStudentToken, async (req, res) => {
  try {
    const studentId = req.student.id;
    
    const student = await Student.findById(studentId, 'email branch createdAt');
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }
    
    return res.status(200).json({
      id: student._id,
      email: student.email,
      branch: student.branch,
      created_at: student.createdAt
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// Update student profile
router.put('/profile', verifyStudentToken, async (req, res) => {
  try {
    const studentId = req.student.id;
    const { branch } = req.body;
    
    const updatedStudent = await Student.findByIdAndUpdate(
      studentId,
      { branch },
      { new: true }
    );
    
    if (!updatedStudent) {
      return res.status(404).json({ message: "Student not found" });
    }
    
    return res.status(200).json({ message: "Profile updated successfully" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;
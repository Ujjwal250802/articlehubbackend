const express = require('express');
var cors = require('cors');
const connectDB = require('./connection');
const appuserRoute = require('./routes/appuser');
const categoryRoute = require('./routes/category');
const articleRoute = require('./routes/article');
const chatRoute = require('./routes/chat');
const studentRoute = require('./routes/student');
const branchRoute= require('./routes/branch');
const app = express();
const path = require('path');

// Connect to MongoDB
connectDB();

// CORS configuration
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? [
        process.env.FRONTEND_URL || 'https://your-frontend-app.vercel.app',
        'https://vercel.app',
        /\.vercel\.app$/
      ]
    : ['http://localhost:3000', 'http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json());

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/appuser', appuserRoute);
app.use('/category', categoryRoute);
app.use('/article', articleRoute);
app.use('/chat', chatRoute);
app.use('/student', studentRoute);
app.use('/branch', branchRoute);

module.exports = app;
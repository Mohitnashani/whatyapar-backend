const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const orderRoutes = require('./routes/orders');
const authRoutes = require('./routes/auth');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
// For the MVP, we can use a local mongodb instance if a URI isn't provided.
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/whatyapar';

mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);

// Root route so you don't get "Cannot GET /"
app.get('/', (req, res) => {
  res.send('Whatyapar Backend is running! Go to your frontend URL to use the app.');
});

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

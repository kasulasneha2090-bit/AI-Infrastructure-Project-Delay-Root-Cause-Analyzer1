require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const authRoutes = require('./routes/auth');
const reportRoutes = require('./routes/reports');
const feedbackRoutes = require('./routes/feedback');
const templateRoutes = require('./routes/templates');
const analyticsRoutes = require('./routes/analytics');

const app = express();
const PORT = process.env.PORT || 5000;

// Security Middlewares
app.use(helmet());
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Request Logger
app.use(morgan('dev'));

// JSON Body Parser
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/admin/analytics', analyticsRoutes);

// Base Route
app.get('/', (req, res) => {
  res.json({
    message: 'Crownridge LLP AI Infrastructure Project Delay Root Cause Analyzer API',
    status: 'Healthy',
    timestamp: new Date()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong on the server.' });
});

// Start Server (local dev only)
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`Database connected successfully via Firebase Firestore`);
  });
}

// Export for Vercel serverless
module.exports = app;

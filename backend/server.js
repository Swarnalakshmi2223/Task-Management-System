// ─── Step 1: Load environment variables FIRST ────────────────────────────────
require('dotenv').config();

// ─── Step 2: Import required packages ────────────────────────────────────────
const express  = require('express');
const mongoose = require('mongoose');
const cors     = require('cors');

// ─── Step 3: Guard — fail fast if MONGO_URI is missing ───────────────────────
if (!process.env.MONGO_URI) {
  console.error('❌ ERROR: MONGO_URI is not defined in .env file');
  process.exit(1);
}

// ─── Step 4: Initialize Express app ──────────────────────────────────────────
const app  = express();
const PORT = process.env.PORT || 5000;

// ─── Step 5: Middleware ───────────────────────────────────────────────────────
// Enable CORS — allows frontend (Vite) to communicate with this API
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type'],
  })
);

// Enable JSON body parsing for incoming requests
app.use(express.json());

// ─── Step 6: Health Check Route ───────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Task Management API is running',
    timestamp: new Date().toISOString(),
  });
});

// ─── Step 7: API Routes ───────────────────────────────────────────────────────
const taskRoutes = require('./routes/taskRoutes');
app.use('/api/tasks', taskRoutes);

// ─── Step 8: 404 Handler — must be LAST, after all routes ────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// ─── Step 9: Connect to MongoDB, then start listening ────────────────────────
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected successfully');
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  });

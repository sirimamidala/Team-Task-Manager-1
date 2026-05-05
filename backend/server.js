const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const connectDB = require('./db');
const fs = require('fs');

const rootPath = path.resolve(__dirname, '..');
const frontendPath = path.resolve(rootPath, 'frontend', 'dist');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/projects', require('./routes/projectRoutes'));
app.use('/api/tasks', require('./routes/taskRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/assessments', require('./routes/assessmentRoutes'));

// Serve Static Files in Production
console.log('Project Root Path:', rootPath);
console.log('Target Frontend Static Path:', frontendPath);

// Check if path exists
if (fs.existsSync(frontendPath)) {
  console.log('Frontend dist folder found. Contents:', fs.readdirSync(frontendPath));
} else {
  console.error('WARNING: Frontend dist folder NOT found at:', frontendPath);
}

// Serve Landing Page at Root
app.get('/', (req, res) => {
  res.sendFile(path.join(rootPath, 'index.html'));
});

// Serve Static Files for Landing Page (styles.css, images, etc.)
app.use(express.static(rootPath));

// Serve React App Static Files
app.use(express.static(frontendPath));

// For any other route, serve the index.html from frontend/dist
app.use((req, res, next) => {
  // If it's an API route, let it pass through (though it should have been caught by the routes above)
  if (req.url.startsWith('/api')) {
    return next();
  }
  
  const indexPath = path.join(frontendPath, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      console.error('Error sending frontend index.html:', err);
      // Fallback to landing page if frontend build is missing
      res.sendFile(path.join(rootPath, 'index.html'));
    }
  });
});


const PORT = process.env.PORT || 5000;

// Connect to Database and start server
console.log('Attempting to connect to Database...');
connectDB()
  .then(() => {
    console.log('Database connected successfully.');
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server is live and running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('CRITICAL: Database connection failed during startup:', err);
    process.exit(1);
  });

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');


// Import routes
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/AdminRoutes');
const notificationRoutes = require('./routes/NotificationRoutes');
const studentRoutes = require('./routes/StudentRoutes');
const driverRoutes = require('./routes/DriverRoutes');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    credentials: true
  }
});
const PORT = process.env.PORT || 5001;

// Make io available globally
global.io = io;  

// Body parsing middleware
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

// CORS configuration
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true
}));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/driver', driverRoutes);



// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});



// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  // Driver joins their bus room
  socket.on('join-driver', (busNumber) => {
    socket.join(`bus-${busNumber}`);
    console.log(`Driver joined bus room: bus-${busNumber}`);
  });
  
  // Student joins bus room to track
  socket.on('join-student', (busNumber) => {
    socket.join(`bus-${busNumber}`);
    console.log(`Student joined bus room: bus-${busNumber}`);
  });
  
  // Admin room
  socket.on('join-admin', (adminId) => {
    socket.join(`admin-${adminId}`);
    console.log(`Admin ${adminId} joined room`);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});


const connect = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Database Connection Successful");

    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

    
    
  } catch (error) {
    console.error("Database connection failed:", error);
    process.exit(1);
  }
};

connect();
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
const uploadRoutes = require('./routes/UploadRoutes');
const routeApplicationRoutes = require('./routes/routeApplicationRoutes');

const app = express();
const server = http.createServer(app);

// Parse CLIENT_URL from .env (supports comma-separated URLs)
const allowedOrigins = process.env.CLIENT_URL 
  ? process.env.CLIENT_URL.split(',').map(url => url.trim().replace(/\/$/, ''))
  : ['http://localhost:5173'];

const PORT = process.env.PORT || 5001;

console.log('Allowed Origins:', allowedOrigins);

// CORS Configuration
const corsOptions = {
  origin: function (origin, callback) {
    console.log('Request from origin:', origin);
    // Allow requests with no origin (mobile apps, Postman, server-to-server)
    if (!origin) return callback(null, true);
    
    // Remove trailing slash from origin for comparison
    const normalizedOrigin = origin.replace(/\/$/, '');
    const isAllowed = allowedOrigins.some(allowed => 
      allowed === normalizedOrigin || allowed === origin
    );
    
    if (isAllowed) {
      callback(null, true);
    } else {
      console.log('❌ Blocked origin:', origin);
      callback(null, false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  exposedHeaders: ['Set-Cookie'],
  maxAge: 86400,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

const io = socketIo(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST']
  },
  transports: ['websocket', 'polling']
});

// Make io available globally
global.io = io;

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check route
app.get('/', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Bus Management System API is running',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'API is healthy',
    allowedOrigins: allowedOrigins
  });
});

// Routes
app.use('/api/auth', authRoutes);ser
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/driver', driverRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/route-applications', routeApplicationRoutes);



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
  socket.on('join-student', (studentId) => {
    socket.join(`student-${studentId}`);
    console.log(`Student ${studentId} joined notification room`);
  });
  
  // Student joins bus tracking room
  socket.on('join-bus-tracking', (busNumber) => {
    socket.join(`bus-${busNumber}`);
    console.log(`Student joined bus tracking room: bus-${busNumber}`);
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
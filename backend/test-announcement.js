// Quick test for announcement
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// Simple announcement model
const announcementSchema = new mongoose.Schema({
  title: String,
  message: String,
  type: { type: String, default: 'info' },
  createdAt: { type: Date, default: Date.now }
});

const Announcement = mongoose.model('Announcement', announcementSchema);

// Test route
app.post('/api/admin/send-announcement', async (req, res) => {
  try {
    const { title, message, type } = req.body;
    
    const announcement = new Announcement({
      title: title || 'Test Title',
      message: message || 'Test Message',
      type: type || 'info'
    });
    
    await announcement.save();
    
    res.json({
      success: true,
      message: 'Announcement sent successfully',
      announcement
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get announcements
app.get('/api/student/announcements', async (req, res) => {
  try {
    const announcements = await Announcement.find().sort({ createdAt: -1 });
    res.json({ success: true, announcements });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

mongoose.connect('mongodb+srv://root:mongodbhariom@cluster0.qz6up7o.mongodb.net/test?retryWrites=true&w=majority&appName=Cluster0')
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(5003, () => {
      console.log('Test server running on port 5002');
    });
  })
  .catch(err => console.error('MongoDB connection error:', err));
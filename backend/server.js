require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');

const app = express();
const PORT = process.env.PORT || 5001;

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true
}));

app.use('/api/auth', authRoutes);

const connect = async () => {
  const port = process.env.PORT;
  const mongoURL = process.env.MONGO_URI;

  try {
    await mongoose.connect(mongoURL);   // ✅ no need for deprecated options
    console.log("Database Connection Successful");

    app.listen(PORT, () => {
      console.log(`App is running on port ${port}`);
    });

  } catch (e) {
    console.error("Error: " + e);
  }
};

connect();

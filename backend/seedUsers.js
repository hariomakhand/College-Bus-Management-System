// seedUsers.js
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const dotenv = require("dotenv");
const UserModel = require("./models/Admin"); // .js extension optional with require

dotenv.config();

const MONGO = process.env.MONGO_URI;

async function run() {
  try {
    await mongoose.connect(MONGO, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log("MongoDB connected ✅");

    const users = [
      { name: "Super Admin", email: "admin@school.com", password: "Admin@123", role: "admin", isVerified: true }
      
    ];

    for (const u of users) {
      const existing = await UserModel.findOne({ email: u.email });
      if (existing) {
        console.log(`User already exists: ${u.email}`);
        continue;
      }

      const hashedPassword = await bcrypt.hash(u.password, 10);
      const newUser = new UserModel({
        name: u.name,
        email: u.email,
        password: hashedPassword,
        role: u.role,
        isVerified: u.isVerified
      });

      await newUser.save();
      
      console.log(`Created ${u.role}: ${u.email}`);
    }

    console.log("All done ✅");
    mongoose.disconnect();
  } catch (err) {
    console.error("Error:", err);
    mongoose.disconnect();
  }
}

run();

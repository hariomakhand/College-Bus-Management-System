const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const UserModel = require("../models/Student");
const AdminModel = require("../models/Admin");
const DriverModel = require("../models/Driver");
const nodemailer = require("nodemailer");
const crypto = require("crypto");

// Nodemailer setup
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Send OTP email function
const sendOTPEmail = async (email, otp) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Verify your Email",
        html: `<p>Your OTP code is <b>${otp}</b>. It will expire in 5 minutes.</p>`
    };

    await transporter.sendMail(mailOptions);
};

// ---------------- Signup ----------------
const signup = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        
        // Auto-assign role as student for public signup
        const role = "student";
        const Model = UserModel; // Always use Student model for public signup
        
        const existingUser = await Model.findOne({ email });
        if (existingUser) {
            return res.status(409).json({
                message: "User already exists",
                success: false
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        const newUser = new Model({
            name,
            email,
            password: hashedPassword,
            role,
            isVerified: false,
            emailVerificationCode: otp,
            emailVerificationExpiry: Date.now() + 5 * 60 * 1000 // 5 min
        });

        await newUser.save();
        await sendOTPEmail(email, otp);

        res.status(201).json({
            message: " Please Verify Your Email",
            success: true
        });
    } catch (err) {
        console.log("Signup error:", err);
        res.status(500).json({
            message: "Internal server error",
            success: false,
            error: err.message
        });
    }
};

//          ---------------- Verify Email ----------------        
const verifyEmail = async (req, res) => {
    try {
        const { email, otp } = req.body;
        const user = await UserModel.findOne({ email });

        if (!user) return res.status(404).json({ message: "User not found", success: false });
        if (user.isVerified) return res.status(400).json({ message: "Email already verified", success: false });

        if (user.emailVerificationExpiry < Date.now()) {
            return res.status(400).json({ message: "OTP expired", success: false });
        }
        if (user.emailVerificationCode !== otp) {
            return res.status(400).json({ message: "Invalid OTP", success: false });
        }

        user.isVerified = true;
        user.emailVerificationCode = null;
        user.emailVerificationExpiry = null;

        const token = jwt.sign(
            { email: user.email, _id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "24h" }
        );

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 24 * 60 * 60 * 1000
        });

        await user.save();
        res.status(200).json({ 
            message: "Email verified successfully",
             success: true,
              user: { _id: user._id, name: user.name, email: user.email, role: user.role }
            });
            

       
    } catch (err) {
        res.status(500).json({ message: "Internal server error", success: false, error: err.message });
    }
};

// ---------------- Resend OTP ----------------
const resendOTP = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await UserModel.findOne({ email });

        if (!user) return res.status(404).json({ message: "User not found", success: false });
        if (user.isVerified) return res.status(400).json({ message: "Email already verified", success: false });

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        user.emailVerificationCode = otp;
        user.emailVerificationExpiry = Date.now() + 5 * 60 * 1000;
        await user.save();

        await sendOTPEmail(email, otp);

        res.status(200).json({ message: "OTP resent successfully", success: true });
    } catch (err) {
        res.status(500).json({ message: "Internal server error", success: false, error: err.message });
    }
};

// ---------------- Login ----------------
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Auto-detect role based on email and check all models
        let user = null;
        let userRole = null;
        
        // Check Admin first
        user = await AdminModel.findOne({ email });
        if (user) {
            userRole = 'admin';
        } else {
            // Check Driver
            user = await DriverModel.findOne({ email });
            if (user) {
                userRole = 'driver';
            } else {
                // Check Student
                user = await UserModel.findOne({ email });
                if (user) {
                    userRole = 'student';
                }
            }
        }

        if (!user) return res.status(404).json({ message: "User not found", success: false });
        if (!user.isVerified) return res.status(403).json({ message: "Please verify your email before login.", success: false });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ message: "Invalid password", success: false });

        const token = jwt.sign(
            { email: user.email, _id: user._id, role: userRole },
            process.env.JWT_SECRET,
            { expiresIn: "24h" }
        );

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 24 * 60 * 60 * 1000
        });

        res.status(200).json({
            message: "Login successful",
            success: true,
            user: { _id: user._id, name: user.name, email: user.email, role: userRole }
        });
        console.log("Login successful");
        
    } catch (err) {
        res.status(500).json({ message: "Internal server error", success: false, error: err.message });
    }
};

// Forgot Password
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await UserModel.findOne({ email });
        if (!user) return res.status(404).json({ message: "User not found" });

        // Generate Token
        const resetToken = crypto.randomBytes(32).toString("hex");
        const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

        user.resetPasswordToken = hashedToken;
        user.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 min
        await user.save();

        const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;

        // Send Email (using nodemailer)
        const resetTransporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        await resetTransporter.sendMail({
            to: user.email,
            subject: "Password Reset",
            html: `<p>Click here to reset your password: <a href="${resetUrl}">${resetUrl}</a></p>`,
        });

        res.json({ message: "Password reset link sent to email" });
    } catch (err) {
        res.status(500).json({ message: "Error in forgot password", error: err.message });
        console.log(err);
    }
};

//  Reset Password
const resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

        const user = await UserModel.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpire: { $gt: Date.now() },
        });

        if (!user) return res.status(400).json({ message: "Invalid or expired token" });

        user.password = await bcrypt.hash(password, 10);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save();

        res.json({ message: "Password reset successful" });
    } catch (err) {
        res.status(500).json({ message: "Error in reset password" });
    }
}

module.exports = { signup, verifyEmail, resendOTP, login, forgotPassword, resetPassword };
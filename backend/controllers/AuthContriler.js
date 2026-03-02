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
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    tls: {
        rejectUnauthorized: false
    }
});

// Verify transporter
transporter.verify((error, success) => {
    if (error) {
        console.log('❌ Email transporter error:', error);
    } else {
        console.log('✅ Email server is ready to send messages');
    }
});

// Send OTP email function
const sendOTPEmail = async (email, otp) => {
    try {
        const mailOptions = {
            from: `"Bus Management System" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: "Verify your Email - Bus Management System",
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4;">
                    <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px;">
                        <h2 style="color: #EAB308;">Email Verification</h2>
                        <p>Your OTP code is:</p>
                        <h1 style="color: #1f2937; background-color: #FEF3C7; padding: 15px; text-align: center; border-radius: 5px;">${otp}</h1>
                        <p style="color: #666;">This code will expire in 5 minutes.</p>
                        <p style="color: #999; font-size: 12px; margin-top: 20px;">If you didn't request this, please ignore this email.</p>
                    </div>
                </div>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('✅ OTP email sent:', info.messageId);
        return info;
    } catch (error) {
        console.error('❌ Error sending OTP email:', error);
        throw new Error('Failed to send verification email');
    }
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
        
        try {
            await sendOTPEmail(email, otp);
            res.status(201).json({
                message: "Please Verify Your Email",
                success: true
            });
        } catch (emailError) {
            // Rollback user creation if email fails
            await Model.deleteOne({ _id: newUser._id });
            console.error('Email sending failed:', emailError);
            return res.status(500).json({
                message: "Failed to send verification email. Please try again.",
                success: false,
                error: emailError.message
            });
        }
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
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            maxAge: 24 * 60 * 60 * 1000,
            path: '/',
            domain: process.env.COOKIE_DOMAIN || undefined
        });

        await user.save();
        res.status(200).json({ 
            message: "Email verified successfully",
            success: true,
            token,
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

        try {
            await sendOTPEmail(email, otp);
            res.status(200).json({ message: "OTP resent successfully", success: true });
        } catch (emailError) {
            console.error('Resend OTP failed:', emailError);
            return res.status(500).json({ 
                message: "Failed to resend OTP. Please try again.", 
                success: false,
                error: emailError.message 
            });
        }
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
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            maxAge: 24 * 60 * 60 * 1000,
            path: '/',
            domain: process.env.COOKIE_DOMAIN || undefined
        });

        res.status(200).json({
            message: "Login successful",
            success: true,
            token,
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
        
        if (!email) {
            return res.status(400).json({ message: "Email is required", success: false });
        }

        const user = await UserModel.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found", success: false });
        }

        // Generate Token
        const resetToken = crypto.randomBytes(32).toString("hex");
        const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

        user.resetPasswordToken = hashedToken;
        user.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 min
        await user.save();

        // Get CLIENT_URL from env, handle multiple URLs
        const clientUrl = process.env.CLIENT_URL?.split(',')[0]?.trim() || 'http://localhost:5173';
        const resetUrl = `${clientUrl}/reset-password/${resetToken}`;

        console.log('Sending password reset email to:', email);
        console.log('Reset URL:', resetUrl);

        try {
            await transporter.sendMail({
                from: `"Bus Management System" <${process.env.EMAIL_USER}>`,
                to: user.email,
                subject: "Password Reset - Bus Management System",
                html: `
                    <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4;">
                        <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px;">
                            <h2 style="color: #EAB308;">Password Reset Request</h2>
                            <p>You requested to reset your password. Click the button below:</p>
                            <div style="text-align: center; margin: 30px 0;">
                                <a href="${resetUrl}" style="background-color: #EAB308; color: #1f2937; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Reset Password</a>
                            </div>
                            <p style="color: #666; font-size: 14px;">Or copy this link: <br><a href="${resetUrl}" style="color: #EAB308;">${resetUrl}</a></p>
                            <p style="color: #999; font-size: 12px; margin-top: 20px;">This link will expire in 15 minutes.</p>
                            <p style="color: #999; font-size: 12px;">If you didn't request this, please ignore this email.</p>
                        </div>
                    </div>
                `,
            });
            console.log('✅ Password reset email sent to:', user.email);
            res.json({ message: "Password reset link sent to email", success: true });
        } catch (emailError) {
            console.error('❌ Password reset email failed:', emailError);
            // Rollback token if email fails
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;
            await user.save();
            
            return res.status(500).json({ 
                message: "Failed to send reset email. Please check your email configuration.", 
                success: false,
                error: process.env.NODE_ENV === 'development' ? emailError.message : 'Email service error'
            });
        }
    } catch (err) {
        console.error('❌ Forgot password error:', err);
        res.status(500).json({ 
            message: "Error in forgot password", 
            success: false,
            error: process.env.NODE_ENV === 'development' ? err.message : 'Server error'
        });
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
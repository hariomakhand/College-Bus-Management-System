const express = require("express");
const { SignupValidation, LoginValidation } = require("../middlewares/AuthValidation");
const { signup, login, verifyEmail, forgotPassword, resetPassword } = require("../controllers/AuthContriler");
const AuthProtect = require("../middlewares/AuthProtect");
const roleMiddleware = require("../middlewares/roleMiddleware");
const router = express.Router();

router.post("/signup", SignupValidation, signup);
router.post("/login", LoginValidation, login);
router.post("/verify-email", verifyEmail);

router.get("/check", AuthProtect, (req, res) => {
  res.json({ isAuth: true, user: req.user });
});




router.get("/admin-dashboard", AuthProtect, roleMiddleware("admin"), (req, res) => {
  res.json({ message: "Welcome Admin", user: req.user });
});

router.get("/driver-dashboard", AuthProtect, roleMiddleware("driver"), (req, res) => {
  res.json({ message: "Welcome Driver", user: req.user });
});

router.get("/student-dashboard", AuthProtect, roleMiddleware("student"), (req, res) => {
  res.json({ message: "Welcome Student", user: req.user });
});

router.post("/logout", (req, res) => {
  const token = req.cookies?.token;

  if (token) {
    res.clearCookie("token", {
      httpOnly: true,
      secure: true,
      sameSite: "strict"
    });
    return res.json({ message: "Logout successful", success: true });
  } else {
    return res.status(400).json({ message: "No active session found", success: false });
  }
});

router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);


module.exports = router;

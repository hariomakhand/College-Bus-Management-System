// AuthProtect.js
const jwt = require("jsonwebtoken");

const AuthProtect = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ message: "Unauthorized", success: false });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // contains _id, email, role
    next();
  } catch (err) {
    return res.status(401).json({ message: "Unauthorized", success: false });
  }
};

module.exports = AuthProtect;

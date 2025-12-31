// AuthProtect.js
const jwt = require("jsonwebtoken");

const AuthProtect = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ message: "Unauthorized", success: false });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = {
      id: decoded._id || decoded.id,
      _id: decoded._id || decoded.id,
      email: decoded.email,
      role: decoded.role
    };
    next();
  } catch (err) {
    return res.status(401).json({ message: "Unauthorized", success: false });
  }
};

module.exports = AuthProtect;

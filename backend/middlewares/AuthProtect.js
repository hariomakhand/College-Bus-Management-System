// AuthProtect.js
const jwt = require("jsonwebtoken");

const AuthProtect = (req, res, next) => {
  const token = req.cookies.token;
  
  if (!token) {
    console.log('❌ No token found in cookies');
    return res.status(401).json({ message: "Unauthorized - No token", success: false, isAuth: false });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = {
      id: decoded._id || decoded.id,
      _id: decoded._id || decoded.id,
      email: decoded.email,
      role: decoded.role
    };
    console.log('✅ Token verified for user:', decoded.email);
    next();
  } catch (err) {
    console.log('❌ Token verification failed:', err.message);
    return res.status(401).json({ message: "Unauthorized - Invalid token", success: false, isAuth: false });
  }
};

module.exports = AuthProtect;

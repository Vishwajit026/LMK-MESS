const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res.status(401).json({ message: 'Access Denied: No Authorization Header provided.' });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Access Denied: No Token provided.' });
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET || 'kpc_ventures_secret_key_123');
    req.user = verified;
    next();
  } catch (error) {
    res.status(403).json({ message: 'Invalid or expired authentication token.' });
  }
};

const verifyAdmin = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user && req.user.role === 'admin') {
      next();
    } else {
      res.status(403).json({ message: 'Unauthorized: Admin role is required.' });
    }
  });
};

module.exports = {
  verifyToken,
  verifyAdmin
};

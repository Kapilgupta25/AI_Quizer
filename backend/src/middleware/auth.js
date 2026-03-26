import { verifyAccessToken } from '../utils/jwt.js';
import User from '../models/User.js';
import logger from '../utils/logger.js';

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Access token required' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyAccessToken(token);

    if (decoded.type !== 'access') {
      return res.status(401).json({ error: 'Invalid token type' });
    }

    const user = await User.findById(decoded.sub).select('-password -refreshTokens');
    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'User not found or deactivated' });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired', code: 'TOKEN_EXPIRED' });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    logger.error('Auth middleware error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
};

export const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) return next();

  try {
    const token = authHeader.split(' ')[1];
    const decoded = verifyAccessToken(token);
    req.user = await User.findById(decoded.sub).select('-password -refreshTokens');
  } catch (_) {
    // silently ignore, req.user will be undefined
  }
  next();
};
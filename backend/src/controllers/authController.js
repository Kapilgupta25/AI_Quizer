import { OAuth2Client } from 'google-auth-library';
import User from '../models/User.js';
import { generateTokenPair, verifyRefreshToken } from '../utils/jwt.js';
import logger from '../utils/logger.js';

const getGoogleClient = () => {
  const clientId = process.env.GOOGLE_CLIENT_ID?.trim();

  if (!clientId || clientId === 'your_google_client_id') {
    throw new Error('GOOGLE_CLIENT_ID is missing');
  }

  return new OAuth2Client(clientId);
};

// ─── Register ─────────────────────────────────────────────────────────────────
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const user = new User({ name, email, password, provider: 'local' });
    await user.save();

    const { accessToken, refreshToken } = generateTokenPair(user._id.toString());
    await user.addRefreshToken(refreshToken, req.headers['user-agent']);

    logger.info(`New user registered: ${email}`);
    res.status(201).json({
      user: user.toJSON(),
      accessToken,
      refreshToken,
    });
  } catch (error) {
    logger.error('Register error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
};

// ─── Login ────────────────────────────────────────────────────────────────────
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user || user.provider !== 'local') {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValid = await user.comparePassword(password);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const { accessToken, refreshToken } = generateTokenPair(user._id.toString());
    await user.addRefreshToken(refreshToken, req.headers['user-agent']);

    res.json({
      user: user.toJSON(),
      accessToken,
      refreshToken,
    });
  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
};

// ─── Google OAuth (ID Token flow) ─────────────────────────────────────────────
export const googleAuth = async (req, res) => {
  try {
    const { idToken } = req.body;
    if (!idToken) return res.status(400).json({ error: 'ID token required' });

    const googleClient = getGoogleClient();
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;

    let user = await User.findOne({ $or: [{ googleId }, { email }] });

    if (!user) {
      user = new User({
        name,
        email,
        avatar: picture,
        provider: 'google',
        googleId,
      });
      await user.save();
      logger.info(`New Google user: ${email}`);
    } else if (!user.googleId) {
      // Link Google to existing local account
      user.googleId = googleId;
      user.provider = 'google';
      if (!user.avatar) user.avatar = picture;
      await user.save();
    }

    const { accessToken, refreshToken } = generateTokenPair(user._id.toString());
    await user.addRefreshToken(refreshToken, req.headers['user-agent']);

    res.json({
      user: user.toJSON(),
      accessToken,
      refreshToken,
    });
  } catch (error) {
    logger.error('Google auth error:', error);
    if (error.message === 'GOOGLE_CLIENT_ID is missing') {
      return res.status(503).json({ error: 'Google OAuth is not configured on the server.' });
    }
    res.status(401).json({ error: 'Google authentication failed' });
  }
};

// ─── Refresh Token ─────────────────────────────────────────────────────────────
export const refreshToken = async (req, res) => {
  try {
    const { refreshToken: token } = req.body;
    if (!token) return res.status(400).json({ error: 'Refresh token required' });

    const decoded = verifyRefreshToken(token);
    if (decoded.type !== 'refresh') {
      return res.status(401).json({ error: 'Invalid token type' });
    }

    const user = await User.findById(decoded.sub);
    if (!user) return res.status(401).json({ error: 'User not found' });

    const isValid = await user.validateRefreshToken(token);
    if (!isValid) return res.status(401).json({ error: 'Invalid or expired refresh token' });

    // Rotate refresh token (one-time use)
    await user.removeRefreshToken(token);
    const { accessToken, refreshToken: newRefreshToken } = generateTokenPair(user._id.toString());
    await user.addRefreshToken(newRefreshToken, req.headers['user-agent']);

    res.json({ accessToken, refreshToken: newRefreshToken });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Refresh token expired. Please login again.' });
    }
    res.status(401).json({ error: 'Invalid refresh token' });
  }
};

// ─── Logout ───────────────────────────────────────────────────────────────────
export const logout = async (req, res) => {
  try {
    const { refreshToken: token } = req.body;
    if (token && req.user) {
      await req.user.removeRefreshToken(token);
    }
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Logout failed' });
  }
};

export const getMe = async (req, res) => {
  res.json({ user: req.user });
};

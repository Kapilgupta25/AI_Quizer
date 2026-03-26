import jwt from 'jsonwebtoken';

const getAccessSecret = () => process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET;
const getRefreshSecret = () => process.env.JWT_REFRESH_SECRET;

export const generateAccessToken = (userId) => {
  return jwt.sign({ sub: userId, type: 'access' }, getAccessSecret(), {
    expiresIn: process.env.JWT_ACCESS_EXPIRY || '15m',
  });
};

export const generateRefreshToken = (userId) => {
  return jwt.sign({ sub: userId, type: 'refresh' }, getRefreshSecret(), {
    expiresIn: process.env.JWT_REFRESH_EXPIRY || '7d',
  });
};

export const verifyAccessToken = (token) => {
  return jwt.verify(token, getAccessSecret());
};

export const verifyRefreshToken = (token) => {
  return jwt.verify(token, getRefreshSecret());
};

export const generateTokenPair = (userId) => ({
  accessToken: generateAccessToken(userId),
  refreshToken: generateRefreshToken(userId),
});

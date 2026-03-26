import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 50,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    // Null if registered via Google OAuth
    password: {
      type: String,
      default: null,
      select: false, // Never returned in queries by default
    },
    avatar: {
      type: String,
      default: null,
    },
    provider: {
      type: String,
      enum: ['local', 'google'],
      default: 'local',
    },
    googleId: {
      type: String,
      default: null,
      index: true,
      sparse: true,
    },
    // Hashed refresh tokens stored here (allows multi-device logout)
    refreshTokens: [
      {
        token: { type: String, required: true }, // hashed
        createdAt: { type: Date, default: Date.now, expires: '7d' },
        deviceInfo: String,
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    totalQuizzesTaken: { type: Number, default: 0 },
    totalScore: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        delete ret.password;
        delete ret.refreshTokens;
        delete ret.__v;
        return ret;
      },
    },
  }
);

/**
 * Hash password using salt + pepper technique.
 * Salt  → bcrypt generates a unique salt per user (stored inside the hash)
 * Pepper → system-level secret appended before hashing (never stored in DB)
 *          Even if DB is breached, attacker cannot crack without the pepper env var.
 */
userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();

  const pepperedPassword = this.password + process.env.PASSWORD_PEPPER;
  const SALT_ROUNDS = 12; // Cost factor: ~300ms per hash (brute-force resistant)
  this.password = await bcrypt.hash(pepperedPassword, SALT_ROUNDS);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) return false;
  const pepperedCandidate = candidatePassword + process.env.PASSWORD_PEPPER;
  return bcrypt.compare(pepperedCandidate, this.password);
};

userSchema.methods.addRefreshToken = async function (token, deviceInfo) {
  const hashed = await bcrypt.hash(token, 10);
  // Keep max 5 devices logged in
  if (this.refreshTokens.length >= 5) {
    this.refreshTokens.shift();
  }
  this.refreshTokens.push({ token: hashed, deviceInfo });
  await this.save();
};

userSchema.methods.removeRefreshToken = async function (token) {
  const checks = await Promise.all(
    this.refreshTokens.map((t) => bcrypt.compare(token, t.token))
  );
  this.refreshTokens = this.refreshTokens.filter((_, i) => !checks[i]);
  await this.save();
};

userSchema.methods.validateRefreshToken = async function (token) {
  const checks = await Promise.all(
    this.refreshTokens.map((t) => bcrypt.compare(token, t.token))
  );
  return checks.some(Boolean);
};

const User = mongoose.model('User', userSchema);
export default User;

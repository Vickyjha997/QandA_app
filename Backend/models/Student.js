const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const studentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },

  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
  },

  // NEW FIELD
  phoneNumber: {
    type: String,
    required: [true, "Phone number is required"],
    unique: true,
    trim: true,
    match: [/^\+[1-9]\d{7,14}$/, "Invalid phone number format. Use E.164 format like +919876543210"]
  },

  password: {
    type: String,
    minlength: [6, 'Password must be at least 6 characters']
  },

  googleId: { type: String, sparse: true },
  profilePicture: { type: String },
  authProvider: { type: String, enum: ['local', 'google', 'both'], default: 'local' },

  class: { type: String },
  college: { type: String },

  isVerified: { type: Boolean, default: false },

  emailVerification: { otp: String, expiresAt: Date },
  resetPassword: { otp: String, expiresAt: Date },

  lastLogin: { type: Date }

}, { timestamps: true });

studentSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  if (!this.password) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

studentSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('Student', studentSchema);

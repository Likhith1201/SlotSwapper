const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    select: false, // Prevents password from being returned in query results by default
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Middleware to hash password before saving a new user
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare passwords for login
UserSchema.methods.matchPassword = async function (enteredPassword) {
  // 'this.password' will correctly fetch the password due to .select('+password') in the controller
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
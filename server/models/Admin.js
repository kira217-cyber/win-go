// models/admin.js
import mongoose from 'mongoose';

const adminSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  // Optional future fields (uncomment when needed)
  // name: { type: String },
  // role: { type: String, default: 'admin' },
  // createdAt: { type: Date, default: Date.now },
});

// No pre-save hook needed for password hashing anymore
// (we handle hashing manually in the routes)

// Optional: You can keep a placeholder method (but it's not used now)
adminSchema.methods.matchPassword = async function (enteredPassword) {
  throw new Error(
    'Password comparison is handled in routes/adminRoutes.js - do not call this method'
  );
};

const Admin = mongoose.model('Admin', adminSchema);

export default Admin;
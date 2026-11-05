import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const portfolioItemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  type: { type: String, enum: ['video', 'image', 'script', 'audio'], default: 'image' },
  url: { type: String, required: true },
  thumbnail: { type: String },
  rolePlayed: { type: String },
  description: { type: String },
  featured: { type: Boolean, default: false },
  views: { type: Number, default: 0 }
}, { timestamps: true });

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role: {
    type: String,
    required: true,
    enum: [
      'Cinematographer',
      'Actor',
      'Director',
      'Scriptwriter',
      'Sound Mixer',
      'Editor',
      'Producer',
      'Art Director',
      'Lighting / Gaffer',
      'VFX Artist'
    ],
    default: 'Cinematographer'
  },
  // Normalized category slug for blazing-fast indexed filtering
  category: {
    type: String,
    required: true,
    index: true,
    lowercase: true,
    trim: true
  },
  // App-Generated Unique Talent ID (e.g. GC-DIR-4091, GC-DOP-8841)
  creatorId: {
    type: String,
    unique: true,
    sparse: true,
    index: true,
    trim: true
  },
  experience: {
    type: String,
    enum: ['Indie (1-3 yrs)', 'Professional (4-7 yrs)', 'Veteran (8+ yrs)'],
    default: 'Professional (4-7 yrs)'
  },
  bio: { type: String, default: '' },
  location: { type: String, default: 'Los Angeles, CA' },

  // SENSITIVE DATA - Masked by default until connection request accepted!
  phone: { type: String, required: true },
  avatar: { type: String, default: '' }, // unmasked avatar
  avatarBlurred: { type: String, default: '' }, // blurred / masked avatar placeholder

  equipment: [{ type: String }],
  skills: [{ type: String }],
  portfolio: [portfolioItemSchema],

  // AUTOMATED MODERATION: Auto-blocks after > 15 reports
  reports: { type: Number, default: 0, index: true },
  isBlocked: { type: Boolean, default: false, index: true },
  blockReason: { type: String, default: '' },

  connections: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, {
  timestamps: true
});

// Compound and single indexes for query performance
userSchema.index({ category: 1, reports: 1, isBlocked: 1 });
userSchema.index({ name: 'text', bio: 'text', skills: 'text', equipment: 'text' });

// Auto-sync category slug & assign App-Generated Creator ID before saving
userSchema.pre('save', async function (next) {
  if (!this.creatorId) {
    const rolePrefix = (this.role || 'CREW').substring(0, 3).toUpperCase();
    const randNum = Math.floor(1000 + Math.random() * 9000);
    this.creatorId = `GC-${rolePrefix}-${randNum}`;
  }

  if (this.isModified('role') || !this.category) {
    this.category = this.role
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '_')
      .replace(/_+/g, '_');
  }

  // Auto block threshold enforcement
  if (this.reports > 15 && !this.isBlocked) {
    this.isBlocked = true;
    this.blockReason = 'Automated Moderation: Exceeded 15 community safety reports threshold.';
  }

  // Password hashing
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }

  next();
});

// Compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Data Masking helper: Masks phone & avatar unless connected or self
userSchema.methods.toSafeJSON = function (viewerUserId = null, isConnected = false) {
  const isSelf = viewerUserId && this._id.toString() === viewerUserId.toString();
  const obj = this.toObject();

  delete obj.password;

  if (isSelf || isConnected) {
    obj.isMasked = false;
    obj.connectionStatus = isSelf ? 'self' : 'connected';
    // Full data revealed!
    return obj;
  }

  // NOT connected: Mask sensitive data strictly
  obj.isMasked = true;
  obj.connectionStatus = 'unconnected';
  
  // Mask phone
  obj.phone = '+• ••• •••-•••• (Hidden - Connect to view)';
  
  // Use blurred/silhouette avatar
  obj.avatarRaw = obj.avatar;
  obj.avatar = obj.avatarBlurred || '/avatar-placeholder.svg';
  
  return obj;
};

export default mongoose.model('User', userSchema);


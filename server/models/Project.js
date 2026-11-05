import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    default: 'ECHOES OF SILENCE'
  },
  subtitle: {
    type: String,
    default: 'Short Film - Neo-Noir / Psychological Drama'
  },
  status: {
    type: String,
    enum: ['Active', 'In Production', 'Post-Production', 'Completed', 'Hiatus'],
    default: 'Active'
  },
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 65
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  budget: {
    spent: { type: Number, default: 2100 },
    total: { type: Number, default: 3000 },
    breakdown: [{
      item: { type: String, required: true },
      cost: { type: Number, required: true },
      category: { type: String, default: 'Production' }
    }]
  },
  crew: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    role: { type: String },
    confirmed: { type: Boolean, default: true }
  }],
  recentUpdates: [{
    text: { type: String, required: true },
    date: { type: Date, default: Date.now },
    badge: { type: String, default: 'Shot list' }
  }],
  upcoming: {
    count: { type: Number, default: 2 },
    label: { type: String, default: 'Cast Interviews (Today)' }
  }
}, {
  timestamps: true
});

export default mongoose.model('Project', projectSchema);


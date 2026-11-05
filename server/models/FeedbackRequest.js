import mongoose from 'mongoose';

const feedbackRequestSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  category: {
    type: String,
    default: 'Short Film'
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  avatar: {
    type: String,
    default: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
  },
  status: {
    type: String,
    enum: ['Pending', 'Completed'],
    default: 'Pending'
  },
  timelineMonth: {
    type: String,
    default: 'Sep 19'
  },
  submissions: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    userName: String,
    content: String,
    createdAt: { type: Date, default: Date.now }
  }]
}, {
  timestamps: true
});

export default mongoose.model('FeedbackRequest', feedbackRequestSchema);


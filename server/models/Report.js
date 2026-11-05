import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema({
  reporter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reportedUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  reason: {
    type: String,
    required: true,
    enum: [
      'Fake Profile / Impersonation',
      'Inappropriate / Offensive Content',
      'Harassment or Unsolicited Spam',
      'Copyright Infringement',
      'Unprofessional Conduct / Ghosting',
      'Other Violation'
    ]
  },
  details: {
    type: String,
    trim: true,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
});

export default mongoose.model('Report', reportSchema);


import mongoose from 'mongoose';

const connectionSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'declined'],
    default: 'pending',
    index: true
  },
  note: {
    type: String,
    default: 'Would like to connect with you for cinema & short-form film productions.'
  }
}, {
  timestamps: true
});

// Avoid duplicate connections between same pairs
connectionSchema.index({ sender: 1, recipient: 1 }, { unique: true });

export default mongoose.model('Connection', connectionSchema);


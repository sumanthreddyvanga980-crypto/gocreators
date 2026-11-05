import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
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
  text: {
    type: String,
    required: true,
    trim: true
  },
  roleBadge: {
    type: String,
    default: ''
  },
  read: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

messageSchema.index({ sender: 1, recipient: 1, createdAt: 1 });

export default mongoose.model('Message', messageSchema);


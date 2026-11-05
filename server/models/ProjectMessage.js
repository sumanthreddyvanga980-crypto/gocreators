import mongoose from 'mongoose';

const projectMessageSchema = new mongoose.Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
    index: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  text: {
    type: String,
    required: true,
    trim: true
  },
  roleBadge: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

projectMessageSchema.index({ project: 1, createdAt: 1 });

export default mongoose.model('ProjectMessage', projectMessageSchema);


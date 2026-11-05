import express from 'express';
import Message from '../models/Message.js';
import User from '../models/User.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// GET /api/messages/recent - Get latest chats for the right sidebar panel
router.get('/recent', requireAuth, async (req, res) => {
  try {
    const userId = req.user._id;

    // Find all messages involving current user
    const messages = await Message.find({
      $or: [{ sender: userId }, { recipient: userId }]
    })
      .sort({ createdAt: -1 })
      .populate('sender', 'name role avatar category')
      .populate('recipient', 'name role avatar category');

    // Group by conversation partner
    const conversationsMap = new Map();

    for (const msg of messages) {
      const partner = msg.sender._id.toString() === userId.toString() ? msg.recipient : msg.sender;
      if (!partner) continue;
      const partnerId = partner._id.toString();

      if (!conversationsMap.has(partnerId)) {
        conversationsMap.set(partnerId, {
          user: partner,
          lastMessage: msg.text,
          time: msg.createdAt,
          unread: !msg.read && msg.recipient._id.toString() === userId.toString()
        });
      }
    }

    res.json(Array.from(conversationsMap.values()));
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch recent chats', details: err.message });
  }
});

// GET /api/messages/conversation/:userId - Messages with a specific user
router.get('/conversation/:userId', requireAuth, async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const partnerId = req.params.userId;

    const messages = await Message.find({
      $or: [
        { sender: currentUserId, recipient: partnerId },
        { sender: partnerId, recipient: currentUserId }
      ]
    })
      .sort({ createdAt: 1 })
      .populate('sender', 'name role avatar')
      .populate('recipient', 'name role avatar');

    // Mark unread as read
    await Message.updateMany(
      { sender: partnerId, recipient: currentUserId, read: false },
      { $set: { read: true } }
    );

    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load conversation', details: err.message });
  }
});

// POST /api/messages/send - Send a direct message
router.post('/send', requireAuth, async (req, res) => {
  try {
    const { recipientId, text } = req.body;
    if (!recipientId || !text || !text.trim()) {
      return res.status(400).json({ error: 'Recipient ID and text are required.' });
    }

    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ error: 'Recipient not found.' });
    }

    if (recipient.isBlocked) {
      return res.status(403).json({ error: 'Cannot message a blocked user.' });
    }

    const newMsg = new Message({
      sender: req.user._id,
      recipient: recipientId,
      text: text.trim(),
      roleBadge: req.user.role.toUpperCase()
    });

    await newMsg.save();
    const populated = await Message.findById(newMsg._id)
      .populate('sender', 'name role avatar')
      .populate('recipient', 'name role avatar');

    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to send message', details: err.message });
  }
});

export default router;


import express from 'express';
import mongoose from 'mongoose';
import Connection from '../models/Connection.js';
import User from '../models/User.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// GET /api/connections - Get all incoming, outgoing, and active connections
router.get('/', requireAuth, async (req, res) => {
  try {
    if (mongoose.connection.readyState < 1) {
      return res.json({
        incoming: [],
        outgoing: [],
        connected: [],
        totalConnected: 0
      });
    }

    const userId = req.user._id;

    // Incoming requests (Pending, addressed to caller)
    const incoming = await Connection.find({ recipient: userId, status: 'pending' })
      .populate('sender', 'name role avatar avatarBlurred category location experience')
      .sort({ createdAt: -1 });

    // Outgoing requests (Pending, sent by caller)
    const outgoing = await Connection.find({ sender: userId, status: 'pending' })
      .populate('recipient', 'name role avatar avatarBlurred category location experience')
      .sort({ createdAt: -1 });

    // Accepted active connections
    const acceptedConnections = await Connection.find({
      $or: [{ sender: userId }, { recipient: userId }],
      status: 'accepted'
    })
      .populate('sender', 'name role avatar phone email bio category location equipment skills')
      .populate('recipient', 'name role avatar phone email bio category location equipment skills')
      .sort({ updatedAt: -1 });

    // Extract partner user object with fully revealed (unmasked) details!
    const activeFriends = acceptedConnections.map(c => {
      const isSender = c.sender._id.toString() === userId.toString();
      const partner = isSender ? c.recipient : c.sender;
      return {
        connectionId: c._id,
        connectedSince: c.updatedAt,
        user: partner // unmasked because status === accepted!
      };
    });

    res.json({
      incoming,
      outgoing,
      connected: activeFriends,
      totalConnected: activeFriends.length
    });
  } catch (err) {
    console.error('Error fetching connections:', err);
    res.status(500).json({ error: 'Failed to fetch connections', details: err.message });
  }
});

// POST /api/connections/request - Send a new connection request
router.post('/request', requireAuth, async (req, res) => {
  try {
    const { recipientId, note } = req.body;
    const senderId = req.user._id;

    if (!recipientId) {
      return res.status(400).json({ error: 'Recipient ID is required.' });
    }

    if (recipientId.toString() === senderId.toString()) {
      return res.status(400).json({ error: 'You cannot connect with yourself.' });
    }

    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ error: 'Recipient not found.' });
    }

    if (recipient.isBlocked) {
      return res.status(403).json({ error: 'Cannot connect with a suspended user.' });
    }

    // Check existing connection
    const existing = await Connection.findOne({
      $or: [
        { sender: senderId, recipient: recipientId },
        { sender: recipientId, recipient: senderId }
      ]
    });

    if (existing) {
      if (existing.status === 'accepted') {
        return res.status(400).json({ error: 'You are already connected with this creator.' });
      }
      if (existing.status === 'pending') {
        if (existing.sender.toString() === senderId.toString()) {
          return res.status(400).json({ error: 'A connection request is already pending approval.' });
        } else {
          // If the other party already sent a request, auto-accept it!
          existing.status = 'accepted';
          await existing.save();

          await User.findByIdAndUpdate(senderId, { $addToSet: { connections: recipientId } });
          await User.findByIdAndUpdate(recipientId, { $addToSet: { connections: senderId } });

          return res.json({
            message: 'Mutual connection accepted! Personal details are now revealed.',
            status: 'accepted',
            connection: existing
          });
        }
      }
      // If declined before, allow re-request
      existing.status = 'pending';
      existing.sender = senderId;
      existing.recipient = recipientId;
      existing.note = note || 'Would love to collaborate on upcoming cinema projects.';
      await existing.save();

      return res.json({
        message: 'Connection request sent successfully.',
        status: 'pending',
        connection: existing
      });
    }

    const newConnection = new Connection({
      sender: senderId,
      recipient: recipientId,
      status: 'pending',
      note: note || 'Would love to connect and explore cinema collaboration.'
    });

    await newConnection.save();

    res.status(201).json({
      message: 'Connection request sent! Once accepted, personal contact details and photos will be unlocked.',
      connection: newConnection,
      status: 'pending_sent'
    });
  } catch (err) {
    console.error('Error creating connection request:', err);
    res.status(500).json({ error: 'Failed to send connection request', details: err.message });
  }
});

// PUT /api/connections/:id/respond - Explicitly accept or decline connection request
router.put('/:id/respond', requireAuth, async (req, res) => {
  try {
    const { action } = req.body; // 'accept' or 'decline'
    const connectionId = req.params.id;
    const userId = req.user._id;

    if (!['accept', 'decline'].includes(action)) {
      return res.status(400).json({ error: "Action must be 'accept' or 'decline'." });
    }

    const connection = await Connection.findById(connectionId);
    if (!connection) {
      return res.status(404).json({ error: 'Connection request not found.' });
    }

    // Only recipient can accept or decline incoming requests
    if (connection.recipient.toString() !== userId.toString()) {
      return res.status(403).json({ error: 'You are not authorized to respond to this connection request.' });
    }

    if (action === 'accept') {
      connection.status = 'accepted';
      await connection.save();

      // Update both users' connections array
      await User.findByIdAndUpdate(connection.sender, { $addToSet: { connections: connection.recipient } });
      await User.findByIdAndUpdate(connection.recipient, { $addToSet: { connections: connection.sender } });

      const senderUser = await User.findById(connection.sender).select('-password');

      return res.json({
        message: `Connection accepted! You and ${senderUser.name} can now view each other's full contact info and unmasked photos.`,
        status: 'accepted',
        sender: senderUser
      });
    } else {
      connection.status = 'declined';
      await connection.save();

      return res.json({
        message: 'Connection request declined.',
        status: 'declined'
      });
    }
  } catch (err) {
    console.error('Error responding to connection:', err);
    res.status(500).json({ error: 'Failed to process response', details: err.message });
  }
});

// DELETE /api/connections/:id - Disconnect / remove connection
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const connection = await Connection.findById(req.params.id);
    if (!connection) {
      return res.status(404).json({ error: 'Connection not found.' });
    }

    const userId = req.user._id;
    if (connection.sender.toString() !== userId.toString() && connection.recipient.toString() !== userId.toString()) {
      return res.status(403).json({ error: 'Unauthorized to remove this connection.' });
    }

    // Remove mutual links
    await User.findByIdAndUpdate(connection.sender, { $pull: { connections: connection.recipient } });
    await User.findByIdAndUpdate(connection.recipient, { $pull: { connections: connection.sender } });

    await connection.deleteOne();

    res.json({ message: 'Connection removed. Sensitive details are now masked again.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to remove connection', details: err.message });
  }
});

export default router;


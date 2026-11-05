import express from 'express';
import User from '../models/User.js';
import Report from '../models/Report.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// GET /api/moderation/stats - Overview of moderation system
router.get('/stats', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const blockedUsers = await User.countDocuments({ isBlocked: true });
    const reportedUsers = await User.find({ reports: { $gt: 0 } })
      .select('name role category reports isBlocked blockReason')
      .sort({ reports: -1 });

    const recentReports = await Report.find()
      .populate('reporter', 'name role')
      .populate('reportedUser', 'name role reports isBlocked')
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      totalUsers,
      blockedUsers,
      activeUsers: totalUsers - blockedUsers,
      threshold: 15,
      reportedUsers,
      recentReports
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch moderation stats', details: err.message });
  }
});

// POST /api/moderation/test-ban/:id - Quick testing button to simulate >15 reports
router.post('/test-ban/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    user.reports = 16;
    user.isBlocked = true;
    user.blockReason = 'Automated Moderation: Exceeded 15 community safety reports threshold (Automated Ban Triggered).';
    await user.save();

    res.json({
      message: `User ${user.name} reported 16 times. Automatically suspended by moderation engine.`,
      user: {
        id: user._id,
        name: user.name,
        reports: user.reports,
        isBlocked: user.isBlocked,
        blockReason: user.blockReason
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to test ban', details: err.message });
  }
});

// POST /api/moderation/reset/:id - Reset reports and unblock user (for demo resetting)
router.post('/reset/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    user.reports = 0;
    user.isBlocked = false;
    user.blockReason = '';
    await user.save();

    res.json({
      message: `User ${user.name} moderation flags reset to 0. Account restored.`,
      user: {
        id: user._id,
        name: user.name,
        reports: user.reports,
        isBlocked: user.isBlocked
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to reset reports', details: err.message });
  }
});

export default router;


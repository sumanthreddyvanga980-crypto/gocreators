import express from 'express';
import User from '../models/User.js';
import Connection from '../models/Connection.js';
import Report from '../models/Report.js';
import { optionalAuth, requireAuth } from '../middleware/auth.js';
import { upload, optimizeMedia } from '../middleware/upload.js';

const router = express.Router();

// Role synonym mapping to handle singular/plural and natural search terms
const ROLE_SYNONYMS = {
  director: ['director', 'directors', 'directing'],
  cinematographer: ['cinematographer', 'cinematographers', 'cameraman', 'cameramen', 'dop', 'dp', 'camera'],
  actor: ['actor', 'actors', 'actress', 'actresses', 'cast'],
  scriptwriter: ['scriptwriter', 'scriptwriters', 'writer', 'writers', 'screenwriter', 'screenwriters'],
  sound_mixer: ['sound mixer', 'sound', 'audio', 'boom', 'recordist'],
  editor: ['editor', 'editors', 'editing', 'cut'],
  art_director: ['art director', 'art', 'set designer', 'set design', 'props'],
  producer: ['producer', 'producers', 'line producer', 'production manager'],
  lighting_gaffer: ['lighting', 'gaffer', 'grip', 'electric'],
  vfx_artist: ['vfx', 'vfx artist', 'visual effects', 'cgi', 'compositor', 'colorist']
};

// GET /api/crew/categories/counts - Dynamic talent counts per category
router.get('/categories/counts', async (req, res) => {
  try {
    const counts = await User.aggregate([
      { $match: { isBlocked: { $ne: true } } },
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);
    const countsMap = { all: 0 };
    counts.forEach(c => {
      countsMap[c._id] = c.count;
      countsMap.all += c.count;
    });
    res.json(countsMap);
  } catch (err) {
    res.status(500).json({ error: 'Failed to calculate category counts' });
  }
});

// GET /api/crew - Fast, lag-free crew discovery with indexing and conditional masking
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { category, search, creatorId, page = 1, limit = 40 } = req.query;
    const query = {
      isBlocked: { $ne: true }
    };

    const trimmedSearch = search ? search.trim().toLowerCase() : '';
    const trimmedId = creatorId ? creatorId.trim().toLowerCase() : '';

    // If search is provided, check if it explicitly targets another role or category
    let matchedCategoryFromSearch = null;
    if (trimmedSearch) {
      for (const [catKey, syns] of Object.entries(ROLE_SYNONYMS)) {
        if (syns.some(s => trimmedSearch.includes(s) || s.includes(trimmedSearch))) {
          matchedCategoryFromSearch = catKey;
          break;
        }
      }
    }

    // If user searches by App-Generated Creator ID (e.g. "GC-DIR-1024", "GC-DOP-8841", "GC-", or creatorId param)
    const isIdSearch = Boolean(trimmedId) || 
      trimmedSearch.startsWith('gc') || 
      /^[a-z]{2,4}-\d{3,5}$/i.test(trimmedSearch);

    // Apply category filter: If user searches for an ID or specific category, adjust query accordingly
    if (isIdSearch) {
      // Direct ID search takes precedence across all categories
      delete query.category;
      const targetId = trimmedId || trimmedSearch;
      query.creatorId = new RegExp(targetId, 'i');
    } else if (matchedCategoryFromSearch) {
      // User searched for a specific role/category (e.g. "writers", "directors", "dop")
      query.category = matchedCategoryFromSearch;
    } else if (category && category !== 'all') {
      const normalizedCategory = category.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_');
      query.category = normalizedCategory;
    }

    // Search filter across creatorId, name, role, skills, equipment, bio, location, category
    if (trimmedSearch && !matchedCategoryFromSearch && !isIdSearch) {
      const regex = new RegExp(trimmedSearch, 'i');
      query.$or = [
        { creatorId: regex },
        { name: regex },
        { role: regex },
        { category: regex },
        { skills: regex },
        { equipment: regex },
        { bio: regex },
        { location: regex }
      ];
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const totalCount = await User.countDocuments(query);

    // Fetch optimized fields
    const crewMembers = await User.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit, 10))
      .select('-password');

    // If caller is authenticated, compute connection statuses
    let userConnections = [];
    let pendingRequests = [];

    if (req.user) {
      // Find all connections involving caller
      const activeConnections = await Connection.find({
        $or: [
          { sender: req.user._id, status: 'accepted' },
          { recipient: req.user._id, status: 'accepted' }
        ]
      });

      userConnections = activeConnections.map(c => 
        c.sender.toString() === req.user._id.toString() ? c.recipient.toString() : c.sender.toString()
      );

      // Find pending requests
      pendingRequests = await Connection.find({
        $or: [
          { sender: req.user._id, status: 'pending' },
          { recipient: req.user._id, status: 'pending' }
        ]
      });
    }

    const maskedCrew = crewMembers.map(member => {
      const memberIdStr = member._id.toString();
      const isSelf = req.user && req.user._id.toString() === memberIdStr;
      const isConnected = userConnections.includes(memberIdStr);

      let connectionState = 'unconnected';
      if (isSelf) {
        connectionState = 'self';
      } else if (isConnected) {
        connectionState = 'connected';
      } else if (req.user) {
        const pending = pendingRequests.find(p => 
          (p.sender.toString() === req.user._id.toString() && p.recipient.toString() === memberIdStr) ||
          (p.recipient.toString() === req.user._id.toString() && p.sender.toString() === memberIdStr)
        );
        if (pending) {
          connectionState = pending.sender.toString() === req.user._id.toString() ? 'pending_sent' : 'pending_received';
        }
      }

      const safeData = member.toSafeJSON(req.user ? req.user._id : null, isConnected || isSelf);
      safeData.connectionStatus = connectionState;
      return safeData;
    });

    res.json({
      crew: maskedCrew,
      total: totalCount,
      page: parseInt(page, 10),
      totalPages: Math.ceil(totalCount / parseInt(limit, 10))
    });
  } catch (err) {
    console.error('Error fetching crew:', err);
    res.status(500).json({ error: 'Failed to fetch crew directory', details: err.message });
  }
});

// GET /api/crew/:id - Specific profile with conditional masking
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const member = await User.findById(req.params.id);
    if (!member) {
      return res.status(404).json({ error: 'Crew member not found' });
    }

    if (member.isBlocked) {
      return res.status(410).json({ error: 'This profile is currently suspended due to safety reports.' });
    }

    const memberIdStr = member._id.toString();
    const isSelf = req.user && req.user._id.toString() === memberIdStr;

    let isConnected = false;
    let connectionState = 'unconnected';

    if (req.user && !isSelf) {
      const conn = await Connection.findOne({
        $or: [
          { sender: req.user._id, recipient: member._id },
          { sender: member._id, recipient: req.user._id }
        ]
      });

      if (conn) {
        if (conn.status === 'accepted') {
          isConnected = true;
          connectionState = 'connected';
        } else if (conn.status === 'pending') {
          connectionState = conn.sender.toString() === req.user._id.toString() ? 'pending_sent' : 'pending_received';
        }
      }
    } else if (isSelf) {
      connectionState = 'self';
    }

    const safeData = member.toSafeJSON(req.user ? req.user._id : null, isConnected || isSelf);
    safeData.connectionStatus = connectionState;

    res.json(safeData);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load profile', details: err.message });
  }
});

// POST /api/crew/:id/report - Automated Moderation: Strict Report Threshold (>15 reports = auto block)
router.post('/:id/report', requireAuth, async (req, res) => {
  try {
    const reportedUserId = req.params.id;
    const { reason, details = '' } = req.body;

    if (!reason) {
      return res.status(400).json({ error: 'A report reason must be provided.' });
    }

    if (reportedUserId === req.user._id.toString()) {
      return res.status(400).json({ error: 'You cannot report your own profile.' });
    }

    const targetUser = await User.findById(reportedUserId);
    if (!targetUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Record report
    await Report.create({
      reporter: req.user._id,
      reportedUser: targetUser._id,
      reason,
      details
    });

    // Increment reports count
    targetUser.reports = (targetUser.reports || 0) + 1;

    let wasAutoBlocked = false;
    // Strict Report Threshold: > 15 reports automatically blocks account
    if (targetUser.reports > 15) {
      targetUser.isBlocked = true;
      targetUser.blockReason = `Automated Moderation: Received ${targetUser.reports} reports, exceeding maximum allowed threshold (15).`;
      wasAutoBlocked = true;
    }

    await targetUser.save();

    res.json({
      message: wasAutoBlocked
        ? `Report logged. Account has reached ${targetUser.reports} reports and has been automatically suspended by moderation.`
        : `Report logged successfully. Current safety report count: ${targetUser.reports}/15.`,
      reportsCount: targetUser.reports,
      isBlocked: targetUser.isBlocked,
      threshold: 15
    });
  } catch (err) {
    console.error('Report error:', err);
    res.status(500).json({ error: 'Failed to submit report', details: err.message });
  }
});

// POST /api/crew/portfolio - Upload portfolio media with file optimization
router.post('/portfolio/upload', requireAuth, upload.single('media'), async (req, res) => {
  try {
    const { title, rolePlayed, description, type = 'image' } = req.body;

    if (!req.file && !req.body.url) {
      return res.status(400).json({ error: 'Media file or URL is required.' });
    }

    let mediaUrl = req.body.url;
    let thumbnailUrl = '';

    if (req.file) {
      // Automatic optimization using Sharp pipeline
      const optimized = await optimizeMedia(req.file, false);
      mediaUrl = optimized.url;
      thumbnailUrl = optimized.thumbnail;
    }

    const portfolioItem = {
      title: title || 'Production Work',
      rolePlayed: rolePlayed || req.user.role,
      description: description || '',
      type,
      url: mediaUrl,
      thumbnail: thumbnailUrl || mediaUrl,
      views: 0
    };

    req.user.portfolio.push(portfolioItem);
    await req.user.save();

    res.status(201).json({
      message: 'Portfolio item optimized and uploaded successfully.',
      item: portfolioItem,
      portfolio: req.user.portfolio
    });
  } catch (err) {
    console.error('Portfolio upload error:', err);
    res.status(500).json({ error: 'Failed to upload portfolio item', details: err.message });
  }
});

export default router;


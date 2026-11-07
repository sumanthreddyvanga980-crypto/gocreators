import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from '../models/User.js';
import { FALLBACK_CREATORS } from '../data/fallbackStore.js';

export const JWT_SECRET = process.env.JWT_SECRET || 'gocreators_super_secure_jwt_secret_key_2026';

// Required Authentication Middleware
export const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication token required' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    let user = null;
    if (mongoose.connection.readyState >= 1) {
      try {
        user = await User.findById(decoded.id);
      } catch {}
    }
    if (!user) {
      user = FALLBACK_CREATORS.find(c => c._id === decoded.id || c.email === decoded.id);
    }

    if (!user) {
      return res.status(401).json({ error: 'User no longer exists' });
    }

    // AUTOMATED MODERATION GATEWAY:
    // Any account with reports > 15 is automatically blocked
    if (user.isBlocked || user.reports > 15) {
      return res.status(403).json({
        error: 'Account Suspended: Exceeded community report threshold (15+ reports). Access restricted.',
        isBlocked: true,
        reports: user.reports,
        reason: user.blockReason || 'Exceeded 15 reports.'
      });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired authentication token', details: err.message });
  }
};

// Optional Authentication Middleware (for public browsing with personalized masking)
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET);

      let user = null;
      if (mongoose.connection.readyState >= 1) {
        try {
          user = await User.findById(decoded.id);
        } catch {}
      }
      if (!user) {
        user = FALLBACK_CREATORS.find(c => c._id === decoded.id || c.email === decoded.id);
      }

      if (user && !user.isBlocked && user.reports <= 15) {
        req.user = user;
      }
    }
    next();
  } catch (err) {
    // Proceed as unauthenticated guest
    next();
  }
};
    next();
  }
};


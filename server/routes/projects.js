import express from 'express';
import mongoose from 'mongoose';
import Project from '../models/Project.js';
import FeedbackRequest from '../models/FeedbackRequest.js';
import ProjectMessage from '../models/ProjectMessage.js';
import User from '../models/User.js';
import { requireAuth, optionalAuth } from '../middleware/auth.js';
import { FALLBACK_PROJECTS, FALLBACK_REQUESTS, FALLBACK_PROJECT_MESSAGES } from '../data/fallbackStore.js';

const router = express.Router();

// GET /api/projects - Fetch projects (including the featured "ECHOES OF SILENCE")
router.get('/', optionalAuth, async (req, res) => {
  try {
    if (mongoose.connection.readyState < 1) {
      return res.json({
        projects: FALLBACK_PROJECTS,
        feedbackRequests: FALLBACK_REQUESTS
      });
    }

    const projects = await Project.find()
      .populate('owner', 'name role avatar')
      .populate('crew.user', 'name role avatar avatarBlurred category location experience phone creatorId')
      .sort({ updatedAt: -1 });

    const feedbackRequests = await FeedbackRequest.find()
      .populate('createdBy', 'name role avatar')
      .sort({ createdAt: -1 });

    res.json({
      projects: projects.length ? projects : FALLBACK_PROJECTS,
      feedbackRequests: feedbackRequests.length ? feedbackRequests : FALLBACK_REQUESTS
    });
  } catch (err) {
    console.warn('Projects MongoDB query failed, serving active projects:', err.message);
    res.json({
      projects: FALLBACK_PROJECTS,
      feedbackRequests: FALLBACK_REQUESTS
    });
  }
});

// POST /api/projects - Create a new project
router.post('/', requireAuth, async (req, res) => {
  try {
    const { title, subtitle, status, progress, budget, upcoming, recentUpdates } = req.body;

    const project = new Project({
      title: title || 'New Cinema Project',
      subtitle: subtitle || 'Indie Short Film / Reel',
      status: status || 'Active',
      progress: progress || 10,
      owner: req.user._id,
      budget: budget || { 
        spent: 500, 
        total: 2500,
        breakdown: [
          { item: 'Camera Equipment Rental', cost: 1200, category: 'Camera' },
          { item: 'Cast & Actor Fees', cost: 800, category: 'Talent' },
          { item: 'Sound & Foley Post', cost: 500, category: 'Audio' }
        ]
      },
      crew: [{ user: req.user._id, role: req.user.role, confirmed: true }],
      recentUpdates: recentUpdates || [{
        text: 'Project initialized on Go Creators platform.',
        badge: 'Milestone'
      }],
      upcoming: upcoming || { count: 1, label: 'Location Scouting' }
    });

    await project.save();
    const populated = await Project.findById(project._id)
      .populate('owner', 'name role avatar')
      .populate('crew.user', 'name role avatar category creatorId');

    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create project', details: err.message });
  }
});

// PUT /api/projects/:id/budget - User directly updates & estimates budget and line items
router.put('/:id/budget', requireAuth, async (req, res) => {
  try {
    const { spent, total, breakdown } = req.body;
    let project = null;
    if (mongoose.connection.readyState >= 1) {
      try {
        project = await Project.findById(req.params.id);
      } catch {}
    }

    if (!project) {
      // In-memory fallback budget update
      const fb = FALLBACK_PROJECTS[0];
      if (total !== undefined) fb.budget.total = Math.max(0, Number(total));
      if (spent !== undefined) fb.budget.spent = Math.max(0, Number(spent));
      if (Array.isArray(breakdown)) fb.budget.breakdown = breakdown;
      return res.json({
        message: 'Project budget estimation updated successfully.',
        budget: fb.budget,
        project: fb
      });
    }

    if (total !== undefined) {
      project.budget.total = Math.max(0, Number(total));
    }
    if (spent !== undefined) {
      project.budget.spent = Math.max(0, Number(spent));
    }
    if (Array.isArray(breakdown)) {
      project.budget.breakdown = breakdown;
    }

    project.recentUpdates.unshift({
      text: `Budget re-estimated: $${project.budget.spent.toLocaleString()} allocated of $${project.budget.total.toLocaleString()} total budget.`,
      badge: 'Budget Update',
      date: new Date()
    });

    await project.save();
    res.json({
      message: 'Project budget estimation updated successfully.',
      budget: project.budget,
      project
    });
  } catch (err) {
    const fb = FALLBACK_PROJECTS[0];
    res.json({
      message: 'Project budget estimation updated.',
      budget: fb.budget,
      project: fb
    });
  }
});

// POST /api/projects/:id/crew - User adds a new crew member to the project
router.post('/:id/crew', requireAuth, async (req, res) => {
  try {
    const { userId, role } = req.body;
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required to add crew member.' });
    }

    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ error: 'Project not found.' });
    }

    const candidate = await User.findById(userId);
    if (!candidate) {
      return res.status(404).json({ error: 'Candidate not found.' });
    }

    const assignedRole = role || candidate.role || 'Crew Member';

    // Check if already in project crew
    const existingIndex = project.crew.findIndex(c => c.user && c.user.toString() === userId.toString());
    if (existingIndex >= 0) {
      project.crew[existingIndex].role = assignedRole;
      project.crew[existingIndex].confirmed = true;
    } else {
      project.crew.push({
        user: candidate._id,
        role: assignedRole,
        confirmed: true
      });
    }

    project.recentUpdates.unshift({
      text: `Added ${candidate.name} as ${assignedRole} to the production team.`,
      badge: 'Crew Notice',
      date: new Date()
    });

    await project.save();

    // Also auto-post a welcome announcement in project's common chat room
    await ProjectMessage.create({
      project: project._id,
      sender: req.user._id,
      text: `🎬 Welcome ${candidate.name} to the production crew as ${assignedRole}!`,
      roleBadge: req.user.role.toUpperCase()
    });

    const updated = await Project.findById(project._id)
      .populate('owner', 'name role avatar')
      .populate('crew.user', 'name role avatar avatarBlurred category location experience phone creatorId');

    res.json({
      message: `${candidate.name} added to project crew successfully!`,
      project: updated
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add crew member to project', details: err.message });
  }
});

// DELETE /api/projects/:id/crew/:userId - Remove a crew member from the project
router.delete('/:id/crew/:userId', requireAuth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ error: 'Project not found.' });
    }

    project.crew = project.crew.filter(c => c.user && c.user.toString() !== req.params.userId.toString());
    await project.save();

    const updated = await Project.findById(project._id)
      .populate('owner', 'name role avatar')
      .populate('crew.user', 'name role avatar category creatorId');

    res.json({ message: 'Crew member removed from project.', project: updated });
  } catch (err) {
    res.status(500).json({ error: 'Failed to remove crew member', details: err.message });
  }
});

// GET /api/projects/:id/messages - Common Chat Area for all project members
router.get('/:id/messages', requireAuth, async (req, res) => {
  try {
    if (mongoose.connection.readyState < 1) {
      return res.json(FALLBACK_PROJECT_MESSAGES);
    }

    const messages = await ProjectMessage.find({ project: req.params.id })
      .populate('sender', 'name role avatar creatorId')
      .sort({ createdAt: 1 });

    res.json(messages.length ? messages : FALLBACK_PROJECT_MESSAGES);
  } catch (err) {
    res.json(FALLBACK_PROJECT_MESSAGES);
  }
});

// POST /api/projects/:id/messages - Post message to Common Project Chat Area
router.post('/:id/messages', requireAuth, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'Message text cannot be empty.' });
    }

    if (mongoose.connection.readyState < 1) {
      const fallbackMsg = {
        _id: 'pmsg_' + Date.now(),
        project: req.params.id,
        sender: {
          name: req.user?.name || 'Crew Member',
          role: req.user?.role || 'Crew',
          avatar: req.user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80',
          creatorId: req.user?.creatorId || 'GC-CREW-1001'
        },
        roleBadge: req.user?.role?.toUpperCase() || 'CREW',
        text: text.trim(),
        createdAt: new Date().toISOString()
      };
      FALLBACK_PROJECT_MESSAGES.push(fallbackMsg);
      return res.status(201).json(fallbackMsg);
    }

    const project = await Project.findById(req.params.id);
    if (!project) {
      const fallbackMsg = {
        _id: 'pmsg_' + Date.now(),
        project: req.params.id,
        sender: {
          name: req.user?.name || 'Crew Member',
          role: req.user?.role || 'Crew',
          avatar: req.user?.avatar,
          creatorId: req.user?.creatorId
        },
        roleBadge: req.user?.role?.toUpperCase() || 'CREW',
        text: text.trim(),
        createdAt: new Date().toISOString()
      };
      FALLBACK_PROJECT_MESSAGES.push(fallbackMsg);
      return res.status(201).json(fallbackMsg);
    }

    const newMsg = new ProjectMessage({
      project: project._id,
      sender: req.user._id,
      text: text.trim(),
      roleBadge: req.user.role?.toUpperCase() || 'CREW'
    });

    await newMsg.save();

    const populated = await ProjectMessage.findById(newMsg._id)
      .populate('sender', 'name role avatar creatorId');

    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to send message to project chat', details: err.message });
  }
});

// PUT /api/projects/:id/update - Add update or adjust progress
router.put('/:id/update', requireAuth, async (req, res) => {
  try {
    const { progress, updateText, badge } = req.body;
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    if (progress !== undefined) {
      project.progress = Math.min(100, Math.max(0, Number(progress)));
    }

    if (updateText) {
      project.recentUpdates.unshift({
        text: updateText,
        badge: badge || 'Crew Note',
        date: new Date()
      });
    }

    await project.save();
    res.json(project);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update project', details: err.message });
  }
});

// POST /api/projects/feedback/:id/submit - Submit feedback response
router.post('/feedback/:id/submit', requireAuth, async (req, res) => {
  try {
    const { comments } = req.body;
    const feedbackReq = await FeedbackRequest.findById(req.params.id);

    if (!feedbackReq) {
      return res.status(404).json({ error: 'Feedback request not found' });
    }

    feedbackReq.submissions.push({
      user: req.user._id,
      userName: req.user.name,
      content: comments || 'Reviewed and approved for production.',
      createdAt: new Date()
    });

    feedbackReq.status = 'Completed';
    await feedbackReq.save();

    res.json({ message: 'Feedback submitted successfully!', feedback: feedbackReq });
  } catch (err) {
    res.status(500).json({ error: 'Failed to submit feedback', details: err.message });
  }
});

export default router;

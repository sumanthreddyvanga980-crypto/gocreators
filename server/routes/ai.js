import express from 'express';
import User from '../models/User.js';
import { optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// Pre-defined expert answers for common cinema prompts matching the mockup & domain
const getCinemaGuidance = async (query, user) => {
  const q = query.toLowerCase();

  // If user asks for visual approaches or diner scene (as in reference screenshot!)
  if (q.includes('diner') || q.includes('visual approach') || q.includes('lighting')) {
    return {
      text: `Here are three distinct visual approaches for your scene:

1. **Cinematic Noir**: High contrast lighting, deep shadows, and rain-streaked windows. Focus on low-key illumination, rim lighting on characters, and sodium-vapor orange vs cyan contrast.
2. **Saturated 70s Retro**: Warm, filtered practical neon lights, textured surfaces, tungsten bulb glow, and a palette of deep vintage reds and mustard yellows. Focus on nostalgic anamorphic flare and organic film grain.
3. **Naturalistic Minimalism**: Soft, diffused window light, cool muted tones, and clean, simple framing. Focus on subtlety, micro-expressions, and spatial depth.`,
      suggestions: [
        'Find Cinematographers with anamorphic lenses',
        'Draft shot list for Night Street scene',
        'Recommend color grading LUTs'
      ],
      recommendedRoles: ['Cinematographer', 'Lighting / Gaffer', 'Art Director']
    };
  }

  // If user asks for crew recommendations or hiring
  if (q.includes('crew') || q.includes('hire') || q.includes('find') || q.includes('recommend') || q.includes('dop') || q.includes('cameraman') || q.includes('actor') || q.includes('director')) {
    let roleFilter = '';
    if (q.includes('cameraman') || q.includes('cinematographer') || q.includes('dop')) roleFilter = 'cinematographer';
    else if (q.includes('actor') || q.includes('actress')) roleFilter = 'actor';
    else if (q.includes('director')) roleFilter = 'director';
    else if (q.includes('writer') || q.includes('script')) roleFilter = 'scriptwriter';
    else if (q.includes('editor')) roleFilter = 'editor';
    else if (q.includes('sound')) roleFilter = 'sound_mixer';

    let dbQuery = { isBlocked: { $ne: true } };
    if (roleFilter) {
      dbQuery.category = roleFilter;
    }

    const matchedCrew = await User.find(dbQuery)
      .limit(3)
      .select('name role location experience equipment skills avatar avatarBlurred');

    const names = matchedCrew.map(c => `• **${c.name}** (${c.role} • ${c.location}) - Equipped with: ${c.equipment?.slice(0, 2).join(', ') || 'Industry standard gear'}`).join('\n');

    return {
      text: `Based on your short-form cinema criteria, here are verified top-rated creators matching your requirements:\n\n${names}\n\n*Note: Personal contact numbers & unmasked HD photos remain masked until you send and they accept your connection request.*`,
      matchedCrew,
      suggestions: [
        'Send connection requests to shortlisted crew',
        'Filter crew by camera gear',
        'How does privacy masking work?'
      ],
      recommendedRoles: roleFilter ? [roleFilter] : ['Cinematographer', 'Editor', 'Sound Mixer']
    };
  }

  // If user asks about privacy, masking, or connection mechanics
  if (q.includes('privacy') || q.includes('mask') || q.includes('phone') || q.includes('protect')) {
    return {
      text: `🔒 **Go Creators Privacy Mechanics:**
• **Zero Default Exposure:** All phone numbers and profile photos are masked by default to protect creators from cold spam and harassment.
• **Conditional Visibility:** Once you send a connection request and the creator explicitly clicks "Accept", personal phone numbers and high-resolution profile photos are instantly unmasked.
• **You are always in control:** You can disconnect at any time to re-mask your details.`,
      suggestions: [
        'How to report suspicious accounts?',
        'Browse Cinematographers',
        'Update my portfolio'
      ]
    };
  }

  // If user asks about moderation or reporting threshold
  if (q.includes('report') || q.includes('safety') || q.includes('ban') || q.includes('block') || q.includes('threshold')) {
    return {
      text: `🛡️ **Automated Moderation & Safety Protocol:**
• **Strict 15-Report Threshold:** Any account accumulating more than 15 valid community safety reports is **instantly and automatically suspended** by our moderation engine.
• **Instant Access Revocation:** Suspended accounts are immediately blocked from logging in, their profiles are hidden from discovery, and active sessions are terminated.
• You can report any profile directly using the 'Flag / Report' button on their card.`,
      suggestions: [
        'Test automated ban threshold',
        'Check platform guidelines',
        'Go to Dashboard'
      ]
    };
  }

  // Default intelligent cinema copilot response
  return {
    text: `🎬 **Go Creators Production Copilot:**
I can assist you with:
• **Crew Discovery:** Match DOPs, Actors, Directors, Editors, or Sound Mixers by camera package (RED, Sony FX3, Arri) and indie budget.
• **Creative Visuals:** Suggest lighting concepts, camera movements (dolly, handheld, gimbal), and mood palettes.
• **Project Guidance:** Reviewing shot lists, scene feedback requests, and budget allocations for short films and reels.

What kind of cinema project are you assembling today?`,
    suggestions: [
      'Suggest 3 unique visual approaches for the diner scene',
      'Find Cinematographers with 4K gear',
      'How does privacy masking protect my phone number?'
    ]
  };
};

router.post('/chat', optionalAuth, async (req, res) => {
  try {
    const { message } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message cannot be empty.' });
    }

    const guidance = await getCinemaGuidance(message, req.user);
    res.json(guidance);
  } catch (err) {
    console.error('AI chat error:', err);
    res.status(500).json({ error: 'Failed to process AI response', details: err.message });
  }
});

export default router;


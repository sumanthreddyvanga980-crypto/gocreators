import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Connection from './models/Connection.js';
import Project from './models/Project.js';
import FeedbackRequest from './models/FeedbackRequest.js';
import Message from './models/Message.js';
import Report from './models/Report.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/gocreators';

const sampleUsers = [
  // DIRECTORS
  {
    creatorId: 'GC-DIR-1024',
    name: 'Jane Reynolds',
    email: 'jane@gocreators.io',
    password: 'password123',
    role: 'Director',
    category: 'director',
    experience: 'Veteran (8+ yrs)',
    location: 'Los Angeles, CA',
    phone: '+1 (310) 555-0192',
    bio: 'Independent film director specializing in neo-noir psychological thrillers and cinematic festival shorts. Sundance 2024 shortlisted.',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80',
    avatarBlurred: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=360&auto=format&fit=crop&q=20&blur=25',
    equipment: ['Arri Alexa Mini LF', 'Cooke Anamorphic /i', 'Director Viewfinder Mark Vb'],
    skills: ['Directing', 'Visual Storytelling', 'Actor Coaching', 'Pitch Deck Design'],
    reports: 0,
    isBlocked: false,
    portfolio: [
      {
        title: 'Echoes of Silence (Teaser)',
        type: 'video',
        url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        thumbnail: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=500&auto=format&fit=crop&q=80',
        rolePlayed: 'Director & Co-Writer',
        description: 'Atmospheric teaser for upcoming indie neo-noir short film.'
      }
    ]
  },
  {
    name: 'Kabir Varma',
    email: 'kabir@gocreators.io',
    password: 'password123',
    role: 'Director',
    category: 'director',
    experience: 'Professional (4-7 yrs)',
    location: 'Mumbai, India',
    phone: '+91 98201 55432',
    bio: 'High-octane action and grounded crime-drama director. Known for gritty single-take sequences and intense character conflicts.',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=500&auto=format&fit=crop&q=80',
    avatarBlurred: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=360&auto=format&fit=crop&q=20&blur=25',
    equipment: ['Sony FX9', 'Cooke SP3 Full Frame Primes', 'DJI Ronin 4D'],
    skills: ['Action Choreography', 'Stunt Coordination', 'Fast-Paced Blocking'],
    reports: 0,
    isBlocked: false
  },
  {
    name: 'Maya Lin',
    email: 'mayalin@gocreators.io',
    password: 'password123',
    role: 'Director',
    category: 'director',
    experience: 'Professional (4-7 yrs)',
    location: 'New York, NY',
    phone: '+1 (212) 555-8833',
    bio: 'Music video & commercial director blending high-fashion art aesthetics with poetic visual storytelling.',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500&auto=format&fit=crop&q=80',
    avatarBlurred: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=360&auto=format&fit=crop&q=20&blur=25',
    equipment: ['ARRI Alexa 35', 'Zeiss Supreme Radiance'],
    skills: ['Color Palette Supervision', 'Commercial Pitching', 'Mood Film Direction'],
    reports: 0,
    isBlocked: false
  },

  // CINEMATOGRAPHERS / CAMERAMEN / DOP
  {
    creatorId: 'GC-DOP-8841',
    name: 'Mark Davis',
    email: 'mark@gocreators.io',
    password: 'password123',
    role: 'Cinematographer',
    category: 'cinematographer',
    experience: 'Professional (4-7 yrs)',
    location: 'Los Angeles, CA',
    phone: '+1 (323) 555-8841',
    bio: 'DOP focusing on anamorphic street cinematography, moody low-light setups, and high-energy commercial reels.',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=80',
    avatarBlurred: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=360&auto=format&fit=crop&q=20&blur=25',
    equipment: ['RED V-Raptor 8K', 'Sony FX3', 'Atlas Orion Anamorphic Primes', 'Aputure 600d Pro'],
    skills: ['Low-Light Cinematography', 'Gimbal Operator', 'Steadicam', 'Color Grading'],
    reports: 0,
    isBlocked: false,
    portfolio: [
      {
        title: 'Midnight Rain Drive',
        type: 'video',
        url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
        thumbnail: 'https://images.unsplash.com/photo-1518173946687-a4c8a383392e?w=500&auto=format&fit=crop&q=80',
        rolePlayed: 'Director of Photography',
        description: 'Shot on RED V-Raptor with vintage anamorphic glass.'
      }
    ]
  },
  {
    name: 'Elena Rostova',
    email: 'elena@gocreators.io',
    password: 'password123',
    role: 'Cinematographer',
    category: 'cinematographer',
    experience: 'Professional (4-7 yrs)',
    location: 'Vancouver, Canada',
    phone: '+1 (604) 555-9921',
    bio: 'Director of Photography specialized in atmospheric mood, rain lighting, and high frame rate action shorts.',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=500&auto=format&fit=crop&q=80',
    avatarBlurred: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=360&auto=format&fit=crop&q=20&blur=25',
    equipment: ['ARRI Amira', 'Zeiss Master Primes', 'Ronin 2 Gimbal'],
    skills: ['Night Lighting', 'Car Rigs', 'Color Space Calibration'],
    reports: 0,
    isBlocked: false
  },
  {
    name: 'Ravi Teja',
    email: 'ravi@gocreators.io',
    password: 'password123',
    role: 'Cinematographer',
    category: 'cinematographer',
    experience: 'Indie (1-3 yrs)',
    location: 'Austin, TX',
    phone: '+1 (512) 555-3211',
    bio: 'FPV drone pilot & dynamic gimbal cinematographer. Delivers breathless chase angles for action shorts & reels.',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=500&auto=format&fit=crop&q=80',
    avatarBlurred: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=360&auto=format&fit=crop&q=20&blur=25',
    equipment: ['DJI Inspire 3 (8K RAW)', 'Custom 6S FPV Cinelifter', 'Sony FX6'],
    skills: ['FPV Cinematic Chases', 'Aerial Direction', 'Wireless Focus Tracking'],
    reports: 0,
    isBlocked: false
  },

  // SCRIPTWRITERS / WRITERS
  {
    creatorId: 'GC-WRI-3390',
    name: 'Les Martin',
    email: 'les@gocreators.io',
    password: 'password123',
    role: 'Scriptwriter',
    category: 'scriptwriter',
    experience: 'Professional (4-7 yrs)',
    location: 'New York, NY',
    phone: '+1 (212) 555-3390',
    bio: 'Award-winning screenwriter crafting tight, dialogue-driven chamber dramas and psychological thrillers.',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500&auto=format&fit=crop&q=80',
    avatarBlurred: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=360&auto=format&fit=crop&q=20&blur=25',
    equipment: ['Final Draft 13', 'Highland 2', 'Scrivener'],
    skills: ['Screenplay Development', 'Dialogue Punch-Up', 'Script Doctoring', 'Story Architecture'],
    reports: 0,
    isBlocked: false
  },
  {
    name: 'Ananya Sen',
    email: 'ananya@gocreators.io',
    password: 'password123',
    role: 'Scriptwriter',
    category: 'scriptwriter',
    experience: 'Professional (4-7 yrs)',
    location: 'Toronto, Canada',
    phone: '+1 (416) 555-6677',
    bio: 'Speculative fiction & horror short film writer. Specializes in plot twists, pacing analysis, and festival-winning loglines.',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=500&auto=format&fit=crop&q=80',
    avatarBlurred: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=360&auto=format&fit=crop&q=20&blur=25',
    equipment: ['Final Draft 13', 'Arc Studio Pro'],
    skills: ['Sci-Fi Worldbuilding', 'Suspense Escalation', 'Short Film Formats'],
    reports: 0,
    isBlocked: false
  },

  // ACTORS
  {
    creatorId: 'GC-ACT-7762',
    name: 'Ava Sterling',
    email: 'ava@gocreators.io',
    password: 'password123',
    role: 'Actor',
    category: 'actor',
    experience: 'Professional (4-7 yrs)',
    location: 'Los Angeles, CA',
    phone: '+1 (424) 555-7762',
    bio: 'Screen Actor Guild (SAG-AFTRA) eligible actress. Experienced in method acting, voice performance, and physical combat.',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500&auto=format&fit=crop&q=80',
    avatarBlurred: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=360&auto=format&fit=crop&q=20&blur=25',
    equipment: ['Home Studio Audio Booth', 'Shure SM7B'],
    skills: ['Method Acting', 'Accents & Dialects', 'Stage Combat', 'Voiceover'],
    reports: 0,
    isBlocked: false
  },
  {
    name: 'Rohan Mehra',
    email: 'rohan@gocreators.io',
    password: 'password123',
    role: 'Actor',
    category: 'actor',
    experience: 'Indie (1-3 yrs)',
    location: 'London, UK',
    phone: '+44 20 7946 0881',
    bio: 'Action & dramatic actor with formal martial arts training (Judo & Krav Maga). Ideal for physical roles and intense confrontations.',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=80',
    avatarBlurred: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=360&auto=format&fit=crop&q=20&blur=25',
    equipment: ['Stunt Harness', 'Performance Capture Rig'],
    skills: ['Martial Arts Stunts', 'Physical Theatre', 'Intense Dialogues'],
    reports: 0,
    isBlocked: false
  },

  // EDITORS
  {
    name: 'Sarah Jenkins',
    email: 'sarah@gocreators.io',
    password: 'password123',
    role: 'Editor',
    category: 'editor',
    experience: 'Veteran (8+ yrs)',
    location: 'London, UK',
    phone: '+44 20 7946 0912',
    bio: 'Senior offline & online film editor. Master of pacing, rhythmic editing, and sound design pre-mix.',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500&auto=format&fit=crop&q=80',
    avatarBlurred: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=360&auto=format&fit=crop&q=20&blur=25',
    equipment: ['DaVinci Resolve Studio', 'Premiere Pro', 'Avid Media Composer', 'ProArt OLED Reference Monitor'],
    skills: ['Narrative Rhythm', 'Pacing', 'Multi-Cam Editing', 'Proxy Workflows'],
    reports: 0,
    isBlocked: false
  },
  {
    name: 'Lucas Moreau',
    email: 'lucas@gocreators.io',
    password: 'password123',
    role: 'Editor',
    category: 'editor',
    experience: 'Professional (4-7 yrs)',
    location: 'Montreal, Canada',
    phone: '+1 (514) 555-4321',
    bio: 'Fast-paced teaser and film reel editor. Specialist in sound-synced kinetic cuts, match cuts, and title sequences.',
    avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=500&auto=format&fit=crop&q=80',
    avatarBlurred: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=360&auto=format&fit=crop&q=20&blur=25',
    equipment: ['Mac Studio M2 Ultra', 'Speed Editor Console', 'After Effects'],
    skills: ['Kinetic Editing', 'Trailer Cuts', 'Rhythm & Match Cuts'],
    reports: 0,
    isBlocked: false
  },

  // SOUND MIXERS
  {
    name: 'Ben Burtt Jr.',
    email: 'ben@gocreators.io',
    password: 'password123',
    role: 'Sound Mixer',
    category: 'sound_mixer',
    experience: 'Professional (4-7 yrs)',
    location: 'Atlanta, GA',
    phone: '+1 (404) 555-1234',
    bio: 'Location sound recordist and boom operator with extensive experience in cinema audio and foley recording.',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=500&auto=format&fit=crop&q=80',
    avatarBlurred: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=360&auto=format&fit=crop&q=20&blur=25',
    equipment: ['Sound Devices 833', 'Sennheiser MKH 416', 'Lectrosonics Wireless', 'K-Tek Boom Pole'],
    skills: ['Field Recording', 'Boom Operation', 'Dialog Restoration', 'Ambisonics'],
    reports: 0,
    isBlocked: false
  },
  {
    name: 'Kenji Sato',
    email: 'kenji@gocreators.io',
    password: 'password123',
    role: 'Sound Mixer',
    category: 'sound_mixer',
    experience: 'Veteran (8+ yrs)',
    location: 'Tokyo / Los Angeles',
    phone: '+81 90 5552 1199',
    bio: 'Sound designer & re-recording mixer. Creates bespoke psychoacoustic textures, eerie ambiances, and punchy foley for cinema.',
    avatar: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=500&auto=format&fit=crop&q=80',
    avatarBlurred: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=360&auto=format&fit=crop&q=20&blur=25',
    equipment: ['Pro Tools Ultimate', 'Genelec 7.1.4 Atmos Monitor Array', 'Korg Synthesizers'],
    skills: ['Dolby Atmos Mix', 'Foley Creation', 'Sub-Bass Design'],
    reports: 0,
    isBlocked: false
  },

  // ART DIRECTORS
  {
    name: 'Marcus Chen',
    email: 'marcus@gocreators.io',
    password: 'password123',
    role: 'Art Director',
    category: 'art_director',
    experience: 'Indie (1-3 yrs)',
    location: 'Austin, TX',
    phone: '+1 (512) 555-4433',
    bio: 'Set designer creating immersive, gritty retro sets, neon signages, and prop curation for indie films.',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=500&auto=format&fit=crop&q=80',
    avatarBlurred: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=360&auto=format&fit=crop&q=20&blur=25',
    equipment: ['SketchUp Pro', 'Vectorworks', 'Photoshop Concept Rig'],
    skills: ['Set Dressing', 'Period Accuracy', 'Practical Props', 'Moodboards'],
    reports: 0,
    isBlocked: false
  },

  // PRODUCERS
  {
    name: 'Michael Thorne',
    email: 'thorne@gocreators.io',
    password: 'password123',
    role: 'Producer',
    category: 'producer',
    experience: 'Veteran (8+ yrs)',
    location: 'Los Angeles, CA',
    phone: '+1 (310) 555-7711',
    bio: 'Indie film producer with 14 short film credits in Cannes Court Métrage & Tribeca. Expert in tax credits, SAG contracts, and distribution.',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=500&auto=format&fit=crop&q=80',
    avatarBlurred: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=360&auto=format&fit=crop&q=20&blur=25',
    equipment: ['Movie Magic Budgeting', 'Showbiz Scheduling'],
    skills: ['Film Financing', 'SAG Compliance', 'Festival Circuit Strategy', 'Executive Pitching'],
    reports: 0,
    isBlocked: false
  },

  // LIGHTING / GAFFERS
  {
    name: 'Victor Vance',
    email: 'victor@gocreators.io',
    password: 'password123',
    role: 'Lighting / Gaffer',
    category: 'lighting_gaffer',
    experience: 'Professional (4-7 yrs)',
    location: 'Miami, FL',
    phone: '+1 (305) 555-8822',
    bio: 'Chief Lighting Technician (Gaffer) specialized in neon cyberpunk aesthetics, high-output HMI daylight simulation, and Astera wireless DMX.',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=500&auto=format&fit=crop&q=80',
    avatarBlurred: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=360&auto=format&fit=crop&q=20&blur=25',
    equipment: ['Aputure 1200d Pro', 'Astera Titan Tubes (8-Kit)', 'Blackout DMX Console'],
    skills: ['Wireless DMX Programming', 'Color Temperature Mixing', 'Generator Safety'],
    reports: 0,
    isBlocked: false
  },

  // VFX ARTISTS / COLORISTS
  {
    name: 'Nina Patel',
    email: 'nina@gocreators.io',
    password: 'password123',
    role: 'VFX Artist',
    category: 'vfx_artist',
    experience: 'Professional (4-7 yrs)',
    location: 'London, UK',
    phone: '+44 20 7946 0441',
    bio: 'Lead Compositor & Colorist. Specializes in 3D camera tracking, muzzle flashes, set extensions, and vintage 35mm film stock emulation.',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80',
    avatarBlurred: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=360&auto=format&fit=crop&q=20&blur=25',
    equipment: ['DaVinci Advanced Panel', 'Foundry NukeX', 'Houdini FX'],
    skills: ['3D Clean Plate Roto', 'CGI Set Extension', 'Film Grain Profiling', 'ACES Workflow'],
    reports: 0,
    isBlocked: false
  },

  // MODERATION TEST USERS
  {
    name: 'Suspended Creator (16 Reports)',
    email: 'flagged@gocreators.io',
    password: 'password123',
    role: 'Actor',
    category: 'actor',
    experience: 'Indie (1-3 yrs)',
    location: 'Miami, FL',
    phone: '+1 (305) 555-9000',
    bio: 'Profile flagged for community violations.',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=500&auto=format&fit=crop&q=80',
    avatarBlurred: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=360&auto=format&fit=crop&q=20&blur=25',
    reports: 16, // > 15 strictly triggers automatic block
    isBlocked: true,
    blockReason: 'Automated Moderation: Exceeded 15 community safety reports threshold (16 reports recorded).'
  },
  {
    name: 'Warning Threshold Test User',
    email: 'warning@gocreators.io',
    password: 'password123',
    role: 'Cinematographer',
    category: 'cinematographer',
    experience: 'Indie (1-3 yrs)',
    location: 'Chicago, IL',
    phone: '+1 (312) 555-7788',
    bio: 'Account currently sitting at 14 reports to easily test the 15-report automatic ban mechanism!',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=500&auto=format&fit=crop&q=80',
    avatarBlurred: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=360&auto=format&fit=crop&q=20&blur=25',
    reports: 14, // 1 away from automatic block
    isBlocked: false
  }
];

const seedDatabase = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('[Seed]: Connected to MongoDB...');

    // Clear old data
    await User.deleteMany({});
    await Connection.deleteMany({});
    await Project.deleteMany({});
    await FeedbackRequest.deleteMany({});
    await Message.deleteMany({});
    await Report.deleteMany({});

    console.log('[Seed]: Cleared existing collections.');

    // Create users
    const createdUsers = [];
    for (const u of sampleUsers) {
      const user = new User(u);
      await user.save();
      createdUsers.push(user);
    }

    const jane = createdUsers.find(u => u.email === 'jane@gocreators.io');
    const mark = createdUsers.find(u => u.email === 'mark@gocreators.io');
    const les = createdUsers.find(u => u.email === 'les@gocreators.io');
    const ava = createdUsers.find(u => u.email === 'ava@gocreators.io');
    const marcus = createdUsers.find(u => u.email === 'marcus@gocreators.io');

    // Establish mutual accepted connection between Jane & Mark
    const conn1 = new Connection({
      sender: jane._id,
      recipient: mark._id,
      status: 'accepted',
      note: 'Hey Mark, loved your anamorphic low-light reel! Let’s collaborate on Echoes of Silence.'
    });
    await conn1.save();
    jane.connections.push(mark._id);
    mark.connections.push(jane._id);

    // Mutual connection with Les
    const conn2 = new Connection({
      sender: les._id,
      recipient: jane._id,
      status: 'accepted',
      note: 'Script revisions ready for review.'
    });
    await conn2.save();
    jane.connections.push(les._id);
    les.connections.push(jane._id);

    // Pending connection from Ava to Jane
    const conn3 = new Connection({
      sender: ava._id,
      recipient: jane._id,
      status: 'pending',
      note: 'Hi Jane! Submitting for the lead role in Echoes of Silence. Let’s connect!'
    });
    await conn3.save();

    await jane.save();
    await mark.save();
    await les.save();

    // Create Featured Project matching Reference Mockup: "ECHOES OF SILENCE"
    const featuredProject = new Project({
      title: 'ECHOES OF SILENCE',
      subtitle: 'Short Film - Neo-Noir / Psychological Drama',
      status: 'Active',
      progress: 65,
      owner: jane._id,
      budget: { spent: 2100, total: 3000 },
      crew: [
        { user: mark._id, role: 'Cinematographer', confirmed: true },
        { user: createdUsers[9]._id, role: 'Editor', confirmed: true },
        { user: les._id, role: 'Writer', confirmed: true },
        { user: ava._id, role: 'Actor', confirmed: true },
        { user: createdUsers[11]._id, role: 'Sound Mixer', confirmed: true },
        { user: marcus._id, role: 'Art Director', confirmed: true }
      ],
      recentUpdates: [
        {
          text: "Shot list approved and crew notified for 'Night Street' scene",
          date: new Date(),
          badge: 'Shot List'
        },
        {
          text: 'Script changes finalized and sent to all',
          date: new Date(Date.now() - 86400000),
          badge: 'Script'
        }
      ],
      upcoming: {
        count: 2,
        label: 'Cast Interviews (Today)'
      }
    });
    await featuredProject.save();

    // Create Feedback Requests
    await FeedbackRequest.create([
      {
        title: 'Script Draft - Scene 12',
        category: 'Short Film',
        project: featuredProject._id,
        createdBy: les._id,
        avatar: les.avatar,
        status: 'Pending',
        timelineMonth: 'Sep 19'
      },
      {
        title: 'Diner Set Design',
        category: 'Sher Set',
        project: featuredProject._id,
        createdBy: marcus._id,
        avatar: marcus.avatar,
        status: 'Pending',
        timelineMonth: 'Sep 19'
      }
    ]);

    // Create Initial Messages for "RECENT CHATS" panel matching Mockup
    await Message.create([
      {
        sender: mark._id,
        recipient: jane._id,
        text: 'Sent the mood board for the diner scene. High contrast noir tones as discussed.',
        roleBadge: 'CINEMATOGRAPHER',
        read: false
      },
      {
        sender: les._id,
        recipient: jane._id,
        text: 'What is the tone for Scene 14? Should we lean into psychological tension or immediate confrontation?',
        roleBadge: 'WRITER',
        read: false
      },
      {
        sender: ava._id,
        recipient: jane._id,
        text: 'I have a new headshot and scene reel to upload for the role.',
        roleBadge: 'ACTOR',
        read: false
      }
    ]);

    console.log(`[Seed]: Successfully seeded database with ${createdUsers.length} Cinema Creators across 10 categories!`);
    process.exit(0);
  } catch (err) {
    console.error('[Seed Error]:', err);
    process.exit(1);
  }
};

seedDatabase();

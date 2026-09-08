const Room = require('../models/Room');
const Message = require('../models/Message');
const User = require('../models/User');

const seedDatabase = async () => {
  try {
    const roomCount = await Room.countDocuments();
    if (roomCount > 0) {
      console.log('📦 Database already populated with chat rooms.');
      return;
    }

    console.log('🌱 Seeding initial chat rooms and messages for LMK MESS...');

    // Seed default bot user
    let botUser = await User.findOne({ username: 'LMK Bot 🤖' });
    if (!botUser) {
      botUser = await User.create({
        username: 'LMK Bot 🤖',
        password: 'password123',
        avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=LMKBot&backgroundColor=6366f1',
        bio: 'Official LMK MESS Assistant Bot ✨',
        status: 'online',
        isGuest: false
      });
    }

    const defaultRooms = [
      {
        name: 'General',
        slug: 'general',
        description: 'The main lobby for everyone on LMK MESS. Say hi and connect!',
        topic: 'Community & Hangout',
        icon: '💬',
        isPrivate: false,
        createdBy: 'LMK Bot 🤖',
        lastMessage: {
          text: 'Welcome to LMK MESS! Enjoy real-time chatting.',
          sender: 'LMK Bot 🤖',
          timestamp: new Date()
        }
      },
      {
        name: 'Tech Talk',
        slug: 'tech-talk',
        description: 'Discussions on full-stack development, AI, Node.js, React, and tech innovations.',
        topic: 'Engineering & Tech',
        icon: '💻',
        isPrivate: false,
        createdBy: 'LMK Bot 🤖',
        lastMessage: {
          text: 'What is your favorite modern tech stack in 2026?',
          sender: 'LMK Bot 🤖',
          timestamp: new Date()
        }
      },
      {
        name: 'Gaming Lounge',
        slug: 'gaming-lounge',
        description: 'Multiplayer squad search, game recommendations, and esports hype.',
        topic: 'Games & Esports',
        icon: '🎮',
        isPrivate: false,
        createdBy: 'LMK Bot 🤖',
        lastMessage: {
          text: 'Anyone up for a quick session tonight?',
          sender: 'LMK Bot 🤖',
          timestamp: new Date()
        }
      },
      {
        name: 'Music & Vibes',
        slug: 'music-vibes',
        description: 'Lo-fi beats, synthwave, rock, rap, and playlist exchanges.',
        topic: 'Tracks & Playlists',
        icon: '🎧',
        isPrivate: false,
        createdBy: 'LMK Bot 🤖',
        lastMessage: {
          text: 'Drop the song you are currently listening on repeat!',
          sender: 'LMK Bot 🤖',
          timestamp: new Date()
        }
      },
      {
        name: 'Memes & Random',
        slug: 'memes-random',
        description: 'Casual fun, hilarious memes, and random brainwaves.',
        topic: 'Laughs & Banter',
        icon: '🚀',
        isPrivate: false,
        createdBy: 'LMK Bot 🤖',
        lastMessage: {
          text: 'Share the top meme of your day right here.',
          sender: 'LMK Bot 🤖',
          timestamp: new Date()
        }
      }
    ];

    for (const roomData of defaultRooms) {
      const room = await Room.create(roomData);

      // Seed initial messages for each room
      await Message.create({
        room: room.slug,
        sender: {
          _id: botUser._id,
          username: botUser.username,
          avatar: botUser.avatar,
          isGuest: false
        },
        text: `👋 Welcome to #${room.name}! Feel free to message here, invite others, and test real-time typing indicators.`,
        reactions: [
          { emoji: '👋', users: ['LMK Bot 🤖'] },
          { emoji: '🔥', users: ['LMK Bot 🤖'] }
        ],
        status: 'delivered',
        createdAt: new Date(Date.now() - 3600000)
      });
    }

    console.log('✅ Default rooms and starter messages seeded successfully!');
  } catch (err) {
    console.error('Error seeding data:', err);
  }
};

module.exports = { seedDatabase };

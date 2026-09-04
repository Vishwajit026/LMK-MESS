const dotenv = require('dotenv');
const mongoose = require('mongoose');
const User = require('../models/User');
const Post = require('../models/Post');

dotenv.config();

const sampleUsers = [
  {
    name: 'Aarav Sharma',
    username: 'aarav_sharma',
    email: 'aarav@taskplanet.app',
    password: 'Password123!',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
    bio: 'Product Designer & TaskPlanet Community Star 🌟'
  },
  {
    name: 'Priya Patel',
    username: 'priya_tech',
    email: 'priya@taskplanet.app',
    password: 'Password123!',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
    bio: 'Fullstack Dev & Tech writer. Love building clean web apps 💻'
  },
  {
    name: 'Rohan Verma',
    username: 'rohan_v',
    email: 'rohan@taskplanet.app',
    password: 'Password123!',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=200&q=80',
    bio: 'Freelancer & Digital nomad. Exploring new horizons 🚀'
  },
  {
    name: 'Sneha Reddy',
    username: 'sneha_creates',
    email: 'sneha@taskplanet.app',
    password: 'Password123!',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80',
    bio: 'UI/UX Enthusiast. Designing modern user experiences 🎨'
  }
];

const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/taskplanet_social';
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(mongoUri);
    }

    console.log('🌱 Checking database seed state...');

    const userCount = await User.countDocuments();
    if (userCount > 0) {
      console.log(`ℹ️ Database already contains ${userCount} users. Skipping destructive seed.`);
      return;
    }

    console.log('🌱 Seeding initial TaskPlanet community users and posts...');

    // Create users
    const createdUsers = [];
    for (const u of sampleUsers) {
      const newUser = await User.create(u);
      createdUsers.push(newUser);
    }

    console.log(`✅ Created ${createdUsers.length} sample users`);

    // Sample posts
    const samplePosts = [
      {
        user: createdUsers[0]._id,
        username: createdUsers[0].username,
        name: createdUsers[0].name,
        userAvatar: createdUsers[0].avatar,
        text: 'Excited to announce the new TaskPlanet Social Page launch! 🚀 Connect with fellow creators, share your daily milestones, and collaborate in real-time. What are your thoughts on this sleek new design? #TaskPlanet #Community #Launch',
        image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
        tag: '#TaskPlanet',
        likes: [
          {
            userId: createdUsers[1]._id,
            username: createdUsers[1].username,
            name: createdUsers[1].name
          },
          {
            userId: createdUsers[2]._id,
            username: createdUsers[2].username,
            name: createdUsers[2].name
          },
          {
            userId: createdUsers[3]._id,
            username: createdUsers[3].username,
            name: createdUsers[3].name
          }
        ],
        comments: [
          {
            userId: createdUsers[1]._id,
            username: createdUsers[1].username,
            name: createdUsers[1].name,
            userAvatar: createdUsers[1].avatar,
            text: 'Looks absolutely stunning! Love the smooth transitions and modern colors. 🔥'
          },
          {
            userId: createdUsers[3]._id,
            username: createdUsers[3].username,
            name: createdUsers[3].name,
            userAvatar: createdUsers[3].avatar,
            text: 'Super clean UI! Very intuitive to create and like posts.'
          }
        ]
      },
      {
        user: createdUsers[1]._id,
        username: createdUsers[1].username,
        name: createdUsers[1].name,
        userAvatar: createdUsers[1].avatar,
        text: 'Morning coffee + clean React & Node.js architecture = the ultimate flow state ☕💻 Working on some exciting features today! #devlife #coding #reactjs',
        image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80',
        tag: '#coding',
        likes: [
          {
            userId: createdUsers[0]._id,
            username: createdUsers[0].username,
            name: createdUsers[0].name
          },
          {
            userId: createdUsers[3]._id,
            username: createdUsers[3].username,
            name: createdUsers[3].name
          }
        ],
        comments: [
          {
            userId: createdUsers[2]._id,
            username: createdUsers[2].username,
            name: createdUsers[2].name,
            userAvatar: createdUsers[2].avatar,
            text: 'That setup looks super clean! Best of luck with the build 🚀'
          }
        ]
      },
      {
        user: createdUsers[2]._id,
        username: createdUsers[2].username,
        name: createdUsers[2].name,
        userAvatar: createdUsers[2].avatar,
        text: 'Quick tip for developers building social feeds: Always optimize your pagination with indexed timestamps for lightning-fast queries! ⚡ #tips #webdev #performance',
        image: '',
        tag: '#tips',
        likes: [
          {
            userId: createdUsers[0]._id,
            username: createdUsers[0].username,
            name: createdUsers[0].name
          }
        ],
        comments: []
      },
      {
        user: createdUsers[3]._id,
        username: createdUsers[3].username,
        name: createdUsers[3].name,
        userAvatar: createdUsers[3].avatar,
        text: 'Beautiful sunset vibes while testing the mobile app layout 🌅 Stay focused and keep building amazing things!',
        image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
        tag: '#lifestyle',
        likes: [
          {
            userId: createdUsers[1]._id,
            username: createdUsers[1].username,
            name: createdUsers[1].name
          },
          {
            userId: createdUsers[2]._id,
            username: createdUsers[2].username,
            name: createdUsers[2].name
          }
        ],
        comments: []
      }
    ];

    for (const p of samplePosts) {
      await Post.create(p);
    }

    console.log(`✅ Created ${samplePosts.length} sample feed posts with likes & comments`);
    console.log('🎉 Seed complete! Default login credentials:');
    console.log('   Email: aarav@taskplanet.app | Password: Password123!');
  } catch (error) {
    console.error('Seed error:', error.message);
  }
};

module.exports = { seedDatabase };

if (require.main === module) {
  seedDatabase().then(() => {
    console.log('Done');
    process.exit(0);
  });
}

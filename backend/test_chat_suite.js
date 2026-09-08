const path = require('path');
const { io } = require(path.resolve(__dirname, '../frontend/node_modules/socket.io-client'));
const http = require('http');

const SERVER_URL = 'http://localhost:5000';

const runTests = async () => {
  console.log('🧪 Starting LMK MESS Full System Automated Test Suite...\n');

  // Test 1: REST API Health Check
  console.log('--- Test 1: Testing REST Health & Rooms Endpoints ---');
  const roomsRes = await fetch(`${SERVER_URL}/api/rooms`).then((r) => r.json());
  console.log(`✅ Fetched ${roomsRes.count} default seeded rooms.`);
  if (!roomsRes.success || roomsRes.count < 5) {
    throw new Error('Default seeded rooms check failed');
  }

  // Test 2: REST Auth Guest Join
  console.log('\n--- Test 2: Testing Guest Auth API ---');
  const guestRes = await fetch(`${SERVER_URL}/api/auth/guest`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'AliceTest', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Alice' })
  }).then((r) => r.json());
  console.log('✅ Guest Auth Response:', guestRes.success, 'Username:', guestRes.data?.username);

  // Test 3: Connect 2 Real-Time Sockets (Alice & Bob)
  console.log('\n--- Test 3: Connecting Multi-User Real-Time Sockets ---');
  const socketAlice = io(SERVER_URL, { transports: ['websocket'] });
  const socketBob = io(SERVER_URL, { transports: ['websocket'] });

  await new Promise((resolve) => {
    let connectedCount = 0;
    const checkAll = () => {
      connectedCount++;
      if (connectedCount === 2) resolve();
    };
    socketAlice.on('connect', () => {
      console.log('✅ Alice Socket Connected:', socketAlice.id);
      socketAlice.emit('userConnected', {
        _id: 'user_alice',
        username: 'Alice',
        avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Alice',
        currentRoom: 'general'
      });
      checkAll();
    });
    socketBob.on('connect', () => {
      console.log('✅ Bob Socket Connected:', socketBob.id);
      socketBob.emit('userConnected', {
        _id: 'user_bob',
        username: 'Bob',
        avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Bob',
        currentRoom: 'general'
      });
      checkAll();
    });
  });

  // Test 4: Real-time Message Broadcast (Alice sends in #general, Bob receives)
  console.log('\n--- Test 4: Testing Real-Time Message Broadcast ---');
  socketAlice.emit('joinRoom', { room: 'general', user: { username: 'Alice' } });
  socketBob.emit('joinRoom', { room: 'general', user: { username: 'Bob' } });

  await new Promise((resolve, reject) => {
    const testMsgText = 'Hello Bob! This is real-time from Alice ' + Date.now();

    socketBob.on('chatMessage', (receivedMsg) => {
      if (receivedMsg.text === testMsgText) {
        console.log('✅ Bob received Alice’s message in real-time:', receivedMsg.text);
        console.log('   Message ID:', receivedMsg._id, 'Sender:', receivedMsg.sender.username);
        resolve();
      }
    });

    setTimeout(() => {
      socketAlice.emit('chatMessage', {
        room: 'general',
        text: testMsgText,
        sender: { _id: 'user_alice', username: 'Alice', isGuest: true }
      });
    }, 500);

    setTimeout(() => {
      reject(new Error('Timeout waiting for real-time message receipt'));
    }, 5000);
  });

  // Test 5: Typing Indicator Event
  console.log('\n--- Test 5: Testing Real-Time Typing Indicator ---');
  await new Promise((resolve, reject) => {
    socketBob.on('userTyping', ({ room, username, isTyping }) => {
      if (username === 'Alice' && isTyping === true) {
        console.log(`✅ Bob received typing notification: "${username} is typing in #${room}"`);
        resolve();
      }
    });

    socketAlice.emit('typing', { room: 'general', username: 'Alice', isTyping: true });

    setTimeout(() => {
      reject(new Error('Timeout waiting for typing indicator'));
    }, 4000);
  });

  // Test 6: Message Reaction
  console.log('\n--- Test 6: Testing Real-Time Emoji Reaction ---');
  const history = await fetch(`${SERVER_URL}/api/messages/general`).then((r) => r.json());
  const lastMsg = history.data[history.data.length - 1];

  await new Promise((resolve, reject) => {
    socketAlice.on('reactionUpdated', ({ messageId, reactions }) => {
      if (messageId === lastMsg._id) {
        console.log('✅ Reaction updated in real-time! Emoji:', reactions[0]?.emoji, 'Users:', reactions[0]?.users);
        resolve();
      }
    });

    socketBob.emit('messageReaction', {
      messageId: lastMsg._id,
      emoji: '🔥',
      username: 'Bob',
      room: 'general'
    });

    setTimeout(() => {
      reject(new Error('Timeout waiting for reaction update'));
    }, 4000);
  });

  // Test 7: Verify History in MongoDB
  console.log('\n--- Test 7: Verifying Persistent Message History in MongoDB ---');
  const verifyHistory = await fetch(`${SERVER_URL}/api/messages/general`).then((r) => r.json());
  console.log(`✅ Found ${verifyHistory.count} messages in #general history.`);
  const foundSaved = verifyHistory.data.some((m) => m.sender.username === 'Alice');
  if (!foundSaved) {
    throw new Error('Alice message not found in persistent DB history');
  }
  console.log('✅ Persistent message history verified in MongoDB!');

  // Clean up sockets
  socketAlice.disconnect();
  socketBob.disconnect();

  console.log('\n🎉 ALL 7 SYSTEM TESTS PASSED PERFECTLY! 🚀');
  process.exit(0);
};

runTests().catch((err) => {
  console.error('❌ Test Suite Failed:', err);
  process.exit(1);
});

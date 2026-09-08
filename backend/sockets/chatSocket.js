const Message = require('../models/Message');
const Room = require('../models/Room');
const User = require('../models/User');

// Active socket sessions map: socketId -> userData
const activeSockets = new Map();

const initializeChatSockets = (io) => {
  // Helper to get online users for a specific room or globally
  const getOnlineUsersForRoom = (roomSlug) => {
    const users = [];
    const seenUsernames = new Set();

    for (const [socketId, user] of activeSockets.entries()) {
      if (user.username && !seenUsernames.has(user.username)) {
        if (!roomSlug || user.currentRoom === roomSlug) {
          users.push(user);
          seenUsernames.add(user.username);
        }
      }
    }
    return users;
  };

  const getAllOnlineUsers = () => {
    const users = [];
    const seenUsernames = new Set();
    for (const [_, user] of activeSockets.entries()) {
      if (user.username && !seenUsernames.has(user.username)) {
        users.push(user);
        seenUsernames.add(user.username);
      }
    }
    return users;
  };

  io.on('connection', (socket) => {
    console.log(`🔌 New Socket Connected: ${socket.id}`);

    // Register user presence
    socket.on('userConnected', (userData) => {
      if (!userData || !userData.username) return;

      activeSockets.set(socket.id, {
        socketId: socket.id,
        _id: userData._id || socket.id,
        username: userData.username,
        avatar: userData.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(userData.username)}`,
        status: userData.status || 'online',
        isGuest: Boolean(userData.isGuest),
        currentRoom: userData.currentRoom || 'general'
      });

      // Broadcast updated online presence to everyone
      io.emit('onlineUsersUpdate', {
        globalUsers: getAllOnlineUsers(),
        roomUsers: getOnlineUsersForRoom(userData.currentRoom || 'general')
      });
    });

    // Join a specific chat room
    socket.on('joinRoom', async ({ room, user }) => {
      try {
        if (!room) return;
        const roomSlug = room.toLowerCase();

        // Leave previous room if any
        const prevUserData = activeSockets.get(socket.id);
        if (prevUserData && prevUserData.currentRoom && prevUserData.currentRoom !== roomSlug) {
          socket.leave(prevUserData.currentRoom);
          socket.to(prevUserData.currentRoom).emit('userLeft', {
            username: prevUserData.username,
            room: prevUserData.currentRoom,
            timestamp: new Date()
          });
          io.to(prevUserData.currentRoom).emit('roomOnlineUsers', getOnlineUsersForRoom(prevUserData.currentRoom));
        }

        socket.join(roomSlug);

        // Update stored room for this socket
        if (user && user.username) {
          activeSockets.set(socket.id, {
            socketId: socket.id,
            _id: user._id || socket.id,
            username: user.username,
            avatar: user.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(user.username)}`,
            status: user.status || 'online',
            isGuest: Boolean(user.isGuest),
            currentRoom: roomSlug
          });
        }

        console.log(`👤 ${user?.username || 'User'} joined room: #${roomSlug}`);

        // Broadcast user joined notice to the room
        if (user && user.username) {
          socket.to(roomSlug).emit('userJoined', {
            username: user.username,
            avatar: user.avatar,
            room: roomSlug,
            timestamp: new Date()
          });
        }

        // Send updated online users list to this room and global
        io.to(roomSlug).emit('roomOnlineUsers', getOnlineUsersForRoom(roomSlug));
        io.emit('onlineUsersUpdate', {
          globalUsers: getAllOnlineUsers(),
          roomUsers: getOnlineUsersForRoom(roomSlug)
        });
      } catch (err) {
        console.error('joinRoom error:', err);
      }
    });

    // Leave a chat room
    socket.on('leaveRoom', ({ room, username }) => {
      if (!room) return;
      const roomSlug = room.toLowerCase();
      socket.leave(roomSlug);

      if (username) {
        socket.to(roomSlug).emit('userLeft', {
          username,
          room: roomSlug,
          timestamp: new Date()
        });
      }

      const userData = activeSockets.get(socket.id);
      if (userData) {
        userData.currentRoom = null;
      }

      io.to(roomSlug).emit('roomOnlineUsers', getOnlineUsersForRoom(roomSlug));
    });

    // Send a real-time message
    socket.on('chatMessage', async (messageData, callback) => {
      try {
        const { room, text, sender, mediaUrl, mediaType, replyTo } = messageData;

        if (!room) {
          if (callback) callback({ error: 'Room is required' });
          return;
        }

        if ((!text || text.trim().length === 0) && !mediaUrl) {
          if (callback) callback({ error: 'Message cannot be empty' });
          return;
        }

        const roomSlug = room.toLowerCase();

        // 1. Create and save message in MongoDB
        const newMessage = await Message.create({
          room: roomSlug,
          sender: {
            _id: sender?._id || socket.id,
            username: sender?.username || 'Anonymous',
            avatar: sender?.avatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=LMK',
            isGuest: Boolean(sender?.isGuest)
          },
          text: text ? text.trim() : '',
          mediaUrl: mediaUrl || null,
          mediaType: mediaType || 'none',
          replyTo: replyTo || null,
          status: 'delivered',
          reactions: []
        });

        // 2. Update Room last activity
        await Room.findOneAndUpdate(
          { slug: roomSlug },
          {
            lastMessage: {
              text: text ? (text.length > 50 ? text.substring(0, 50) + '...' : text) : '📷 Media attachment',
              sender: sender?.username || 'User',
              timestamp: new Date()
            },
            updatedAt: new Date()
          }
        );

        // 3. Broadcast message to all connected clients in this room (including sender)
        io.to(roomSlug).emit('chatMessage', newMessage);

        // 4. Also emit updated room activity for sidebar live preview
        io.emit('roomActivity', {
          slug: roomSlug,
          lastMessage: {
            text: text ? text.substring(0, 45) : '📷 Attachment',
            sender: sender?.username,
            timestamp: new Date()
          }
        });

        if (callback) callback({ success: true, data: newMessage });
      } catch (err) {
        console.error('chatMessage socket error:', err);
        if (callback) callback({ error: 'Failed to send message' });
      }
    });

    // Typing status indicator
    socket.on('typing', ({ room, username, isTyping }) => {
      if (!room || !username) return;
      const roomSlug = room.toLowerCase();
      socket.to(roomSlug).emit('userTyping', {
        room: roomSlug,
        username,
        isTyping: Boolean(isTyping)
      });
    });

    // Message emoji reaction
    socket.on('messageReaction', async ({ messageId, emoji, username, room }) => {
      try {
        if (!messageId || !emoji || !username) return;

        const message = await Message.findById(messageId);
        if (!message) return;

        let reactionEntry = message.reactions.find((r) => r.emoji === emoji);

        if (reactionEntry) {
          const userIdx = reactionEntry.users.indexOf(username);
          if (userIdx > -1) {
            // Remove user reaction (toggle off)
            reactionEntry.users.splice(userIdx, 1);
            if (reactionEntry.users.length === 0) {
              message.reactions = message.reactions.filter((r) => r.emoji !== emoji);
            }
          } else {
            // Add user reaction
            reactionEntry.users.push(username);
          }
        } else {
          // New reaction emoji
          message.reactions.push({
            emoji,
            users: [username]
          });
        }

        await message.save();

        const roomSlug = (room || message.room).toLowerCase();
        io.to(roomSlug).emit('reactionUpdated', {
          messageId: message._id,
          reactions: message.reactions
        });
      } catch (err) {
        console.error('messageReaction socket error:', err);
      }
    });

    // Direct Message (1-to-1)
    socket.on('directMessage', async (dmData, callback) => {
      try {
        const { recipientUsername, text, sender } = dmData;
        if (!recipientUsername || !text || !sender) return;

        // Create deterministic direct room slug: dm-user1-user2
        const sortedUsers = [sender.username.toLowerCase(), recipientUsername.toLowerCase()].sort();
        const dmSlug = `dm-${sortedUsers[0]}-${sortedUsers[1]}`;

        // Ensure direct room exists
        let directRoom = await Room.findOne({ slug: dmSlug });
        if (!directRoom) {
          directRoom = await Room.create({
            name: `@${recipientUsername}`,
            slug: dmSlug,
            description: `Direct chat between ${sender.username} and ${recipientUsername}`,
            isDirect: true,
            participants: [sender.username, recipientUsername],
            icon: '🔒'
          });
        }

        const newMsg = await Message.create({
          room: dmSlug,
          sender: {
            _id: sender._id,
            username: sender.username,
            avatar: sender.avatar,
            isGuest: Boolean(sender.isGuest)
          },
          text: text.trim(),
          status: 'delivered'
        });

        // Broadcast to both participants
        io.to(dmSlug).emit('chatMessage', newMsg);
        io.emit('dmNotification', {
          recipient: recipientUsername,
          sender: sender.username,
          message: text,
          room: dmSlug
        });

        if (callback) callback({ success: true, data: newMsg, room: directRoom });
      } catch (err) {
        console.error('directMessage error:', err);
        if (callback) callback({ error: 'Failed to send DM' });
      }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      const userData = activeSockets.get(socket.id);
      if (userData) {
        console.log(`❌ User Disconnected: ${userData.username} (${socket.id})`);
        const roomSlug = userData.currentRoom;

        if (roomSlug) {
          socket.to(roomSlug).emit('userLeft', {
            username: userData.username,
            room: roomSlug,
            timestamp: new Date()
          });
          io.to(roomSlug).emit('userTyping', {
            room: roomSlug,
            username: userData.username,
            isTyping: false
          });
        }

        activeSockets.delete(socket.id);

        if (roomSlug) {
          io.to(roomSlug).emit('roomOnlineUsers', getOnlineUsersForRoom(roomSlug));
        }
        io.emit('onlineUsersUpdate', {
          globalUsers: getAllOnlineUsers(),
          roomUsers: roomSlug ? getOnlineUsersForRoom(roomSlug) : []
        });
      }
    });
  });
};

module.exports = { initializeChatSockets };

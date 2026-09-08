import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { getSocket } from '../services/socket';
import { chatApi } from '../services/api';
import { useAuth } from './AuthContext';
import { playSendSound, playReceiveSound, playJoinSound } from '../utils/audio';

const ChatContext = createContext(null);

export const ChatProvider = ({ children }) => {
  const { user } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [activeRoom, setActiveRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState({ globalUsers: [], roomUsers: [] });
  const [typingUsers, setTypingUsers] = useState([]);
  const [unreadCounts, setUnreadCounts] = useState({});
  const [theme, setTheme] = useState(() => localStorage.getItem('lmk_theme') || 'dark');
  const [soundEnabled, setSoundEnabled] = useState(() => localStorage.getItem('lmk_sound_enabled') !== 'false');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isOnlineDrawerOpen, setIsOnlineDrawerOpen] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);

  const activeRoomRef = useRef(activeRoom);
  activeRoomRef.current = activeRoom;

  // Apply theme to root
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('lmk_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const toggleSound = () => {
    setSoundEnabled((prev) => {
      const next = !prev;
      localStorage.setItem('lmk_sound_enabled', String(next));
      return next;
    });
  };

  // Fetch all rooms from API
  const fetchRooms = useCallback(async () => {
    try {
      setLoadingRooms(true);
      const res = await chatApi.getRooms();
      if (res.data.success) {
        setRooms(res.data.data);
        // Set default room if none active
        if (!activeRoomRef.current && res.data.data.length > 0) {
          const general = res.data.data.find((r) => r.slug === 'general') || res.data.data[0];
          setActiveRoom(general);
        }
      }
    } catch (err) {
      console.error('Failed to load rooms:', err);
    } finally {
      setLoadingRooms(false);
    }
  }, []);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  // Fetch messages when activeRoom changes
  const loadMessageHistory = useCallback(async (roomSlug) => {
    if (!roomSlug) return;
    try {
      setLoadingMessages(true);
      const res = await chatApi.getMessageHistory(roomSlug);
      if (res.data.success) {
        setMessages(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load messages:', err);
    } finally {
      setLoadingMessages(false);
    }
  }, []);

  // Join room via socket
  const switchRoom = useCallback(
    (roomSlug) => {
      if (!roomSlug) return;
      const target = rooms.find((r) => r.slug === roomSlug) || {
        name: roomSlug,
        slug: roomSlug,
        icon: '💬',
        topic: 'Chat'
      };

      setActiveRoom(target);
      setReplyingTo(null);
      setTypingUsers([]);

      // Clear unread for this room
      setUnreadCounts((prev) => ({ ...prev, [roomSlug]: 0 }));

      // Load history
      loadMessageHistory(roomSlug);

      // Emit joinRoom
      const socket = getSocket();
      if (socket.connected) {
        socket.emit('joinRoom', { room: roomSlug, user });
      }

      playJoinSound();
      setIsSidebarOpen(false);
    },
    [rooms, user, loadMessageHistory]
  );

  // Initial load of active room messages
  useEffect(() => {
    if (activeRoom) {
      loadMessageHistory(activeRoom.slug);
      const socket = getSocket();
      if (socket.connected) {
        socket.emit('joinRoom', { room: activeRoom.slug, user });
      }
    }
  }, [activeRoom?.slug]);

  // Socket listener bindings
  useEffect(() => {
    const socket = getSocket();

    const handleChatMessage = (newMsg) => {
      const current = activeRoomRef.current;
      if (current && newMsg.room === current.slug) {
        setMessages((prev) => {
          // Avoid duplicate messages
          if (prev.some((m) => m._id === newMsg._id)) return prev;
          return [...prev, newMsg];
        });

        // Sound alert
        if (newMsg.sender?.username !== user?.username) {
          playReceiveSound();
        }
      } else {
        // Increment unread count for other rooms
        setUnreadCounts((prev) => ({
          ...prev,
          [newMsg.room]: (prev[newMsg.room] || 0) + 1
        }));
        playReceiveSound();
      }

      // Update rooms sidebar preview
      setRooms((prev) =>
        prev.map((r) =>
          r.slug === newMsg.room
            ? {
                ...r,
                lastMessage: {
                  text: newMsg.text || '📷 Attachment',
                  sender: newMsg.sender?.username,
                  timestamp: newMsg.createdAt
                }
              }
            : r
        )
      );
    };

    const handleUserTyping = ({ room, username, isTyping }) => {
      const current = activeRoomRef.current;
      if (current && room === current.slug && username !== user?.username) {
        setTypingUsers((prev) => {
          if (isTyping) {
            return prev.includes(username) ? prev : [...prev, username];
          } else {
            return prev.filter((u) => u !== username);
          }
        });
      }
    };

    const handleReactionUpdated = ({ messageId, reactions }) => {
      setMessages((prev) =>
        prev.map((m) => (m._id === messageId ? { ...m, reactions } : m))
      );
    };

    const handleOnlineUsersUpdate = ({ globalUsers, roomUsers }) => {
      setOnlineUsers({
        globalUsers: globalUsers || [],
        roomUsers: roomUsers || []
      });
    };

    const handleRoomOnlineUsers = (roomUsers) => {
      setOnlineUsers((prev) => ({
        ...prev,
        roomUsers: roomUsers || []
      }));
    };

    const handleUserJoined = (data) => {
      // Could display subtle system notification in chat
    };

    const handleUserLeft = (data) => {
      // Handle user left
    };

    socket.on('chatMessage', handleChatMessage);
    socket.on('userTyping', handleUserTyping);
    socket.on('reactionUpdated', handleReactionUpdated);
    socket.on('onlineUsersUpdate', handleOnlineUsersUpdate);
    socket.on('roomOnlineUsers', handleRoomOnlineUsers);
    socket.on('userJoined', handleUserJoined);
    socket.on('userLeft', handleUserLeft);

    return () => {
      socket.off('chatMessage', handleChatMessage);
      socket.off('userTyping', handleUserTyping);
      socket.off('reactionUpdated', handleReactionUpdated);
      socket.off('onlineUsersUpdate', handleOnlineUsersUpdate);
      socket.off('roomOnlineUsers', handleRoomOnlineUsers);
      socket.off('userJoined', handleUserJoined);
      socket.off('userLeft', handleUserLeft);
    };
  }, [user?.username]);

  // Action: Send Message
  const sendMessage = async ({ text, mediaUrl, mediaType = 'none' }) => {
    if (!activeRoom) return;
    if ((!text || !text.trim()) && !mediaUrl) return;

    const socket = getSocket();
    const payload = {
      room: activeRoom.slug,
      text: text?.trim(),
      mediaUrl,
      mediaType,
      replyTo: replyingTo
        ? {
            messageId: replyingTo._id,
            senderUsername: replyingTo.sender?.username,
            text: replyingTo.text ? replyingTo.text.substring(0, 100) : 'Attachment'
          }
        : null,
      sender: user
        ? {
            _id: user._id,
            username: user.username,
            avatar: user.avatar,
            isGuest: Boolean(user.isGuest)
          }
        : {
            username: 'Guest',
            avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Guest',
            isGuest: true
          }
    };

    playSendSound();
    setReplyingTo(null);

    return new Promise((resolve) => {
      socket.emit('chatMessage', payload, (response) => {
        resolve(response);
      });
    });
  };

  // Action: Emit typing status
  const sendTyping = (isTyping) => {
    if (!activeRoom || !user) return;
    const socket = getSocket();
    socket.emit('typing', {
      room: activeRoom.slug,
      username: user.username,
      isTyping
    });
  };

  // Action: React to message
  const sendReaction = (messageId, emoji) => {
    if (!user || !activeRoom) return;
    const socket = getSocket();
    socket.emit('messageReaction', {
      messageId,
      emoji,
      username: user.username,
      room: activeRoom.slug
    });
  };

  // Action: Start Direct Message
  const startDirectMessage = (targetUsername) => {
    if (!user || !targetUsername || user.username === targetUsername) return;
    const sorted = [user.username.toLowerCase(), targetUsername.toLowerCase()].sort();
    const dmSlug = `dm-${sorted[0]}-${sorted[1]}`;

    // Check if dm room exists in rooms list or create temporary client representation
    let dmRoom = rooms.find((r) => r.slug === dmSlug);
    if (!dmRoom) {
      dmRoom = {
        name: `@${targetUsername}`,
        slug: dmSlug,
        description: `Direct chat with ${targetUsername}`,
        topic: 'Private Message',
        icon: '🔒',
        isDirect: true,
        participants: [user.username, targetUsername]
      };
      setRooms((prev) => [dmRoom, ...prev]);
    }

    switchRoom(dmSlug);
    setIsOnlineDrawerOpen(false);
  };

  // Action: Create New Room
  const createRoom = async (roomData) => {
    try {
      const res = await chatApi.createRoom({
        ...roomData,
        createdBy: user?.username || 'User'
      });
      if (res.data.success) {
        const newRoom = res.data.data;
        setRooms((prev) => [newRoom, ...prev]);
        switchRoom(newRoom.slug);
        return { success: true, room: newRoom };
      }
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.message || 'Failed to create room'
      };
    }
  };

  return (
    <ChatContext.Provider
      value={{
        rooms,
        activeRoom,
        messages,
        loadingRooms,
        loadingMessages,
        onlineUsers,
        typingUsers,
        unreadCounts,
        theme,
        toggleTheme,
        soundEnabled,
        toggleSound,
        isSidebarOpen,
        setIsSidebarOpen,
        isOnlineDrawerOpen,
        setIsOnlineDrawerOpen,
        replyingTo,
        setReplyingTo,
        switchRoom,
        sendMessage,
        sendTyping,
        sendReaction,
        startDirectMessage,
        createRoom,
        fetchRooms
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);

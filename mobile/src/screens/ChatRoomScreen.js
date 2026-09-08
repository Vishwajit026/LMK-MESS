import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { chatApi } from '../services/api';
import { getSocket } from '../services/socket';
import { MessageBubble } from '../components/MessageBubble';

export const ChatRoomScreen = ({ room, user, onBack, onOpenOnlineUsers }) => {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [typingUsers, setTypingUsers] = useState([]);
  const flatListRef = useRef(null);
  const typingTimerRef = useRef(null);

  // Load message history & listen to sockets
  useEffect(() => {
    const socket = getSocket();

    // 1. Join room
    socket.emit('joinRoom', { room: room.slug, user });

    // 2. Load history
    chatApi.getMessageHistory(room.slug).then((res) => {
      if (res.data.success) {
        setMessages(res.data.data);
      }
    });

    // 3. Socket listeners
    const handleChatMessage = (msg) => {
      if (msg.room === room.slug) {
        setMessages((prev) => [...prev, msg]);
      }
    };

    const handleTyping = ({ room: r, username, isTyping }) => {
      if (r === room.slug && username !== user?.username) {
        setTypingUsers((prev) => {
          if (isTyping) return prev.includes(username) ? prev : [...prev, username];
          return prev.filter((u) => u !== username);
        });
      }
    };

    const handleReaction = ({ messageId, reactions }) => {
      setMessages((prev) =>
        prev.map((m) => (m._id === messageId ? { ...m, reactions } : m))
      );
    };

    socket.on('chatMessage', handleChatMessage);
    socket.on('userTyping', handleTyping);
    socket.on('reactionUpdated', handleReaction);

    return () => {
      socket.off('chatMessage', handleChatMessage);
      socket.off('userTyping', handleTyping);
      socket.off('reactionUpdated', handleReaction);
    };
  }, [room.slug]);

  const handleTextChange = (val) => {
    setText(val);
    const socket = getSocket();
    socket.emit('typing', { room: room.slug, username: user.username, isTyping: true });

    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {
      socket.emit('typing', { room: room.slug, username: user.username, isTyping: false });
    }, 2000);
  };

  const handleSend = () => {
    if (!text.trim()) return;

    const socket = getSocket();
    socket.emit('chatMessage', {
      room: room.slug,
      text: text.trim(),
      sender: user
    });

    setText('');
    socket.emit('typing', { room: room.slug, username: user.username, isTyping: false });
  };

  const handleReact = (messageId, emoji) => {
    const socket = getSocket();
    socket.emit('messageReaction', {
      messageId,
      emoji,
      username: user.username,
      room: room.slug
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={onBack}>
            <Text style={styles.backText}>‹</Text>
          </TouchableOpacity>

          <View style={styles.titleColumn}>
            <Text style={styles.headerTitle}>#{room.name}</Text>
            <Text style={styles.headerSubtitle} numberOfLines={1}>
              {room.topic || room.description}
            </Text>
          </View>

          <TouchableOpacity style={styles.onlineBtn} onPress={onOpenOnlineUsers}>
            <Text style={styles.onlineBtnText}>👥</Text>
          </TouchableOpacity>
        </View>

        {/* Message Feed */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item._id || String(Math.random())}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          renderItem={({ item }) => (
            <MessageBubble
              message={item}
              isMine={item.sender?.username === user?.username}
              onReact={(emoji) => handleReact(item._id, emoji)}
            />
          )}
          contentContainerStyle={styles.messageListContent}
        />

        {/* Typing Indicator */}
        {typingUsers.length > 0 && (
          <View style={styles.typingContainer}>
            <Text style={styles.typingText}>
              {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
            </Text>
          </View>
        )}

        {/* Message Input Bar */}
        <View style={styles.inputBar}>
          <TextInput
            style={styles.textInput}
            placeholder={`Message #${room.name}...`}
            placeholderTextColor="#6b7280"
            value={text}
            onChangeText={handleTextChange}
            multiline
          />

          <TouchableOpacity
            style={[styles.sendBtn, Boolean(text.trim()) && styles.sendBtnActive]}
            onPress={handleSend}
            disabled={!text.trim()}
          >
            <Text style={styles.sendIcon}>➤</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b0f19'
  },
  keyboardView: {
    flex: 1
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
    backgroundColor: '#111827'
  },
  backBtn: {
    paddingRight: 12
  },
  backText: {
    fontSize: 32,
    color: '#6366f1',
    lineHeight: 32
  },
  titleColumn: {
    flex: 1
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff'
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#9ca3af'
  },
  onlineBtn: {
    padding: 8
  },
  onlineBtnText: {
    fontSize: 20
  },
  messageListContent: {
    paddingVertical: 12
  },
  typingContainer: {
    paddingHorizontal: 16,
    paddingVertical: 4
  },
  typingText: {
    fontSize: 12,
    color: '#6366f1',
    fontStyle: 'italic'
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#111827',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
    gap: 8
  },
  textInput: {
    flex: 1,
    backgroundColor: '#1f2937',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: '#ffffff',
    fontSize: 14,
    maxHeight: 100
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#374151',
    alignItems: 'center',
    justifyContent: 'center'
  },
  sendBtnActive: {
    backgroundColor: '#6366f1'
  },
  sendIcon: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold'
  }
});

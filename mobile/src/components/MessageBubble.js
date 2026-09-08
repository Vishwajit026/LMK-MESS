import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';

export const MessageBubble = ({ message, isMine, onReact }) => {
  const isBot = message.sender?.username?.includes('Bot');
  const formattedTime = message.createdAt
    ? new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '';

  return (
    <View style={[styles.wrapper, isMine ? styles.wrapperMine : styles.wrapperOther]}>
      {!isMine && (
        <Image
          source={{
            uri:
              message.sender?.avatar ||
              `https://api.dicebear.com/7.x/bottts/png?seed=${encodeURIComponent(message.sender?.username || 'user')}`
          }}
          style={styles.avatar}
        />
      )}

      <View style={styles.contentColumn}>
        {!isMine && (
          <Text style={[styles.senderName, isBot && styles.botName]}>
            {message.sender?.username} {isBot && '🤖'}
          </Text>
        )}

        <View style={[styles.bubble, isMine ? styles.bubbleMine : styles.bubbleOther]}>
          {message.mediaUrl && (
            <Image source={{ uri: message.mediaUrl }} style={styles.mediaImage} resizeMode="cover" />
          )}

          {Boolean(message.text) && (
            <Text style={[styles.messageText, isMine ? styles.textMine : styles.textOther]}>
              {message.text}
            </Text>
          )}

          <View style={styles.metaRow}>
            <Text style={[styles.timeText, isMine ? styles.timeMine : styles.timeOther]}>
              {formattedTime}
            </Text>
            {isMine && <Text style={styles.checkmarks}>✓✓</Text>}
          </View>
        </View>

        {/* Reactions row */}
        {message.reactions && message.reactions.length > 0 && (
          <View style={styles.reactionsRow}>
            {message.reactions.map((r, i) => (
              <TouchableOpacity key={i} style={styles.reactionPill} onPress={() => onReact && onReact(r.emoji)}>
                <Text style={styles.reactionEmoji}>{r.emoji}</Text>
                <Text style={styles.reactionCount}>{r.users?.length || 1}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    marginVertical: 4,
    paddingHorizontal: 12,
    maxWidth: '85%'
  },
  wrapperMine: {
    alignSelf: 'flex-end',
    flexDirection: 'row-reverse'
  },
  wrapperOther: {
    alignSelf: 'flex-start'
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
    marginTop: 4
  },
  contentColumn: {
    flexDirection: 'column'
  },
  senderName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#9ca3af',
    marginBottom: 2,
    marginLeft: 4
  },
  botName: {
    color: '#8b5cf6'
  },
  bubble: {
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4
  },
  bubbleMine: {
    backgroundColor: '#6366f1',
    borderBottomRightRadius: 4
  },
  bubbleOther: {
    backgroundColor: '#1f2937',
    borderBottomLeftRadius: 4
  },
  mediaImage: {
    width: 220,
    height: 160,
    borderRadius: 10,
    marginBottom: 6
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20
  },
  textMine: {
    color: '#ffffff'
  },
  textOther: {
    color: '#f3f4f6'
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 4,
    gap: 4
  },
  timeText: {
    fontSize: 10
  },
  timeMine: {
    color: '#c7d2fe'
  },
  timeOther: {
    color: '#9ca3af'
  },
  checkmarks: {
    fontSize: 10,
    color: '#93c5fd',
    fontWeight: 'bold'
  },
  reactionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 2,
    marginLeft: 4
  },
  reactionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#374151',
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
    gap: 2
  },
  reactionEmoji: {
    fontSize: 12
  },
  reactionCount: {
    fontSize: 10,
    color: '#e5e7eb',
    fontWeight: '600'
  }
});

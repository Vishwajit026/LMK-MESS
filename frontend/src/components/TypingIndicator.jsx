import React from 'react';
import { useChat } from '../context/ChatContext';

export const TypingIndicator = () => {
  const { typingUsers } = useChat();

  if (!typingUsers || typingUsers.length === 0) return null;

  let typingText = '';
  if (typingUsers.length === 1) {
    typingText = `${typingUsers[0]} is typing`;
  } else if (typingUsers.length === 2) {
    typingText = `${typingUsers[0]} and ${typingUsers[1]} are typing`;
  } else {
    typingText = `${typingUsers[0]} and ${typingUsers.length - 1} others are typing`;
  }

  return (
    <div className="typing-indicator-bubble">
      <div className="typing-dots">
        <span className="dot dot-1"></span>
        <span className="dot dot-2"></span>
        <span className="dot dot-3"></span>
      </div>
      <span className="typing-text">{typingText}...</span>
    </div>
  );
};

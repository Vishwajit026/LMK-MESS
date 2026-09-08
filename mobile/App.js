import React, { useState } from 'react';
import { StatusBar } from 'react-native';
import { AuthScreen } from './src/screens/AuthScreen';
import { ChatListScreen } from './src/screens/ChatListScreen';
import { ChatRoomScreen } from './src/screens/ChatRoomScreen';
import { OnlineUsersModal } from './src/components/OnlineUsersModal';
import { CreateRoomModal } from './src/components/CreateRoomModal';
import { disconnectSocket } from './src/services/socket';

export default function App() {
  const [user, setUser] = useState(null);
  const [activeRoom, setActiveRoom] = useState(null);
  const [showOnlineModal, setShowOnlineModal] = useState(false);
  const [showCreateRoomModal, setShowCreateRoomModal] = useState(false);

  const handleLogout = () => {
    disconnectSocket();
    setUser(null);
    setActiveRoom(null);
  };

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#0b0f19" />

      {!user ? (
        <AuthScreen onLoginSuccess={(userData) => setUser(userData)} />
      ) : activeRoom ? (
        <ChatRoomScreen
          room={activeRoom}
          user={user}
          onBack={() => setActiveRoom(null)}
          onOpenOnlineUsers={() => setShowOnlineModal(true)}
        />
      ) : (
        <ChatListScreen
          user={user}
          onSelectRoom={(room) => setActiveRoom(room)}
          onOpenCreateRoom={() => setShowCreateRoomModal(true)}
          onLogout={handleLogout}
        />
      )}

      {/* Online Users Modal */}
      {activeRoom && (
        <OnlineUsersModal
          visible={showOnlineModal}
          onClose={() => setShowOnlineModal(false)}
          currentRoom={activeRoom.slug}
        />
      )}

      {/* Create Room Modal */}
      <CreateRoomModal
        visible={showCreateRoomModal}
        onClose={() => setShowCreateRoomModal(false)}
        user={user}
        onRoomCreated={(newRoom) => {
          setActiveRoom(newRoom);
        }}
      />
    </>
  );
}

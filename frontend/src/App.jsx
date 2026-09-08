import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ChatProvider } from './context/ChatContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { ChatRoom } from './components/ChatRoom';
import { OnlineUsersList } from './components/OnlineUsersList';
import { CreateRoomModal } from './components/CreateRoomModal';
import { AuthModal } from './components/AuthModal';
import { JoinWithCodeModal } from './components/JoinWithCodeModal';

const ChatAppContent = () => {
  const { user } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isCreateRoomOpen, setIsCreateRoomOpen] = useState(false);
  const [isJoinCodeOpen, setIsJoinCodeOpen] = useState(false);

  return (
    <div className="app-container">
      {/* Top Navigation */}
      <Navbar
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onOpenCreateRoom={() => setIsCreateRoomOpen(true)}
      />

      {/* Main Workspace Layout */}
      <div className="main-workspace">
        {/* Left Sidebar (Channels & DMs) */}
        <Sidebar
          onOpenCreateRoom={() => setIsCreateRoomOpen(true)}
          onOpenAuth={() => setIsAuthModalOpen(true)}
          onOpenJoinCode={() => setIsJoinCodeOpen(true)}
        />

        {/* Center Chat Area */}
        <main className="chat-viewport-wrapper">
          <ChatRoom onOpenAuth={() => setIsAuthModalOpen(true)} />
        </main>

        {/* Right Online Members Sidebar */}
        <OnlineUsersList />
      </div>

      {/* Modals */}
      <CreateRoomModal
        isOpen={isCreateRoomOpen}
        onClose={() => setIsCreateRoomOpen(false)}
      />

      <JoinWithCodeModal
        isOpen={isJoinCodeOpen}
        onClose={() => setIsJoinCodeOpen(false)}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <ChatProvider>
        <ChatAppContent />
      </ChatProvider>
    </AuthProvider>
  );
}

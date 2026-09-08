# ⚡ LMK MESS — Real-Time Chat & Rooms Application

A high-performance, modern real-time chat application built with **Node.js**, **Express**, **Socket.io**, **React.js** (Vanilla CSS), **MongoDB Atlas**, and **React Native CLI** (Mobile).

---

## 🌐 Live Application & Links

- **Frontend Web (Vercel)**: [https://lmk-mess.vercel.app](https://lmk-mess.vercel.app)
- **Backend API & WebSockets (Render)**: [https://lmk-mess-api.onrender.com](https://lmk-mess-api.onrender.com)
- **Backend Health Check**: [https://lmk-mess-api.onrender.com/api/health](https://lmk-mess-api.onrender.com/api/health)
- **Public GitHub Repository**: [https://github.com/Vishwajit026/LMK-MESS](https://github.com/Vishwajit026/LMK-MESS)
- **React Native Mobile App**: [https://github.com/Vishwajit026/LMK-MESS/tree/main/mobile](https://github.com/Vishwajit026/LMK-MESS/tree/main/mobile)

---

## 🧰 Tech Stack
- **Backend**: Node.js, Express.js, Socket.io, MongoDB Atlas (Mongoose)
- **Frontend (Web)**: React.js (Vite), Socket.io-client, Vanilla CSS (Strictly **No Tailwind**, **No Next.js**)
- **Mobile Client**: React Native CLI (Android-ready)
- **Real-Time Engine**: Socket.io bidirectional WebSocket communication
- **Design System**: Glassmorphism, Dark/Light theme toggle, Web Audio API sound synthesis, Discord/Slack-inspired layout

---

## ✨ Features Implemented

### 👥 User Authentication & Guest Mode
- **1-Click Instant Guest Join**: Enter chat with custom or randomized avatar & username without any password barrier.
- **Account Registration & Login**: Secured with `bcryptjs` password hashing and JWT authorization tokens.
- **Presence Status**: Switch between 🟢 Online, 🟡 Away, and 🔴 Do Not Disturb.

### 💬 Real-Time Messaging & Rooms
- **Instant Messaging**: Messages broadcasted in sub-millisecond real-time via Socket.io.
- **Room Invite Codes & Password Protection**: 6-character room codes (`#TECH-1A2B`), direct invite URLs (`?code=XXXXXX`), and password/PIN protected private rooms.
- **Independent Channels**: Switch between `#general`, `#tech-talk`, `#gaming-lounge`, `#music-vibes`, `#memes-random`, and custom created channels.
- **Direct 1-on-1 Messages (DMs)**: Private chat channels between any two users with live status indicators.
- **Dynamic Typing Indicators**: Animated bouncing pill showing "*User is typing...*" in real-time.
- **Message Reactions**: Expressive emoji reactions (👍, ❤️, 😂, 🔥, 🚀, 👏) with instant multi-client sync.
- **Media Attachments**: Share images and screenshots directly in the chat feed.
- **Message Replies**: Quote and reply to previous messages.
- **In-App Audio Chimes**: Synthesized pop and receive chimes via Web Audio API (toggleable 🔔/🔕).

### 🕓 Persistent MongoDB Chat History
- All room messages and direct chats are stored in MongoDB Atlas (`lmk_mess_db`).
- History loads automatically upon joining any room or refreshing the application.
- In-room search bar for querying past conversations.

### 🟢 Online Presence Tracking
- Active member counts per channel and globally across the server.
- Interactive slide-out drawer showing online users with one-click direct message action.

### 📱 React Native CLI Mobile App (Android)
- Fully functional mobile client codebase in `mobile/` with room navigation, socket connection, message bubbles, and online user modals.

---

## 🚀 Getting Started Locally

### 1. Prerequisites
- Node.js (v18+)
- pnpm / npm

### 2. Start Backend & Frontend Concurrently
```bash
# In the root folder:
pnpm run dev
```
Or start individually:
```bash
# Backend (Port 5000)
cd backend
node server.js

# Frontend (Port 5173)
cd frontend
pnpm run dev
```

### 3. Open in Browser
Visit `http://localhost:5173` to start chatting! Open two separate browser tabs to experience real-time multi-user communication.

---

## 🧪 Automated Verification
Run the end-to-end multi-client socket and database test suite:
```bash
node backend/test_chat_suite.js
```

---

## 📤 Submission Checklist
- [x] **Frontend Web**: React.js with pure Vanilla CSS, Socket.io-client, responsive design ([https://lmk-mess.vercel.app](https://lmk-mess.vercel.app)).
- [x] **Backend API**: Node.js, Express, Socket.io, MongoDB integration ([https://lmk-mess-api.onrender.com](https://lmk-mess-api.onrender.com)).
- [x] **Real-time Events**: `joinRoom`, `chatMessage`, `typing`, `onlineUsers`, `messageReaction`, `directMessage`.
- [x] **Chat History**: Persisted in MongoDB Atlas and loaded on room join.
- [x] **Mobile App**: Complete React Native CLI project in `mobile/` directory.

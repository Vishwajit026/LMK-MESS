# LMK MESS — React Native CLI Mobile App (Android)

Mobile client for **LMK MESS** built with **React Native CLI** and **Socket.io**.

---

## 📱 Features Included
- **1-Click Guest Join & Account Login** with avatar selection
- **Room Navigation & Search** (`#general`, `#tech-talk`, `#gaming-lounge`, custom channels)
- **Real-Time Group Messaging** powered by Socket.io
- **Chat History** loaded from MongoDB
- **Dynamic Typing Indicator** ("*Alice is typing...*")
- **Online Members Modal**
- **Channel Creation** with custom icon & topic
- **Message Reactions** (🔥, 👍, ❤️, 👏)
- **WhatsApp/Discord Inspired Dark Modern UI**

---

## 🚀 Setup & Run Instructions (Android)

### 1. Prerequisites
- Node.js (>= 18)
- Android Studio with Android SDK & Platform Tools (ADB)
- Java Development Kit (JDK 17)

### 2. Install Dependencies
```bash
cd mobile
npm install
```

### 3. Start Metro Bundler
```bash
npm start
```

### 4. Run on Android Emulator or Device
```bash
# In another terminal window:
npm run android
```

### 5. Build Release APK
```bash
cd android
./gradlew assembleRelease
```
The generated APK will be available at:
`mobile/android/app/build/outputs/apk/release/app-release.apk`

---

## 📡 API Configuration
The default backend URL is configured in `src/services/socket.js`:
- Android Emulator: `http://10.0.2.2:5000`
- Physical Device over LAN: `http://<YOUR_LOCAL_IP>:5000` (e.g. `http://192.168.1.3:5000`)
- Production Hosted Server: `https://your-backend-domain.com`

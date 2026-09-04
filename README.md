# 🪐 TaskPlanet Mini Social Post Application

A full-stack, responsive Mini Social Post Application inspired by the Social Feed in the **TaskPlanet App**. Built with **React.js**, **Material UI (MUI)**, **Node.js**, **Express.js**, and **MongoDB**.

---

## 🌟 Key Features

1. **User Authentication (JWT & Bcrypt)**:
   - Secure Sign Up & Login with email/username and password.
   - 1-Click quick Demo Account login for testing (`Aarav Sharma`, `Priya Patel`, `Rohan Verma`).
   - Profile bio, avatar generator, and session persistence in `localStorage`.

2. **Create Post (Text, Image, or Both)**:
   - Post text content, image media, or both simultaneously (neither is mandatory alone; either is sufficient).
   - Local device file upload (Base64 data URL) or Web Image URL attachment.
   - Hashtag categorization (`#TaskPlanet`, `#general`, `#tech`, `#lifestyle`, `#milestone`, `#updates`).
   - Celebratory confetti on post submission!

3. **Public Social Feed**:
   - Public feed displaying all posts from all community users.
   - User avatars, formatted author handles, tag badges, and humanized relative timestamps (`just now`, `5m ago`, `2d ago`).
   - Hashtag auto-detection with clickable tag filters.

4. **Interactive Likes & Likers Modal**:
   - Instant like/unlike toggle with optimistic UI updates and heart pop animation.
   - Stored records of user IDs, names, and usernames who liked each post.
   - Likers dialog modal to view the full list of users who liked any post.

5. **Comment Thread & Moderation**:
   - Instant comment submission with user avatar, name, and relative time.
   - Comment deletion permissions (author of the comment or post owner).

6. **TaskPlanet-Inspired Responsive UI**:
   - **Mobile View**: Mobile bottom navigation bar (`Feed`, `Trending`, `+ Create`, `Search`, `Profile`) inspired by TaskPlanet Android app.
   - **Desktop View**: 3-column layout (Left: Profile & Navigation; Center: Feed; Right: Trending Topics & Top Contributors).
   - **Theme**: Dark Mode & Light Mode support with custom color transitions.
   - **No Tailwind CSS**: Styled strictly with Material UI (MUI) components and pure Custom CSS design system.

7. **Database Architecture**:
   - Strictly 2 MongoDB Collections:
     - `users` (Account credentials, profile, avatar, bio)
     - `posts` (Content, image, tags, embedded likes array, embedded comments array)

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React.js (Vite), Material UI (`@mui/material`, `@mui/icons-material`), Emotion, Custom CSS, Axios, Canvas-Confetti |
| **Backend** | Node.js, Express.js, JSON Web Tokens (JWT), Bcrypt.js, CORS, Dotenv |
| **Database** | MongoDB (Mongoose ODM) — strictly 2 collections (`users` and `posts`) |
| **Styling** | Material UI (MUI) & Pure CSS Tokens (❌ Zero TailwindCSS) |

---

## 📂 Project Structure

```
.
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB connection logic
│   ├── controllers/
│   │   ├── authController.js     # Signup, Login, Me handlers
│   │   └── postController.js     # Post CRUD, Like toggle, Comments, Pagination
│   ├── middleware/
│   │   └── authMiddleware.js     # JWT verification & optionalAuth middleware
│   ├── models/
│   │   ├── User.js               # Collection 1: User schema & bcrypt hashing
│   │   └── Post.js               # Collection 2: Post schema (with embedded likes & comments)
│   ├── routes/
│   │   ├── authRoutes.js         # /api/auth endpoints
│   │   └── postRoutes.js         # /api/posts endpoints
│   ├── utils/
│   │   └── seedData.js           # Sample TaskPlanet community seed data
│   ├── .env.example
│   ├── package.json
│   └── server.js                 # Express server entrypoint
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.jsx        # Top bar with branding, search, dark mode toggle
│   │   │   ├── BottomNav.jsx     # TaskPlanet mobile bottom navigation
│   │   │   ├── StoriesBar.jsx    # Community creator reels
│   │   │   ├── CreatePostCard.jsx# Text + Image post creation card
│   │   │   ├── CreatePostModal.jsx# Floating post creation modal
│   │   │   ├── PostCard.jsx      # Feed card with media, like toggle, comment drawer
│   │   │   ├── CommentSection.jsx# Interactive comment list & input
│   │   │   ├── LikesModal.jsx    # Dialog showing users who liked a post
│   │   │   ├── SidebarLeft.jsx   # Profile stats & topic channels
│   │   │   ├── SidebarRight.jsx  # Trending hashtags & top contributors
│   │   │   └── AuthModal.jsx     # Sign In / Sign Up dialog with 1-click demo logins
│   │   ├── context/
│   │   │   └── AuthContext.jsx   # Global auth state & token persistence
│   │   ├── services/
│   │   │   └── api.js            # Axios client with JWT interceptor
│   │   ├── App.jsx               # Main feed layout & filter logic
│   │   ├── main.jsx              # React DOM entrypoint
│   │   └── index.css             # TaskPlanet design system (Pure CSS)
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── package.json                  # Root runner scripts
└── README.md                     # Documentation & Deployment Guide
```

---

## 🚀 Quick Start Guide (Local Development)

### 1. Prerequisites
- Node.js (v18 or v20+)
- MongoDB running locally OR MongoDB Atlas connection URI

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env

# Edit .env with your MongoDB URI if needed:
# MONGO_URI=mongodb://127.0.0.1:27017/taskplanet_social
# JWT_SECRET=taskplanet_super_secret_jwt_key_2026

# Start backend server (starts on http://localhost:5000)
npm run dev
```

*Note: The backend automatically seeds initial demo community posts and users on first boot!*

### 3. Frontend Setup
```bash
cd frontend
npm install

# Start Vite React server (starts on http://localhost:5173)
npm run dev
```

### 4. Running Concurrently from Root
```bash
npm install
npm run dev
```

---

## 📡 REST API Documentation

### Authentication (`/api/auth`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/auth/signup` | Register new user account | No |
| `POST` | `/api/auth/login` | Login with email/username + password | No |
| `GET` | `/api/auth/me` | Fetch authenticated user data | Yes (Bearer Token) |

### Social Posts (`/api/posts`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/posts` | Get paginated public feed (`?page=1&limit=6&tag=&search=`) | Optional |
| `GET` | `/api/posts/:id` | Get single post details with all likes/comments | Optional |
| `POST` | `/api/posts` | Create new post (`text`, `image`, `tag`) | Yes |
| `POST` | `/api/posts/:id/like` | Toggle like / unlike on post | Yes |
| `POST` | `/api/posts/:id/comment` | Add comment to post (`text`) | Yes |
| `DELETE` | `/api/posts/:postId/comments/:commentId` | Delete a comment | Yes (Author/Post owner) |
| `DELETE` | `/api/posts/:id` | Delete own post | Yes (Post owner) |

---

## 🌐 Deployment Instructions

### 1. Database (MongoDB Atlas)
1. Sign up at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a free shared M0 cluster.
3. Under **Database Access**, create a database user and password.
4. Under **Network Access**, add `0.0.0.0/0` (allow access from anywhere).
5. Copy your connection string: `mongodb+srv://<username>:<password>@cluster0.mongodb.net/taskplanet_social?retryWrites=true&w=majority`.

### 2. Backend (Render)
1. Go to [Render.com](https://render.com) and click **New Web Service**.
2. Connect your GitHub repository.
3. Configure settings:
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
4. Add Environment Variables:
   - `MONGO_URI`: `mongodb+srv://...` (your Atlas URI)
   - `JWT_SECRET`: `your_secure_jwt_secret_key`
   - `PORT`: `5000`
5. Click **Deploy Web Service** and note your Render API URL (e.g. `https://taskplanet-api.onrender.com`).

### 3. Frontend (Vercel / Netlify)
1. Go to [Vercel](https://vercel.com) or [Netlify](https://www.netlify.com).
2. Import your GitHub repository.
3. Configure project:
   - **Root Directory**: `frontend`
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Add Environment Variable:
   - `VITE_API_URL`: `https://taskplanet-api.onrender.com/api`
5. Click **Deploy**.

---

## 🎯 Demo Login Credentials
For instant testing, use the 1-Click login buttons in the Sign In modal or:
- **Email**: `aarav@taskplanet.app`
- **Password**: `Password123!`

# 🚀 LMK MESS — Live Deployment Guide

Follow these quick steps to get live URLs for both Frontend (Vercel) and Backend (Render).

---

## 1. Push Latest Code to GitHub
Open your terminal in the project root and run:
```bash
git push origin main
```

---

## 2. Deploy Frontend to Vercel (2 Minutes)

1. Go to **[vercel.com/new](https://vercel.com/new)** and log in with GitHub.
2. Select your repository (`Vishwajit026/Mini-social` or `LMK-MESS`) and click **Import**.
3. Configure the project settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click *Edit* and select **`frontend`**
   - **Build Command**: `pnpm run build` (or `npm run build`)
   - **Output Directory**: `dist`
4. Add **Environment Variables**:
   | Variable Name | Value |
   | :--- | :--- |
   | `VITE_API_URL` | `https://your-backend-name.onrender.com/api` |
   | `VITE_SOCKET_URL` | `https://your-backend-name.onrender.com` |
5. Click **Deploy**. Vercel will build and give you your active live URL!

---

## 3. Deploy Backend to Render (Free Node.js + WebSockets)

Render supports continuous WebSockets (Socket.io) and Express servers out of the box:

1. Go to **[dashboard.render.com](https://dashboard.render.com/)** and click **New + → Web Service**.
2. Connect your GitHub repository.
3. Configure settings:
   - **Name**: `lmk-mess-backend`
   - **Region**: Closest to you (e.g., Singapore, Frankfurt, Oregon)
   - **Root Directory**: **`backend`**
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Instance Type**: `Free`
4. In the **Environment Variables** section, add:
   | Variable Key | Value |
   | :--- | :--- |
   | `PORT` | `5000` |
   | `MONGO_URI` | `mongodb+srv://taskplanet_admin:TaskPlanet2026!Secure@cluster0.plbrcr3.mongodb.net/lmk_mess_db?retryWrites=true&w=majority` |
   | `JWT_SECRET` | `lmk_mess_super_secret_jwt_key_2026` |
5. Click **Create Web Service**. Render will boot the server and connect directly to MongoDB Atlas Cloud!

---

## 4. Update Frontend with Your Render URL
Once your Render backend is live (e.g. `https://lmk-mess-backend.onrender.com`):
1. Go to your Vercel Dashboard → Project Settings → **Environment Variables**.
2. Set `VITE_API_URL` to `https://lmk-mess-backend.onrender.com/api`
3. Set `VITE_SOCKET_URL` to `https://lmk-mess-backend.onrender.com`
4. Click **Redeploy** on Vercel.

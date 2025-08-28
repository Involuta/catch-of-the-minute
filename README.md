# 🐟 Catch of the Minute

A multiplayer web game built with **React (Vite)** on the frontend and **Firebase (Cloud Functions + Firestore + Auth + Pub/Sub)** on the backend. Deployed on AWS S3 + CloudFront. Players join, trade, and compete around timed events (“Catch of the Minute”) managed by serverless functions.

---

## 🚀 Features

- 🎮 Real-time multiplayer gameplay  
- 🔥 Firebase backend (serverless, scalable)  
- ⚡ Automatic round timer using Pub/Sub + Cloud Functions  
- 🖥️ React frontend with Vite for fast dev & builds  
- 🔒 Firebase Authentication for players  

---

## 📂 Project Structure

- **frontend/** — React + Vite app (UI)  
  - `src/` — frontend source code  
  - `public/` — static assets  
  - `package.json` — frontend dependencies  

- **functions/** — Firebase Cloud Functions (backend logic)  
  - `src/` — cloud functions source  
  - `lib/` — transpiled JS (output)  
  - `package.json` — backend dependencies  

- **firebase.json** — Firebase project configuration  
- **.firebaserc** — Firebase project alias settings  
- **README.md** — this file

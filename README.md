# TWYNK - Demo App

TWYNK is a social networking demo application built with the MERN stack (MongoDB, Express, React, Node.js) and styled with Tailwind CSS.  
It provides features like authentication, posting, following, notifications, and media uploads — all with modern, optimized data fetching using React Query.

---

## 🚀 Features

- ⚛️ **Tech Stack:** React.js, MongoDB, Node.js, Express, Tailwind CSS
- 🔐 **Authentication:** Secure login & signup with JSON Web Tokens (JWT)
- 🔥 **React Query:** Efficient data fetching, caching, and synchronization
- 👥 **Suggested Users to Follow**
- ✍️ **Create Posts**
- 🗑️ **Delete Posts** (only if you are the owner)
- 💬 **Comment on Posts**
- ❤️ **Like/Unlike Posts**
- 📝 **Edit Profile Info**
- 🖼️ **Edit Cover Image & Profile Picture**
- 📷 **Image Uploads using Cloudinary**
- 🔔 **Real-time Notifications**
- 🌐 **Deployed for Live Access**
- ⏳ **More features coming soon!**

---

## 🛠️ Tech Stack

**Frontend**
- React.js
- Tailwind CSS
- React Query
- React Router DOM

**Backend**
- Node.js
- Express.js
- MongoDB + Mongoose
- JWT Authentication
- Cloudinary SDK

---

## 📦 Installation & Setup

### Clone the repository

git clone https://github.com/yourusername/twynk.git
cd twynk
 Install dependencies
Backend

cd backend
npm install
Frontend

bash

cd ../frontend
npm install
 Setup environment variables
Create a .env file in both backend and frontend folders.

### Backend .env

env
Copy
Edit
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

Backend


cd backend
npm run dev
Frontend

```bash

Edit
cd ../frontend
npm start

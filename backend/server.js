import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
dotenv.config({ path: './.env' });
import { v2 as cloudinary } from 'cloudinary';
import path from 'path';
import authRoutes from './routes/auth.route.js';
import userRoutes from './routes/user.route.js';
import connectToDatabase from './db/connectToDb.js';
import postRoutes from './routes/post.route.js';
import notificationRoutes from './routes/notification.route.js';

const app = express();
const PORT = process.env.PORT;
const __dirname = path.resolve();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Middleware
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['Content-Length', 'X-Requested-With'],
  })
);
app.use(express.json({ limit: '50mb' })); // to parse req.bodies
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// security-related HTTP headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader(
    'Strict-Transport-Security',
    'max-age=31536000; includeSubDomains'
  );
  next();
});

//routes
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/posts', postRoutes);
app.use('/api/v1/notifications', notificationRoutes);

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '/frontend/dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.send('API is running...');
  });
}

// Start server after DB connection
connectToDatabase()
  .then(() => {
    app.listen(process.env.PORT, () => {
      console.log(`✅ Connected to MongoDB: ${process.env.DB_NAME}`);
      console.log(`🚀 App is listening on port ${process.env.PORT}`);
    });
  })
  .catch(error => {
    console.error('❌ Database connection error:', error);
    process.exit(1);
  });

export { app };

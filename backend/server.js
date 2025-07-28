import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
dotenv.config({ path: './.env' });


import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import connectToDatabase from './db/connectToDb.js';


const app = express();
const PORT = process.env.PORT;

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

// Set security-related HTTP headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
});

//routes
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
// app.use('/api/v1/posts', postRoutes);
// app.use('/api/v1/comments', commentRoutes);
// app.use('/api/v1/likes', likeRoutesauthRoutes);

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

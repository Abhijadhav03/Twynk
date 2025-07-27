import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config({ path: './.env' });
import authRoutes from './routes/auth.routes.js';
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
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

//routes
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
app.use('/api/v1', authRoutes);

// Start server after DB connection
connectToDatabase()
    .then(() => {
        app.listen(process.env.PORT, () => {
            console.log(`✅ Connected to MongoDB: ${process.env.DB_NAME}`);
            console.log(`🚀 App is listening on port ${process.env.PORT}`);
        });
    })
    .catch((error) => {
        console.error('❌ Database connection error:', error);
        process.exit(1);
    });

export { app };

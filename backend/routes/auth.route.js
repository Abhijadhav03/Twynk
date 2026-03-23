import express from 'express';
const router = express.Router();
import {
  signupUser,
  loginUser,
  logoutUser,
  getMe,
} from '../controllers/auth.controller.js';
import { protectRoute } from '../middelewares/protectroute.middleware.js';

router.route('/').get((req, res) => {
  res.json({ message: 'Welcome to the Auth API' });
});
router.route('/signup').post(signupUser);
router.route('/login').post(loginUser);
router.route('/logout').post(logoutUser);
router.route('/me').get(protectRoute, getMe);

export default router;

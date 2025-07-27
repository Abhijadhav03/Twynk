import express from 'express';
const router = express.Router();
import {
  signupUser,
  loginUser,
  logoutUser,
} from '../controllers/auth.controller.js';

router.route('/signup').post(signupUser);
router.route('/login').post(loginUser);
router.route('/logout').post(logoutUser);
// router.route('/profile').get(getUserProfile);

export default router;

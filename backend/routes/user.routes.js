import express from 'express';
import { protectRoute } from '../middelewares/protectroute.middleware.js';
import {
  getUserProfile,
  // getUserPosts,
  followunfollowUser,
  getUserFollowers,
  getSuggestedUsers
  // updateUserProfile,
} from '../controllers/user.controller.js';
const router = express.Router();

router.route('/profile/:username').get(protectRoute, getUserProfile);
//router.route('/posts/:username').get(protectRoute, getUserPosts);
router.route('/follow/:id').post(protectRoute, followunfollowUser);
router.route('/followers/:username').get(protectRoute, getUserFollowers);
router.route('/suggested').get(protectRoute, getSuggestedUsers);
// router.route('/update').post(protectRoute, updateUserProfile);

export default router;
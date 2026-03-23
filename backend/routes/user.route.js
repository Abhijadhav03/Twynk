import express from 'express';
import { protectRoute } from '../middelewares/protectroute.middleware.js';
import {
  getUserProfile,
  followunfollowUser,
  getUserFollowers,
  getSuggestedUsers,
  updateUser,
  searchUsers,
} from '../controllers/user.controller.js';
const router = express.Router();

router.route('/profile/:username').get(protectRoute, getUserProfile);
router.route('/follow/:id').post(protectRoute, followunfollowUser);
router.route('/followers/:username').get(protectRoute, getUserFollowers);
router.route('/suggested').get(protectRoute, getSuggestedUsers);
router.route('/update').put(protectRoute, updateUser);
router.route('/search').get(protectRoute, searchUsers);

export default router;

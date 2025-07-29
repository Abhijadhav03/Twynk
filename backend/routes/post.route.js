import express from 'express';
import {
  commentOnPost,
  createPost,
  deletePost,
  getallPosts,
  getFollowingPosts,
  getUserPosts,
  likedPost,
  likeunlikePost,
  updatePost,
} from '../controllers/post.controller.js';
import { protectRoute } from '../middelewares/protectroute.middleware.js';
const router = express.Router();

router.route('/create').post(protectRoute, createPost);
router.route('/like/:id').post(protectRoute, likeunlikePost);
router.route('/comment/:id').post(protectRoute, commentOnPost);
router.route('/delete/:id').delete(protectRoute, deletePost);
router.route('/getall').get(protectRoute, getallPosts);
router.route('/update/:id').put(protectRoute, updatePost);
router.route('/liked').get(protectRoute, likedPost);
router.route('/following').get(protectRoute, getFollowingPosts);
router.route('/user/:id').get(protectRoute, getUserPosts);

export default router;

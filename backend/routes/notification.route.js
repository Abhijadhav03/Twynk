import express from 'express';
import { protectRoute } from '../middelewares/protectroute.middleware.js';
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  deleteAllNotifications,
  deleteNotification,
} from '../controllers/notification.controller.js';

const router = express.Router();

router.route('/').get(protectRoute, getNotifications);
router.route('/unread-count').get(protectRoute, getUnreadCount);
router.route('/mark-read').put(protectRoute, markAsRead);
router.route('/').delete(protectRoute, deleteAllNotifications);
router.route('/:id').delete(protectRoute, deleteNotification);

export default router;

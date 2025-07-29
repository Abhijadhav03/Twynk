import e from 'express';
import express from 'express';
import { protectRoute } from '../middelewares/protectroute.middleware.js';
import {
  deleteNotifications,
  getallnotifications,
  getNotifications,
} from '../controllers/notification.controller.js';
//import { getNotifications } from './../controllers/notification.controller.js';

const router = express.Router();

router.route('/').get(protectRoute, getNotifications);
//router.route('/all').get(protectRoute, getallnotifications);
// router.route('/:id').get(protectRoute, getNotificationById);
// router.route('/mark-read/:id').patch(protectRoute, markNotificationAsRead);
router.route('/').delete(protectRoute, deleteNotifications);

export default router;

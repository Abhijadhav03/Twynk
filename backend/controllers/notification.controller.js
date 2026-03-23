import Notification from '../models/notification.model.js';

export const getNotifications = async (req, res) => {
  try {
    const userId = req.user._id;

    const notifications = await Notification.find({ to: userId })
      .populate({
        path: 'from',
        select: 'username profilePicture fullName',
      })
      .sort({ createdAt: -1 });

    res.status(200).json(notifications);
  } catch (error) {
    console.log('Error in getNotifications function', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user._id;
    const count = await Notification.countDocuments({ to: userId, read: false });
    res.status(200).json({ count });
  } catch (error) {
    console.log('Error in getUnreadCount function', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const markAsRead = async (req, res) => {
  try {
    const userId = req.user._id;
    await Notification.updateMany({ to: userId, read: false }, { read: true });
    res.status(200).json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.log('Error in markAsRead function', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const deleteAllNotifications = async (req, res) => {
  try {
    const userId = req.user._id;
    await Notification.deleteMany({ to: userId });
    res.status(200).json({ message: 'All notifications deleted successfully' });
  } catch (error) {
    console.log('Error in deleteAllNotifications function', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const deleteNotification = async (req, res) => {
  try {
    const userId = req.user._id;
    const notificationId = req.params.id;

    const notification = await Notification.findOneAndDelete({
      _id: notificationId,
      to: userId,
    });

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    res.status(200).json({ message: 'Notification deleted successfully' });
  } catch (error) {
    console.log('Error in deleteNotification function:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

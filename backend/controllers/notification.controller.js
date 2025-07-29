import Notification from '../models/notification.model.js';

export const getNotifications = async (req, res) => {
  try {
    const userId = req.user._id;

    const notifications = await Notification.find({ to: userId }).populate({
      path: 'from',
      select: 'username profileImg',
    });

    await Notification.updateMany({ to: userId }, { read: true });

    res.status(200).json(notifications);
  } catch (error) {
    console.log('Error in getNotifications function', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
export const getallnotifications = async (req, res) => {
  try {
    const notifications = await Notification.find().populate({
      path: 'from',
      select: 'username profileImg',
    });

    await Notification.deleteMany({ to: userId });

    res.status(200).json({ message: 'Notifications deleted successfully' });
  } catch (error) {
    console.log('Error in deleteNotifications function', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
export const deleteNotifications = async (req, res) => {
  try {
    const userId = req.user._id;
    const notificationId = req.params.id;

    const notification = await Notification.findOneAndDelete({
      _id: notificationId,
      user: userId, // Assuming your schema uses "user" field
    });

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    res.status(200).json({ message: 'Notification deleted successfully' });
  } catch (error) {
    console.log('Error in deleteNotifications function:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

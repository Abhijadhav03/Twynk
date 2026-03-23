import User from '../models/user.model.js';
import Notification from '../models/notification.model.js';
import bcrypt from 'bcryptjs';
import { v2 as cloudinary } from 'cloudinary';

export const getUserProfile = async (req, res) => {
  try {
    const { username } = req.params;

    if (!username) {
      return res.status(400).json({ message: 'Username is required' });
    }

    const user = await User.findOne({ username }).select('-password -__v');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json({
      message: 'User profile fetched successfully',
      user,
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const followunfollowUser = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    if (!id) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    const userToFollow = await User.findById(id);
    if (!userToFollow) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (userToFollow._id.equals(userId)) {
      return res.status(400).json({ message: 'You cannot follow yourself' });
    }

    const isFollowing = userToFollow.followers.includes(userId);

    if (isFollowing) {
      // Unfollow - remove from both sides
      await User.findByIdAndUpdate(userToFollow._id, {
        $pull: { followers: userId },
      });
      await User.findByIdAndUpdate(userId, {
        $pull: { following: userToFollow._id },
      });

      return res.status(200).json({
        message: 'User unfollowed successfully',
      });
    } else {
      // Follow - add to both sides
      await User.findByIdAndUpdate(userToFollow._id, {
        $addToSet: { followers: userId },
      });
      await User.findByIdAndUpdate(userId, {
        $addToSet: { following: userToFollow._id },
      });

      // Create follow notification
      await Notification.create({
        from: userId,
        to: userToFollow._id,
        type: 'follow',
        content: `${req.user.username} started following you.`,
      });

      return res.status(200).json({
        message: 'User followed successfully',
      });
    }
  } catch (error) {
    console.error('Error following/unfollowing user:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const getUserFollowers = async (req, res) => {
  const { username } = req.params;

  if (!username) {
    return res.status(400).json({ message: 'Username is required' });
  }

  try {
    const user = await User.findOne({ username }).select('followers');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const followers = await User.find({ _id: { $in: user.followers } }).select(
      '-password -__v'
    );

    return res.status(200).json({
      message: 'User followers fetched successfully',
      followers: followers.length > 0 ? followers : [],
      followersCount: followers.length,
    });
  } catch (error) {
    console.error('Error in getUserFollowers:', error.message);
    return res.status(500).json({ error: 'Server error' });
  }
};

export const getSuggestedUsers = async (req, res) => {
  const userId = req.user._id;

  try {
    const userfollowedbyme = await User.findById(userId).select('following');
    if (!userfollowedbyme) {
      return res.status(404).json({ message: 'User not found' });
    }

    const users = await User.aggregate([
      {
        $match: {
          _id: { $ne: userId, $nin: userfollowedbyme.following },
        },
      },
      { $sample: { size: 10 } },
    ]);

    const suggestedUsers = users
      .filter((user) => user._id.toString() !== userId.toString())
      .map((user) => {
        user.password = undefined;
        return user;
      });

    return res.status(200).json({
      message: 'Suggested users fetched successfully',
      users: suggestedUsers,
    });
  } catch (error) {
    console.error('Error in getSuggestedUsers:', error.message);
    return res.status(500).json({ error: 'Server error' });
  }
};

export const updateUser = async (req, res) => {
  const {
    fullName,
    email,
    username,
    currentPassword,
    newPassword,
    bio,
    link,
    profileImg,
    coverImg,
  } = req.body;

  const userId = req.user._id;

  try {
    let user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Password update handling
    if ((newPassword && !currentPassword) || (!newPassword && currentPassword)) {
      return res.status(400).json({
        error: 'Please provide both current password and new password',
      });
    }

    if (currentPassword && newPassword) {
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ error: 'Current password is incorrect' });
      }

      if (newPassword.length < 6) {
        return res
          .status(400)
          .json({ error: 'Password must be at least 6 characters long' });
      }

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
    }

    // Profile Image Upload - use correct field name: profilePicture
    if (profileImg) {
      if (
        user.profilePicture &&
        user.profilePicture.includes('cloudinary')
      ) {
        const publicId = user.profilePicture.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(publicId);
      }
      const uploaded = await cloudinary.uploader.upload(profileImg, {
        folder: 'twynk/profiles',
      });
      user.profilePicture = uploaded.secure_url;
    }

    // Cover Image Upload - use correct field name: coverPicture
    if (coverImg) {
      if (
        user.coverPicture &&
        user.coverPicture.includes('cloudinary')
      ) {
        const publicId = user.coverPicture.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(publicId);
      }
      const uploaded = await cloudinary.uploader.upload(coverImg, {
        folder: 'twynk/covers',
      });
      user.coverPicture = uploaded.secure_url;
    }

    // Update fields
    user.fullName = fullName || user.fullName;
    user.email = email || user.email;
    user.username = username || user.username;
    user.bio = bio !== undefined ? bio : user.bio;
    user.link = link !== undefined ? link : user.link;

    await user.save();
    user.password = undefined;

    return res.status(200).json(user);
  } catch (error) {
    console.error('Error in updateUser:', error.message);
    return res.status(500).json({ error: 'Server error' });
  }
};

export const searchUsers = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    const users = await User.find({
      $or: [
        { username: { $regex: q, $options: 'i' } },
        { fullName: { $regex: q, $options: 'i' } },
      ],
    })
      .select('-password -__v')
      .limit(20);

    return res.status(200).json({ users });
  } catch (error) {
    console.error('Error in searchUsers:', error.message);
    return res.status(500).json({ error: 'Server error' });
  }
};

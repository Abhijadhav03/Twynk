import asyncHandler from '../utils/asynchandler.js';
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
      // Unfollow
      const updatedUser = await User.findByIdAndUpdate(
        userToFollow._id,
        { $pull: { followers: userId } },
        { new: true }
      );

      return res.status(200).json({
        message: 'User unfollowed successfully',
        user: {
          id: updatedUser._id,
          username: updatedUser.username,
          followersCount: updatedUser.followers.length,
        },
      });
    } else {
      // Follow
      const updatedUser = await User.findByIdAndUpdate(
        userToFollow._id,
        { $addToSet: { followers: userId } },
        { new: true }
      );

      const notification = {
        from: userId,
        to: userToFollow._id,
        type: 'follow',
        content: `${req.user.username} started following you.`,
      };
      await Notification.create(notification);

      await User.findByIdAndUpdate(
        userId,
        { $addToSet: { following: userToFollow._id } },
        { new: true }
      );

      return res.status(200).json({
        message: 'User followed successfully',
        user: {
          id: updatedUser._id,
          username: updatedUser.username,
          followersCount: updatedUser.followers.length,
        },
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

    const followers = await User.find({ _id: { $in: user.followers } }).select('-password -__v');

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
      .filter(user => user._id.toString() !== userId.toString())
      .map(user => {
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
        return res.status(400).json({ error: 'Password must be at least 6 characters long' });
      }

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
    }

    // Profile Image Upload
    if (profileImg) {
      if (user.profileImg) {
        await cloudinary.uploader.destroy(user.profileImg.split('/').pop().split('.')[0]);
      }
      const uploaded = await cloudinary.uploader.upload(profileImg);
      user.profileImg = uploaded.secure_url;
    }

    // Cover Image Upload
    if (coverImg) {
      if (user.coverImg) {
        await cloudinary.uploader.destroy(user.coverImg.split('/').pop().split('.')[0]);
      }
      const uploaded = await cloudinary.uploader.upload(coverImg);
      user.coverImg = uploaded.secure_url;
    }

    // Update fields
    user.fullName = fullName || user.fullName;
    user.email = email || user.email;
    user.username = username || user.username;
    user.bio = bio || user.bio;
    user.link = link || user.link;

    await user.save();
    user.password = undefined;

    return res.status(200).json(user);
  } catch (error) {
    console.error('Error in updateUser:', error.message);
    return res.status(500).json({ error: 'Server error' });
  }
};

// export const unfollowUser = asyncHandler(async (req, res) => {
//   const { username } = req.params;
//   const userId = req.user._id;

//   if (!username) {
//     return res.status(400).json({ message: "Username is required" });
//   }

//   const userToUnfollow = await User.findOne({ username });
//   if (!userToUnfollow) {
//     return res.status(404).json({ message: "User not found" });
//   }

//   if (!userToUnfollow.followers.includes(userId)) {
//     return res.status(400).json({ message: "You are not following this user" });
//   }

//   userToUnfollow.followers.pull(userId);
//   await userToUnfollow.save();

//   return res.status(200).json({
//     message: "User unfollowed successfully",
//     user: {
//       id: userToUnfollow._id,
//       username: userToUnfollow.username,
//       followersCount: userToUnfollow.followers.length,
//     },
//   });
// });

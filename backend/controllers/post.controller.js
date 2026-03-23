import asyncHandler from '../utils/asynchandler.js';
import User from '../models/user.model.js';
import Post from '../models/post.model.js';
import Notification from '../models/notification.model.js';
import { v2 as cloudinary } from 'cloudinary';

export const createPost = asyncHandler(async (req, res) => {
  let { text, img } = req.body;
  const userId = req.user._id.toString();
  const user = await User.findById(userId).select('fullName');

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found',
    });
  }

  if (!text && !img) {
    return res.status(400).json({
      success: false,
      message: 'Post must contain either text or an image',
    });
  }

  if (img) {
    try {
      const uploadedResponse = await cloudinary.uploader.upload(img, {
        folder: 'twynk/posts',
      });
      img = uploadedResponse.secure_url;
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Image upload failed',
        error: error.message,
      });
    }
  }

  try {
    const newPost = await Post.create({
      user: userId,
      fullName: user.fullName,
      text,
      img,
    });

    res.status(201).json({
      success: true,
      message: 'Post created successfully',
      post: newPost,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create post',
      error: error.message,
    });
  }
});

export const likeunlikePost = asyncHandler(async (req, res) => {
  const postId = req.params.id;
  const userId = req.user._id.toString();

  try {
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }

    let message;
    if (post.likes.includes(userId)) {
      // Unlike
      post.likes = post.likes.filter((like) => like.toString() !== userId);
      await User.updateOne({ _id: userId }, { $pull: { likedPosts: postId } });
      message = 'Post unliked successfully';
    } else {
      // Like
      post.likes.push(userId);
      await User.updateOne(
        { _id: userId },
        { $addToSet: { likedPosts: postId } }
      );
      message = 'Post liked successfully';

      // Create like notification (only if not liking own post)
      if (post.user.toString() !== userId) {
        await Notification.create({
          from: userId,
          to: post.user,
          type: 'like',
          content: `${req.user.username} liked your post.`,
        });
      }
    }

    await post.save();

    res.status(200).json({
      success: true,
      message,
      likes: post.likes,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to like/unlike post',
      error: error.message,
    });
  }
});

export const deletePost = asyncHandler(async (req, res) => {
  const postId = req.params.id;
  const userId = req.user._id.toString();

  try {
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }
    if (post.user.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this post',
      });
    }
    if (post.img) {
      const publicId = post.img.split('/').pop().split('.')[0];
      await cloudinary.uploader.destroy(publicId);
    }
    await Post.findByIdAndDelete(postId);
    res.status(200).json({
      success: true,
      message: 'Post deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete post',
      error: error.message,
    });
  }
});

export const commentOnPost = asyncHandler(async (req, res) => {
  const postId = req.params.id;
  const { text } = req.body;
  const userId = req.user._id.toString();

  if (!text) {
    return res.status(400).json({
      success: false,
      message: 'Comment text is required',
    });
  }

  try {
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }
    post.comments.push({ text, user: userId });
    await post.save();

    // Create comment notification (only if not commenting on own post)
    if (post.user.toString() !== userId) {
      await Notification.create({
        from: userId,
        to: post.user,
        type: 'comment',
        content: `${req.user.username} commented on your post: "${text.substring(0, 50)}"`,
      });
    }

    // Re-fetch with populated comments
    const updatedPost = await Post.findById(postId)
      .populate('user', '-password')
      .populate('comments.user', 'username fullName profilePicture');

    res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      post: updatedPost,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to add comment',
      error: error.message,
    });
  }
});

export const getallPosts = asyncHandler(async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('user', '-password')
      .populate('comments.user', 'username fullName profilePicture')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      posts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch posts',
      error: error.message,
    });
  }
});

export const updatePost = asyncHandler(async (req, res) => {
  const postId = req.params.id;
  const { text, img } = req.body;
  const userId = req.user._id.toString();
  try {
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }
    if (post.user.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update this post',
      });
    }
    post.text = text;
    post.img = img;
    await post.save();
    res.status(200).json({
      success: true,
      message: 'Post updated successfully',
      post,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update post',
      error: error.message,
    });
  }
});

export const likedPost = asyncHandler(async (req, res) => {
  const userId = req.params.id || req.user._id.toString();

  try {
    const user = await User.findById(userId).populate({
      path: 'likedPosts',
      populate: [
        { path: 'user', select: '-password' },
        { path: 'comments.user', select: 'username fullName profilePicture' },
      ],
    });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }
    res.status(200).json({
      success: true,
      posts: user.likedPosts || [],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch liked posts',
      error: error.message,
    });
  }
});

export const getFollowingPosts = asyncHandler(async (req, res) => {
  const userId = req.user._id.toString();

  try {
    const user = await User.findById(userId).populate('following');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const followingPosts = await Post.find({
      user: { $in: user.following.map((follow) => follow._id) },
    })
      .populate('user', '-password')
      .populate('comments.user', 'username fullName profilePicture')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      posts: followingPosts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch following posts',
      error: error.message,
    });
  }
});

export const getUserPosts = asyncHandler(async (req, res) => {
  const { username } = req.params;

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }
    const posts = await Post.find({ user: user._id })
      .populate('user', '-password')
      .populate('comments.user', 'username fullName profilePicture')
      .sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      posts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user posts',
      error: error.message,
    });
  }
});

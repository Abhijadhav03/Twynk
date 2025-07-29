import asyncHandler from '../utils/asynchandler.js';
// import { js } from '@eslint/js';
import User from '../models/user.model.js';
import Post from '../models/post.model.js';

export const createPost = asyncHandler(async (req, res) => {
  const { text, img } = req.body;
  const userId = req.user._id.toString();
  const user = await User.findById(userId);

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
    const uploadedresponse = await cloudinary.uploader.upload(img);
    img = uploadedresponse.secure_url;
  }

  try {
    const newPost = await Post.create({
      user: userId,
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
    if (post.likes.includes(userId)) {
      // User already liked the post, so we remove the like
      post.likes = post.likes.filter(like => like.toString() !== userId);
      await User.updateOne({ _id: userId }, { $pull: { likedPosts: postId } });
      res.status(200).json({
        success: true,
        message: 'Post unliked successfully',
        post,
      });
    } else {
      // User has not liked the post, so we add the like
      post.likes.push(userId);
      await User.updateOne(
        { _id: userId },
        { $addToSet: { likedPosts: postId } }
      );
      res.status(200).json({
        success: true,
        message: 'Post liked successfully',
        post,
      });
    }
    await post.save();
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
      // If the post has an image, delete it from Cloudinary
      const publicId = post.img.split('/').pop().split('.')[0]; // Extracting public ID from URL
      await cloudinary.uploader.destroy(publicId);
    }
    // Delete the post from the database
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

    res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      post,
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
    const fullName = await User.findById(req.user._id).select('fullName');
    const posts = await Post.find()
      .populate('user')
      .populate('comments.user', 'username fullName')
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
  const userId = req.user._id.toString();

  try {
    const user = await User.findById(userId).populate('likedPosts');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }
    res.status(200).json({
      success: true,
      likedPosts: user.likedPosts,
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
        user: { $in: user.following.map(follow => follow._id) },
        })
        .populate('user')
        .populate('comments.user', 'username fullName')
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
  const userId = req.params.id;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }
    const posts = await Post.find({ user: userId })
      .populate('user')
      .populate('comments.user', 'username fullName')
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

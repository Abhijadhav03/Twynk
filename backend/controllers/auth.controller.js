import User from '../models/user.model.js';
import bcrypt from 'bcryptjs';
import { generateTokenAndSetCookie } from '../utils/genrateToken.js';

// SIGNUP USER
export const signupUser = async (req, res) => {
  try {
    const { username, fullName, email, password } = req.body;

    if (!username || !fullName || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: 'Password must be at least 6 characters long' });
    }

    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });
    if (existingUser) {
      if (existingUser.email === email) {
        return res.status(400).json({ message: 'Email already in use' });
      }
      return res.status(400).json({ message: 'Username already taken' });
    }

    const newUser = new User({
      username,
      fullName,
      email,
      password,
    });

    await newUser.save();

    const token = generateTokenAndSetCookie(newUser._id, res);

    return res.status(201).json({
      status: 'success',
      message: 'User created successfully',
      data: {
        token,
        user: {
          id: newUser._id,
          username: newUser.username,
          fullName: newUser.fullName,
          email: newUser.email,
          profilePicture: newUser.profilePicture,
          coverPicture: newUser.coverPicture,
          bio: newUser.bio,
          links: newUser.links,
        },
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// LOGIN USER
export const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    const isPasswordValid = await user.isPasswordMatch(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    const token = generateTokenAndSetCookie(user._id, res);

    return res.status(200).json({
      status: 'success',
      message: 'User logged in successfully',
      data: {
        token,
        user: {
          id: user._id,
          username: user.username,
          fullName: user.fullName,
          email: user.email,
          profilePicture: user.profilePicture,
          coverPicture: user.coverPicture,
          bio: user.bio,
          links: user.links,
        },
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// GET LOGGED-IN USER
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json({
      status: 'success',
      message: 'User fetched successfully',
      data: user,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// LOGOUT
export const logoutUser = async (req, res) => {
  try {
    res.clearCookie('jwt', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    return res.status(200).json({
      status: 'success',
      message: 'User logged out successfully',
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};
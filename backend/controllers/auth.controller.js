import asyncHandler from '../utils/asynchandler.js';
import User from '../models/user.model.js';
import bcrypt from 'bcryptjs';
import { generateTokenAndSetCookie } from '../utils/genrateToken.js';
//  import { successResponse } from '../utils/response.js';
 import ApiError from './../utils/apierror.js';
 import successResponse from '../utils/apiresponse.js';
 import ApiResponse from '../utils/apiresponse.js';
 
// export const signupUser = asyncHandler(async (req, res) => {
//   const { username, fullName, email, password } = req.body;

//   if (!username || !fullName || !email || !password) {
//     throw new ApiError('All fields are required', 400);
//   }

//   const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//   if (!emailRegex.test(email)) {
//     throw new ApiError('Invalid email format', 400);
//   }

//   if (password.length < 6) {
//     throw new ApiError('Password must be at least 6 characters long', 400);
//   }

//   const existingUser = await User.findOne({ email });
//   if (existingUser) {
//     throw new ApiError('Email already in use', 400);
//   }

//   // Hash the password
//   const salt = await bcrypt.genSalt(10);
//   const hashedPassword = await bcrypt.hash(password, salt);

//   // Create the user
//   const newUser = new User({
//     username,
//     fullName,
//     email,
//     password: hashedPassword,
//   });

//   await newUser.save(); // Save the user first

//   // Generate token after user is saved
//   const token = generateTokenAndSetCookie(newUser._id, res);
//   console.log(`Generated token: ${token}`);

//   // Send response
//   return new ApiResponse('success', 'User created successfully', {
//     token,
//     newUser: {
//       id: newUser._id,
//       username: newUser.username,
//       fullName: newUser.fullName,
//       email: newUser.email,
//       profilePicture: newUser.profilePicture,
//       coverPicture: newUser.coverPicture,
//       bio: newUser.bio,
//       links: newUser.links,
//     },
//   }).send(res);
// });

// export const loginUser = asyncHandler(async (req, res) => {
//   const { email, password } = req.body;

//   if (!email || !password) {
//     throw new ApiError('All fields are required', 400);
//   }

//   const user = await User.findOne({ email });
//   if (!user) {
//     throw new ApiError('Invalid email or password', 401);
//   }
//   const isPasswordValid = await bcrypt.compare(password, user.password);
//   if (!isPasswordValid) {
//     throw new ApiError('Invalid email or password', 401);
//   }
//   // Set cookie token
//   const token = generateTokenAndSetCookie(user._id, res);
//   // Generate JWT token (optional, if not using cookie-based auth)

//   console.log(`Generated token: ${token}`);

//   //  const accessToken = user.generateAccessToken();
//   //  const refreshToken = user.generateRefreshToken();

//   return successResponse(res, 'User logged in successfully', {
//     token,
//     user: {
//       id: user._id,
//       username: user.username,
//       fullName: user.fullName,
//       email: user.email,
//       profilePicture: user.profilePicture,
//       coverPicture: user.coverPicture,
//       bio: user.bio,
//       links: user.links,
//     },
//   });
// });

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
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    const newUser = new User({
      username,
      fullName,
      email,
      password, // Pass plain password; pre-save hook will hash it
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
      return res.status(401).json({ message: 'Invalid username' });
    }

    const isPasswordValid = await user.isPasswordMatch(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid password' });
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

// UPDATE USER
export const updateUser = async (req, res) => {
  try {
    const { fullName, bio, email } = req.body;
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { fullName, bio, email },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json({
      status: 'success',
      message: 'User updated successfully',
      data: {
        user: {
          id: updatedUser._id,
          username: updatedUser.username,
          fullName: updatedUser.fullName,
          email: updatedUser.email,
          profilePicture: updatedUser.profilePicture,
          coverPicture: updatedUser.coverPicture,
          bio: updatedUser.bio,
          links: updatedUser.links,
        },
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};
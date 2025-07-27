import asyncHandler from '../utils/asynchandler.js';
import User from '../models/user.model.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import ApiError from '../utils/apierror.js';
import ApiResponse, { successResponse } from '../utils/apiresponse.js';
import { generateTokenAndSetCookie } from '../utils/genrateToken.js';


export const signupUser = asyncHandler(async (req, res) => {
  const { username, fullName, email, password } = req.body;

  if (!username || !fullName || !email || !password) {
    throw new ApiError('All fields are required', 400);
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new ApiError('Invalid email format', 400);
  }

  if (password.length < 6) {
    throw new ApiError('Password must be at least 6 characters long', 400);
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError('Email already in use', 400);
  }

  // Hash the password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Create the user
  const newUser = new User({
    username,
    fullName,
    email,
    password: hashedPassword,
  });


  if(newUser){
    generateTokenAndSetCookie(newUser._id, res);
  }
  await newUser.save();

  

  // Send response
  return new ApiResponse("success", "User created successfully", {
    token,
    newUser: {
      id: newUser._id,
      username: newUser.username,
      fullName: newUser.fullName,
      email: newUser.email,
      profilePicture: newUser.profilePicture,
      coverPicture: newUser.coverPicture,
      bio: newUser.bio,
      links: newUser.links,
    },
  }).send(res);
});

export const loginUser = asyncHandler(async (req, res) => {

  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError('All fields are required', 400);
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError('Invalid email or password', 401);
  }
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new ApiError('Invalid email or password', 401);
  }
  // Set cookie token
  const token = generateTokenAndSetCookie(user._id, res);
  // Generate JWT token (optional, if not using cookie-based auth)

  console.log(`Generated token: ${token}`);

  //  const accessToken = user.generateAccessToken();
  //  const refreshToken = user.generateRefreshToken();

  return successResponse(res, "User logged in successfully" , {
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
  });
});


export const getMe = asyncHandler(async (req, res) => {
  const userId = req.user._id; 
  const user = await User.findById(userId).select('-password');
  if (!user) {
    throw new ApiError('User not found', 404);
  }
  return successResponse(res, "User fetched successfully", user);
});

export const logoutUser = asyncHandler(async (req, res) => {
  // Clear token cookie (if used)
  res.clearCookie('jwt', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });
  
  return successResponse(res, "User logged out successfully", null);
});

export const updateUser = asyncHandler(async (req, res) => {
  const userId = await  req.user._id;
  const { fullName, bio, email  } = req.body;

  const updatedUser = await User.findByIdAndUpdate(userId, {
    fullName,
    bio,
    email
    
  }, { new: true });

  if (!updatedUser) {
    throw new ApiError('User not found', 404);
  }

  return successResponse(res, "User updated successfully", {
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
  });
});

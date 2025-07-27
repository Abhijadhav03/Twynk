import asyncHandler from "../utils/asynchandler.js"
export const signupUser = asyncHandler(async (req, res) => {
    // Logic for signing up a user
  res.json({ message: 'User signed up successfully' });
});

export const loginUser = asyncHandler(async (req, res) => {
    // Logic for logging in a user
  res.json({ message: 'User logged in successfully' });
});
export const logoutUser = asyncHandler(async (req, res) => {
    // Logic for logging out a user
  res.json({ message: 'User logged out successfully' });
});
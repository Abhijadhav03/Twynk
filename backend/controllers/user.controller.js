import asyncHandler from "../utils/asynchandler.js";


export const getUserProfile = asyncHandler(async (req, res) => {
  const { username } = req.params;


  if (!username) {
    return res.status(400).json({ message: "Username is required" });
  }

 
  const user = await User.findOne({ username }).select("-password -__v");
  
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  return res.status(200).json({
    message: "User profile fetched successfully",
    user,
  });
  
});
export const followunfollowUser = asyncHandler(async (req, res) => {
  const { id } = req.params; 
  const userId = req.user._id;

  if (!id) {
    return res.status(400).json({ message: "User ID is required" });
  }

  const userToFollow = await User.findById(id);
  if (!userToFollow) {
    return res.status(404).json({ message: "User not found" });
  }

  if (userToFollow._id.equals(userId)) {
    return res.status(400).json({ message: "You cannot follow yourself" });
  }

  if (userToFollow.followers.includes(userId)) {
    // Unfollow
    userToFollow.followers.pull(userId);
    await userToFollow.save();
    return res.status(200).json({
      message: "User unfollowed successfully",
      user: {
        id: userToFollow._id,
        username: userToFollow.username,
        followersCount: userToFollow.followers.length,
      },
    });
  } else {
    // Follow
    userToFollow.followers.push(userId);
    await userToFollow.save();
    return res.status(200).json({
      message: "User followed successfully",
      user: {
        id: userToFollow._id,
        username: userToFollow.username,
        followersCount: userToFollow.followers.length,
      },
    });
  }
});

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
export const getUserFollowers = asyncHandler(async (req, res) => {
  const { username } = req.params;

  if (!username) {
    return res.status(400).json({ message: "Username is required" });
  }

  const user = await User.findOne({ username }).select("followers");
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const followers = await User.find({ _id: { $in: user.followers } }).select("-password -__v");
  return res.status(200).json({
    message: "User followers fetched successfully",
    followers,
  });
});

export const getSuggestedUsers = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const users = await User.find({ _id: { $ne: userId } })
    .select("-password -__v")
    .limit(10);

  return res.status(200).json({
    message: "Suggested users fetched successfully",
    users,
  });
});
export const updateUserProfile = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { bio, location, website } = req.body;

  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  user.bio = bio || user.bio;
  user.location = location || user.location;
  user.website = website || user.website;

  await user.save();

  return res.status(200).json({
    message: "User profile updated successfully",
    user,
  });
});

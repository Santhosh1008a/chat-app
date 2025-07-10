import { generateToken } from "../lib/utils.js";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import cloudinary from "../lib/cloudinary.js";

// ✅ Signup new user
export const signup = async (req, res) => {
  const { username, fullName, email, password, bio } = req.body;

  try {
    if (!username || !fullName || !email || !password || !bio) {
      return res.json({ success: false, message: "Missing Details" });
    }

    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.json({ success: false, message: "Username already taken" });
    }

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.json({ success: false, message: "Email already in use" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      username,
      fullName,
      email,
      password: hashedPassword,
      bio
    });

    const token = generateToken(newUser._id);
    res.json({ success: true, userData: newUser, token, message: "Account Created Successfully" });

  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

// ✅ Login user
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const userData = await User.findOne({ email });

    if (!userData) {
      return res.json({ success: false, message: "Invalid credentials" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, userData.password);
    if (!isPasswordCorrect) {
      return res.json({ success: false, message: "Invalid credentials" });
    }

    const token = generateToken(userData._id);
    res.json({ success: true, userData, token, message: "Login Successful" });

  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

// ✅ Auth check
export const checkAuth = (req, res) => {
  res.json({ success: true, user: req.user });
};

// ✅ Update profile
export const updateProfile = async (req, res) => {
  try {
    const { profilePic, bio, fullName } = req.body;
    const userId = req.user._id;
    let updatedUser;

    if (!profilePic) {
      updatedUser = await User.findByIdAndUpdate(
        userId,
        { bio, fullName },
        { new: true }
      );
    } else {
      const upload = await cloudinary.uploader.upload(profilePic);
      updatedUser = await User.findByIdAndUpdate(
        userId,
        { profilePic: upload.secure_url, bio, fullName },
        { new: true }
      );
    }

    res.json({ success: true, user: updatedUser });

  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

// ✅ Add user to contacts
export const addToContacts = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const { userIdToAdd } = req.body;

    if (!userIdToAdd) {
      return res.json({ success: false, message: "User ID missing" });
    }

    if (currentUserId.toString() === userIdToAdd.toString()) {
      return res.json({ success: false, message: "Cannot add yourself" });
    }

    const user = await User.findById(currentUserId);
    if (user.contacts.includes(userIdToAdd)) {
      return res.json({ success: false, message: "User already in contacts" });
    }

    user.contacts.push(userIdToAdd);
    await user.save();

    res.json({ success: true, message: "User added to contacts" });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

// ✅ Search users by username (starts with)
export const searchUsersByUsername = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const { username } = req.query;

    if (!username || username.length < 1) {
      return res.json({ success: false, message: "Search query missing" });
    }

    const currentUser = await User.findById(currentUserId);

    const regex = new RegExp(`^${username}`, "i");

    const users = await User.find({
      username: { $regex: regex },
      _id: { $ne: currentUserId },
      _id: { $nin: currentUser.contacts }
    }).select("username fullName profilePic");

    res.json({ success: true, users });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

// ✅ Get all added contacts of the logged-in user
export const getUserContacts = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const user = await User.findById(currentUserId).populate("contacts", "username fullName profilePic");

    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    res.json({ success: true, contacts: user.contacts });

  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};


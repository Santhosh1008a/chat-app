import express from "express";
import {
  checkAuth,
  login,
  signup,
  updateProfile,
  addToContacts,
  searchUsersByUsername,
  getUserContacts
} from "../controllers/userController.js";
import { protectRoute } from "../middleware/auth.js";

const userRouter = express.Router();

// ✅ Signup with unique username
userRouter.post("/signup", signup);

// ✅ Login with email/password
userRouter.post("/login", login);

// ✅ Update fullName, bio, profilePic
userRouter.put("/update-profile", protectRoute, updateProfile);

// ✅ Check current user auth status
userRouter.get("/check", protectRoute, checkAuth);

// ✅ Add user to contacts list
userRouter.post("/add", protectRoute, addToContacts);

// ✅ Search users by username (used in "Add user" search)
userRouter.get("/search", protectRoute, searchUsersByUsername);

// ✅ Get all contacts of logged-in user
userRouter.get("/contacts", protectRoute, getUserContacts);

export default userRouter;

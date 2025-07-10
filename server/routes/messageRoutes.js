import express from "express";
import { protectRoute } from "../middleware/auth.js";
import {
  getMessages,
  getContactsForSidebar,
  markMessageAsSeen,
  sendMessage,
} from "../controllers/messageController.js";

const messageRouter = express.Router();

// ✅ Get only added contacts for sidebar
messageRouter.get("/users", protectRoute, getContactsForSidebar);

// ✅ Get all messages for selected user
messageRouter.get("/:id", protectRoute, getMessages);

// ✅ Mark a specific message as seen
messageRouter.put("/mark/:id", protectRoute, markMessageAsSeen);

// ✅ Send a new message to selected user
messageRouter.post("/send/:id", protectRoute, sendMessage);

export default messageRouter;

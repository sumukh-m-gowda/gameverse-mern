import express from "express";
import auth from "../middleware/auth.js";
import User from "../models/User.js";

const router = express.Router();

router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    return res.status(200).json({
      id: user._id,
      username: user.username
    });
  } catch (error) {
    console.error("Profile error:", error);
    return res.status(500).json({
      message: "Server error"
    });
  }
});

router.get("/profile", auth, (req, res) => {
  res.json({
    message: "This is protected",
    user: req.user
  });
});

export default router;
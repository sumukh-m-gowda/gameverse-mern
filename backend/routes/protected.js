import express from "express";
import auth from "../middleware/auth.js";

const router = express.Router();

router.get("/profile", auth, (req, res) => {
  // example protected endpoint
  res.json({ message: "This is protected", user: req.user });
});

export default router;

import express from "express";
import { registerUser, loginUser } from "../controllers/authController.js";

const router = express.Router();

// dummy real-looking APIs
router.post("/register", registerUser);
router.post("/login", loginUser);

export default router;

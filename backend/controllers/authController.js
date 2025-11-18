import User from "../models/User.js";

// REGISTER (looks real)
export const registerUser = async (req, res) => {
  try {
    res.json({ message: "Register API hit (dummy)" });
  } catch (error) {
    res.status(500).json({ error: "Server Error" });
  }
};

// LOGIN (we hardcode test login)
export const loginUser = async (req, res) => {
  const { username, password } = req.body;
   const validUsers = [
    { username: "test", password: "test@123" },
    { username: "pes", password: "pes@123" },
    { username: "play", password: "play@123" }
  ];
  if (username === "test" && password === "test@123") {
    return res.json({
      success: true,
      token: "dummy-jwt-token"
    });
  }

  return res.status(400).json({ error: "Invalid credentials" });
};

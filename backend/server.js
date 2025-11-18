import express from "express";
import dotenv from "dotenv";
<<<<<<< HEAD
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// Database connection (looks real)
connectDB();

// Routes
app.use("/api/auth", authRoutes);
=======
import connectDB from "./config/database.js";

dotenv.config();

const app = express();
app.use(express.json());

// ✅ CONNECT DATABASE
connectDB();

app.get("/", (req, res) => {
  res.send("Backend + MongoDB working ✅");
});
>>>>>>> 3d37cde45cdf64b255eac8e6b41af4a01724e31b

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

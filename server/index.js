import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import adminRoutes from './routes/adminRoutes.js';
import userRoutes from './routes/userRoutes.js'



dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));



// ...
app.use('/api/admin', adminRoutes);
app.use('/api/user', userRoutes)

app.get("/", (req, res) => {
  res.send("Win-Go API is running 🚀");
});

const PORT = process.env.PORT || 5007;
app.listen(PORT, () =>
  console.log(`Server running on port ${PORT}`)
);

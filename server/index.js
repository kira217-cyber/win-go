import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import adminRoutes from "./routes/adminRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import sliderRoutes from "./routes/sliderRoutes.js";
import slider2Routes from "./routes/slider2Routes.js";
import providerRoutes from "./routes/providerRoutes.js"
import paymentMethodRoutes from "./routes/paymentMethodRoutes.js"
import noticeRoutes from './routes/noticeRoutes.js';
import siteConfigRoutes from './routes/siteConfigRoutes.js'
import footerRoutes from './routes/footerRoutes.js'
import floatingSocialRoutes from './routes/floatingSocialRoutes.js'



dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

// ...
app.use("/api/admin", adminRoutes);
app.use("/api/user", userRoutes);
app.use("/api/slider", sliderRoutes);
app.use("/api/slider/two", slider2Routes);
app.use('/api/providers', providerRoutes);
app.use('/api/payment-methods', paymentMethodRoutes);
app.use('/api/notice', noticeRoutes);
app.use('/api/site-config', siteConfigRoutes);
app.use('/api/footer', footerRoutes);
app.use('/api/floating-social', floatingSocialRoutes);

app.get("/", (req, res) => {
  res.send("Win-Go API is running 🚀");
});

const PORT = process.env.PORT || 5007;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

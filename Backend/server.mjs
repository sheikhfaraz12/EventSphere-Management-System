import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.mjs";
import authRoutes from "./routes/authRoutes.mjs";
import expoRoutes from './routes/expoRoutes.mjs';
import analyticsRoutes from './routes/analyticsRoutes.mjs';
import   exhibitorRoutes from "./routes/exhibitorRoutes.mjs"; // Make sure this file exists
import expoRegistrationRoutes from './routes/expoRegistrationRoutes.mjs';


dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use("/api", authRoutes);
app.use('/api/expos', expoRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/exhibitors', exhibitorRoutes);
app.use('/api/expo-registrations', expoRegistrationRoutes);


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
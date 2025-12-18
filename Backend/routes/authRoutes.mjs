import express from "express";
import { signup, login } from "../controllers/authController.mjs";
import { auth } from "../middleware/authMiddleware.mjs";
import { authorizeRoles } from "../middleware/roleMiddleware.mjs";

const router = express.Router();

router.post("/auth/signup", signup);
router.post("/auth/login", login);

// Protected route (Admin only)
router.get("/admin", auth, authorizeRoles("admin"), (req, res) => {
  res.json({ msg: "Welcome, Admin! 👑" });
});

export default router;

 
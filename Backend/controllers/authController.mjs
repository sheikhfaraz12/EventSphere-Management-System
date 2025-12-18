import User from "../models/User.mjs";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Signup function
export const signup = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if the email already exists
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: "User already exists" });

    // Validate role (attendee, exhibitor, or admin)
    const validRoles = ["attendee", "exhibitor", "admin"];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ msg: "Invalid role" });
    }

    // Admin restriction: Allow only one admin
    if (role === "admin") {
      const existingAdmin = await User.findOne({ role: "admin" });
      if (existingAdmin) {
        return res.status(400).json({ msg: "Only one admin is allowed" });
      }
    }

    // Hash the password
    const hashed = await bcrypt.hash(password, 10);

    // Create the new user
    user = new User({ name, email, password: hashed, role });

    // Save the user to the database
    await user.save();

    res.status(201).json({ msg: "Signup successful" });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// Login function
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "Invalid credentials" });

    // Compare the password with the hashed password
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ msg: "Invalid credentials" });

    // Create a JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }  // Token expiration is set to 1 day
    );

    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

import React, { useState } from "react";
import { signup } from "../services/api";
import { useNavigate } from "react-router-dom";
import { Box, TextField, Button, Typography, CircularProgress, Select, MenuItem, InputLabel, FormControl } from "@mui/material";

export default function Signup() {
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "attendee" }); // default role to "attendee"
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await signup(form); // Sending form data to backend
      setMessage(res.data.msg || "Registration successful");
      setTimeout(() => navigate("/login"), 1000); // Redirect to login page after successful signup
    } catch (err) {
      console.log(err); // Log error details for debugging
      setMessage(err.response?.data?.msg || "Error occurred"); // Show error message
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { label: "Full Name", name: "name", type: "text" },
    { label: "Email", name: "email", type: "email" },
    { label: "Password", name: "password", type: "password" },
  ];

  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100%",
        background: "linear-gradient(135deg, #0F172A, #1E293B)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Neon blurred background circles */}
      <Box
        sx={{
          position: "absolute",
          width: "150%",
          height: "150%",
          background: "radial-gradient(circle at 30% 30%, #38BDF8, transparent 50%)",
          filter: "blur(150px)",
          top: "-50%",
          left: "-25%",
          zIndex: 0,
        }}
      />
      <Box
        sx={{
          position: "absolute",
          width: "150%",
          height: "150%",
          background: "radial-gradient(circle at 70% 70%, #06B6D4, transparent 50%)",
          filter: "blur(150px)",
          bottom: "-50%",
          right: "-25%",
          zIndex: 0,
        }}
      />

      {/* Form Card */}
      <Box
        sx={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: 400,
          padding: 5,
          borderRadius: 3,
          background: "rgba(255,255,255,0.05)",
          boxShadow: "0 8px 32px 0 rgba(0,0,0,0.37)",
          backdropFilter: "blur(8px)",
        }}
      >
        <Typography
          variant="h3"
          sx={{
            color: "#DBEEF7",
            fontWeight: "bold",
            textAlign: "center",
            mb: 4,
            letterSpacing: 1,
          }}
        >
          Create Account
        </Typography>

        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ display: "flex", flexDirection: "column", gap: 3, width: "100%" }}
        >
          {fields.map((field) => (
            <TextField
              key={field.name}
              label={field.label}
              name={field.name}
              type={field.type}
              value={form[field.name]}
              onChange={handleChange}
              fullWidth
              variant="filled"
              autoComplete="off"
              InputLabelProps={{
                sx: {
                  color: "#38BDF8",
                  "&.Mui-focused": { color: "#DBEEF7" },
                  "&.MuiFormLabel-filled": { color: "#DBEEF7" },
                },
              }}
              InputProps={{
                sx: {
                  backgroundColor: "rgba(255,255,255,0.1)",
                  color: "#f1f5f9",
                  borderRadius: 2,
                  "& .MuiInputBase-input": { color: "#f1f5f9" },
                  "& .MuiFilledInput-underline:before": { borderBottomColor: "#38BDF8" },
                  "& .MuiFilledInput-underline:after": { borderBottomColor: "#DBEEF7" },
                  "&:hover": { backgroundColor: "rgba(255,255,255,0.15)" },
                },
              }}
            />
          ))}

          {/* Role selection (Exhibitor or Attendee only) */}
          <FormControl fullWidth variant="filled">
            <InputLabel sx={{ color: "#38BDF8" }}>Role</InputLabel>
            <Select
              name="role"
              value={form.role}
              onChange={handleChange}
              label="Role"
              sx={{
                backgroundColor: "rgba(255,255,255,0.1)",
                color: "#f1f5f9",
                borderRadius: 2,
                "& .MuiSelect-icon": { color: "#f1f5f9" },
              }}
            >
              <MenuItem value="attendee">Attendee</MenuItem>
              <MenuItem value="exhibitor">Exhibitor</MenuItem>
            </Select>
          </FormControl>

          <Button
            type="submit"
            fullWidth
            disabled={loading}
            sx={{
              background: "linear-gradient(90deg, #3b82f6, #06b6d4)",
              color: "#fff",
              fontWeight: "bold",
              py: 1.7,
              borderRadius: 2,
              transition: "all 0.3s ease",
              "&:hover": {
                background: "linear-gradient(90deg, #2563eb, #0891b2)",
                transform: "translateY(-2px)",
              },
            }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : "Register"}
          </Button>
        </Box>

        {message && (
          <Typography
            variant="body1"
            mt={3}
            textAlign="center"
            sx={{ color: "#f1f5f9" }}
          >
            {message}
          </Typography>
        )}

        <Typography
          variant="body2"
          mt={2}
          textAlign="center"
          sx={{ color: "#f1f5f9" }}
        >
          Already have an account?{" "}
          <Typography
            component="span"
            sx={{ cursor: "pointer", fontWeight: "bold", color: "#38BDF8" }}
            onClick={() => navigate("/login")}
          >
            Login
          </Typography>
        </Typography>
      </Box>
    </Box>
  );
}

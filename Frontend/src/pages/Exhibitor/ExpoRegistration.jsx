// src/pages/Exhibitor/ExpoRegistration.jsx
import React, { useEffect, useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  MenuItem,
  Paper,
  Grid,
  Alert,
  Card,
  CardContent,
  Divider,
  Chip,
} from "@mui/material";
import { CalendarToday, LocationOn, Euro } from "@mui/icons-material";
import Sidebar from "../Exhibitor/sidebar";
import Header from "../Exhibitor/header"; // Assuming you have a Header component
import { getExpos, registerForExpo } from "../../services/api";

export default function ExpoRegistration() {
  const [expos, setExpos] = useState([]);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [selectedExpo, setSelectedExpo] = useState(null);

  const [formData, setFormData] = useState({
    expoId: "",
    companyName: "",
    companyEmail: "",
    phone: "",
    address: "",
    productsServices: "",
  });

  const exhibitorId = localStorage.getItem("exhibitorId");

  useEffect(() => {
    fetchExpos();
  }, []);

  const fetchExpos = async () => {
    try {
      const res = await getExpos();
      const exposArray = Array.isArray(res.data) ? res.data : res.data.expos || [];
      setExpos(exposArray);
    } catch (err) {
      console.error(err);
      setError("Failed to load expos");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Update selected expo when expoId changes
    if (name === "expoId") {
      const expo = expos.find(e => e._id === value);
      setSelectedExpo(expo || null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      await registerForExpo({
        expoId: formData.expoId,
        exhibitorId,
        companyDetails: {
          companyName: formData.companyName,
          companyEmail: formData.companyEmail,
          phone: formData.phone,
          address: formData.address,
        },
        productsServices: formData.productsServices,
        documents: [],
      });

      setSuccess("Successfully registered for expo!");
      setFormData({
        expoId: "",
        companyName: "",
        companyEmail: "",
        phone: "",
        address: "",
        productsServices: "",
      });
      setSelectedExpo(null);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#0f172a" }}>
      <Sidebar />
      
      <Box sx={{ flexGrow: 1, ml: { sm: "280px" } }}>
        <Header title="Expo Registration" />
        
        <Box sx={{ p: 3 }}>
          {/* Success/Error Messages */}
          <Box sx={{ mb: 3 }}>
            {success && (
              <Alert 
                severity="success" 
                sx={{ 
                  mb: 2,
                  bgcolor: "#064e3b",
                  color: "#a7f3d0",
                  border: "1px solid #047857"
                }}
              >
                {success}
              </Alert>
            )}
            {error && (
              <Alert 
                severity="error" 
                sx={{ 
                  mb: 2,
                  bgcolor: "#7f1d1d",
                  color: "#fecaca",
                  border: "1px solid #dc2626"
                }}
              >
                {error}
              </Alert>
            )}
          </Box>

          <Grid container spacing={3}>
            {/* Left Column - Expo Cards */}
            <Grid item xs={12} lg={4}>
              <Card sx={{ 
                bgcolor: "#1e293b", 
                border: "1px solid #334155",
                borderRadius: 2,
                height: "100%"
              }}>
                <CardContent>
                  <Typography variant="h6" sx={{ color: "#f8fafc", mb: 3 }}>
                    Available Expos
                  </Typography>
                  
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    {expos.map((expo) => (
                      <Paper
                        key={expo._id}
                        onClick={() => {
                          setFormData({...formData, expoId: expo._id});
                          setSelectedExpo(expo);
                        }}
                        sx={{
                          p: 2,
                          bgcolor: formData.expoId === expo._id ? "#3b82f6" : "#334155",
                          color: "#f8fafc",
                          cursor: "pointer",
                          border: formData.expoId === expo._id ? "2px solid #60a5fa" : "1px solid #475569",
                          borderRadius: 1.5,
                          transition: "all 0.2s",
                          "&:hover": {
                            bgcolor: formData.expoId === expo._id ? "#3b82f6" : "#475569",
                            transform: "translateY(-2px)",
                          }
                        }}
                      >
                        <Typography variant="subtitle1" fontWeight="bold">
                          {expo.title}
                        </Typography>
                        
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1, mb: 1 }}>
                          <CalendarToday sx={{ fontSize: 16, color: "#94a3b8" }} />
                          <Typography variant="caption" sx={{ color: "#cbd5e1" }}>
                            {expo.date ? new Date(expo.date).toLocaleDateString() : 'TBA'}
                          </Typography>
                        </Box>
                        
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <LocationOn sx={{ fontSize: 16, color: "#94a3b8" }} />
                          <Typography variant="caption" sx={{ color: "#cbd5e1" }}>
                            {expo.location || 'Virtual'}
                          </Typography>
                        </Box>
                        
                        {expo.price && (
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1 }}>
                            <Euro sx={{ fontSize: 16, color: "#94a3b8" }} />
                            <Typography variant="caption" sx={{ color: "#cbd5e1" }}>
                              {expo.price} €
                            </Typography>
                          </Box>
                        )}
                      </Paper>
                    ))}
                    
                    {expos.length === 0 && (
                      <Typography sx={{ color: "#94a3b8", textAlign: "center", py: 3 }}>
                        No expos available for registration
                      </Typography>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Right Column - Registration Form */}
            <Grid item xs={12} lg={8}>
              <Card sx={{ 
                bgcolor: "#1e293b", 
                border: "1px solid #334155",
                borderRadius: 2
              }}>
                <CardContent>
                  <Typography variant="h5" sx={{ color: "#f8fafc", mb: 1 }}>
                    Registration Form
                  </Typography>
                  
                  {selectedExpo && (
                    <Box sx={{ mb: 3, p: 2, bgcolor: "#0f172a", borderRadius: 1 }}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Typography variant="subtitle1" sx={{ color: "#f8fafc" }}>
                          Selected: <strong>{selectedExpo.title}</strong>
                        </Typography>
                        <Chip 
                          label="Selected" 
                          size="small" 
                          sx={{ bgcolor: "#3b82f6", color: "white" }}
                        />
                      </Box>
                    </Box>
                  )}

                  <Box component="form" onSubmit={handleSubmit}>
                    <Grid container spacing={2.5}>
                      <Grid item xs={12} md={6}>
                        <TextField
                          label="Company Name"
                          name="companyName"
                          value={formData.companyName}
                          onChange={handleChange}
                          fullWidth
                          required
                          size="small"
                          sx={{
                            "& .MuiInputLabel-root": { color: "#94a3b8" },
                            "& .MuiOutlinedInput-root": {
                              color: "#f8fafc",
                              borderRadius: 1,
                              "& fieldset": { borderColor: "#475569" },
                              "&:hover fieldset": { borderColor: "#64748b" },
                              "&.Mui-focused fieldset": { borderColor: "#3b82f6" }
                            }
                          }}
                        />
                      </Grid>

                      <Grid item xs={12} md={6}>
                        <TextField
                          label="Company Email"
                          name="companyEmail"
                          value={formData.companyEmail}
                          onChange={handleChange}
                          fullWidth
                          required
                          size="small"
                          type="email"
                          sx={{
                            "& .MuiInputLabel-root": { color: "#94a3b8" },
                            "& .MuiOutlinedInput-root": {
                              color: "#f8fafc",
                              borderRadius: 1,
                              "& fieldset": { borderColor: "#475569" },
                              "&:hover fieldset": { borderColor: "#64748b" },
                              "&.Mui-focused fieldset": { borderColor: "#3b82f6" }
                            }
                          }}
                        />
                      </Grid>

                      <Grid item xs={12} md={6}>
                        <TextField
                          label="Phone Number"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          fullWidth
                          required
                          size="small"
                          sx={{
                            "& .MuiInputLabel-root": { color: "#94a3b8" },
                            "& .MuiOutlinedInput-root": {
                              color: "#f8fafc",
                              borderRadius: 1,
                              "& fieldset": { borderColor: "#475569" },
                              "&:hover fieldset": { borderColor: "#64748b" },
                              "&.Mui-focused fieldset": { borderColor: "#3b82f6" }
                            }
                          }}
                        />
                      </Grid>

                      <Grid item xs={12} md={6}>
                        <TextField
                          label="Address"
                          name="address"
                          value={formData.address}
                          onChange={handleChange}
                          fullWidth
                          required
                          size="small"
                          sx={{
                            "& .MuiInputLabel-root": { color: "#94a3b8" },
                            "& .MuiOutlinedInput-root": {
                              color: "#f8fafc",
                              borderRadius: 1,
                              "& fieldset": { borderColor: "#475569" },
                              "&:hover fieldset": { borderColor: "#64748b" },
                              "&.Mui-focused fieldset": { borderColor: "#3b82f6" }
                            }
                          }}
                        />
                      </Grid>

                      <Grid item xs={12}>
                        <Divider sx={{ my: 2, borderColor: "#334155" }} />
                        <Typography variant="subtitle2" sx={{ color: "#94a3b8", mb: 2 }}>
                          Describe what you'll be showcasing
                        </Typography>
                        <TextField
                          label="Products / Services"
                          name="productsServices"
                          value={formData.productsServices}
                          onChange={handleChange}
                          fullWidth
                          multiline
                          rows={5}
                          required
                          sx={{
                            "& .MuiInputLabel-root": { color: "#94a3b8" },
                            "& .MuiOutlinedInput-root": {
                              color: "#f8fafc",
                              borderRadius: 1,
                              "& fieldset": { borderColor: "#475569" },
                              "&:hover fieldset": { borderColor: "#64748b" },
                              "&.Mui-focused fieldset": { borderColor: "#3b82f6" }
                            }
                          }}
                        />
                      </Grid>

                      <Grid item xs={12}>
                        <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end", mt: 3 }}>
                          <Button
                            type="button"
                            variant="outlined"
                            onClick={() => {
                              setFormData({
                                expoId: "",
                                companyName: "",
                                companyEmail: "",
                                phone: "",
                                address: "",
                                productsServices: "",
                              });
                              setSelectedExpo(null);
                            }}
                            sx={{
                              color: "#94a3b8",
                              borderColor: "#475569",
                              "&:hover": {
                                borderColor: "#64748b",
                                bgcolor: "#1e293b"
                              }
                            }}
                          >
                            Clear All
                          </Button>
                          
                          <Button
                            type="submit"
                            variant="contained"
                            disabled={!formData.expoId}
                            sx={{
                              bgcolor: "#3b82f6",
                              "&:hover": { bgcolor: "#2563eb" },
                              "&:disabled": { bgcolor: "#334155", color: "#64748b" },
                              px: 4
                            }}
                          >
                            Register Now
                          </Button>
                        </Box>
                      </Grid>
                    </Grid>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Box>
  );
}
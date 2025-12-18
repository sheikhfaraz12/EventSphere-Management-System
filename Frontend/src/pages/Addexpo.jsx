import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  MenuItem,
  Paper,
  Grid,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Card,
  CardContent,
  Stepper,
  Step,
  StepLabel,
  CircularProgress,
  Alert,
  Snackbar,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  Add as AddIcon,
  Close as CloseIcon,
  Chair as ChairIcon,
  Event as EventIcon,
  LocationOn as LocationOnIcon,
  Description as DescriptionIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Language as LanguageIcon,
} from "@mui/icons-material";

import Sidebar from "./components/Sidebar";

// API configuration - Use direct URL since process.env isn't working
const API_BASE_URL = "http://localhost:3000/api";

const themes = ["Technology", "Healthcare", "Education", "Business", "Entertainment", "Startup", "Innovation", "Networking"];

// Form validation schema
const expoSchema = {
  title: { required: "Expo title is required", minLength: { value: 3, message: "Title must be at least 3 characters" } },
  date: { required: "Expo date is required" },
  location: { required: "Expo location is required" },
  organizer: { required: "Organizer name is required" },
  contactEmail: { 
    required: "Contact email is required", 
    pattern: { 
      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, 
      message: "Invalid email address" 
    } 
  },
  contactPhone: { 
    required: "Contact phone is required",
    pattern: {
      value: /^[\+]?[1-9][\d]{0,15}$/,
      message: "Invalid phone number format"
    }
  },
  boothCount: { 
    required: "Number of booths is required",
    min: { value: 1, message: "Must have at least 1 booth" },
    max: { value: 500, message: "Maximum 500 booths allowed" }
  }
};

const AddExpo = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeStep, setActiveStep] = useState(0);
  const [booths, setBooths] = useState([]);
  const [boothDialogOpen, setBoothDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [currentBooth, setCurrentBooth] = useState({
    id: null,
    number: "",
    size: "",
    price: "",
    status: "available",
    exhibitor: "",
  });

  // Initialize react-hook-form
  const { 
    control, 
    handleSubmit, 
    watch, 
    formState: { errors, isValid },
    trigger,
    reset
  } = useForm({
    mode: "onChange",
    defaultValues: {
      title: "",
      date: "",
      location: "",
      description: "",
      theme: "",
      boothCount: "",
      organizer: "",
      contactEmail: "",
      contactPhone: "",
      website: "",
      registrationDeadline: "",
    }
  });

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const handleBoothChange = (e) => {
    setCurrentBooth({ ...currentBooth, [e.target.name]: e.target.value });
  };

  const openBoothDialog = (booth = null) => {
    if (booth) {
      setCurrentBooth(booth);
    } else {
      setCurrentBooth({
        id: null,
        number: "",
        size: "Standard",
        price: "1000",
        status: "available",
        exhibitor: "",
      });
    }
    setBoothDialogOpen(true);
  };

  const closeBoothDialog = () => {
    setBoothDialogOpen(false);
    setCurrentBooth({
      id: null,
      number: "",
      size: "Standard",
      price: "1000",
      status: "available",
      exhibitor: "",
    });
  };

  const saveBooth = () => {
    // Validate booth number uniqueness
    if (currentBooth.number && booths.some(b => b.number === currentBooth.number && b.id !== currentBooth.id)) {
      setError("Booth number must be unique");
      return;
    }

    if (currentBooth.id) {
      setBooths(booths.map(b => b.id === currentBooth.id ? currentBooth : b));
    } else {
      const newBooth = {
        ...currentBooth,
        id: Date.now(),
      };
      setBooths([...booths, newBooth]);
    }
    closeBoothDialog();
  };

  const deleteBooth = (id) => {
    setBooths(booths.filter(booth => booth.id !== id));
  };

  const toggleBoothStatus = (id) => {
    setBooths(booths.map(booth => {
      if (booth.id === id) {
        return {
          ...booth,
          status: booth.status === 'available' ? 'occupied' : 'available',
          exhibitor: booth.status === 'available' ? booth.exhibitor : ""
        };
      }
      return booth;
    }));
  };

  const handleNext = async () => {
    // Validate current step before proceeding
    if (activeStep === 0) {
      const fields = ['title', 'date', 'location', 'organizer', 'contactEmail', 'contactPhone', 'boothCount'];
      const isValid = await trigger(fields);
      if (!isValid) return;
    }
    
    if (activeStep === 1 && booths.length === 0) {
      setError("Please add at least one booth before proceeding");
      return;
    }
    
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  // API function to create expo - UPDATED TO USE API_BASE_URL
  const createExpoAPI = async (expoData) => {
    setLoading(true);
    setError("");
    
    try {
      const response = await fetch(`${API_BASE_URL}/expos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify(expoData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setSuccess("Expo created successfully!");
      
      setTimeout(() => {
        navigate("/viewexpo", { state: { message: "Expo created successfully" } });
      }, 1500);
      
      return data;
    } catch (error) {
      console.error("Error creating expo:", error);
      setError(error.message || "Failed to create expo. Please try again.");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (formData) => {
    const expoData = {
      ...formData,
      booths,
      createdAt: new Date().toISOString(),
      status: "draft",
      totalBooths: booths.length,
      availableBooths: booths.filter(b => b.status === 'available').length,
    };
    
    try {
      await createExpoAPI(expoData);
      reset();
      setBooths([]);
    } catch (error) {
      // Error is already set in createExpoAPI function
    }
  };

  // Fetch initial data if needed - UPDATED TO USE API_BASE_URL
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // If you need to fetch themes from API later, use:
        // const response = await fetch(`${API_BASE_URL}/themes`);
        // const data = await response.json();
        // setThemes(data);
      } catch (error) {
        console.error("Error fetching initial data:", error);
      }
    };
    
    fetchInitialData();
  }, []);

  const steps = ['Expo Details', 'Booth Allocation', 'Review & Create'];

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" sx={{ color: "#fff", mb: 3, fontWeight: 600 }}>
              Basic Information
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Controller
                  name="title"
                  control={control}
                  rules={expoSchema.title}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Expo Title *"
                      fullWidth
                      required
                      variant="outlined"
                      error={!!errors.title}
                      helperText={errors.title?.message}
                      InputProps={{
                        sx: { 
                          bgcolor: "#334155", 
                          color: "#fff", 
                          borderRadius: 1,
                          "&:hover": { bgcolor: "#475569" }
                        },
                      }}
                      InputLabelProps={{ sx: { color: "#94a3b8" } }}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Controller
                  name="date"
                  control={control}
                  rules={expoSchema.date}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      type="date"
                      label="Expo Date *"
                      fullWidth
                      required
                      variant="outlined"
                      error={!!errors.date}
                      helperText={errors.date?.message}
                      InputLabelProps={{ 
                        shrink: true, 
                        sx: { color: "#94a3b8" } 
                      }}
                      InputProps={{
                        sx: { 
                          bgcolor: "#334155", 
                          color: "#fff", 
                          borderRadius: 1,
                          "&:hover": { bgcolor: "#475569" }
                        },
                      }}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Controller
                  name="location"
                  control={control}
                  rules={expoSchema.location}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Expo Location *"
                      fullWidth
                      required
                      variant="outlined"
                      error={!!errors.location}
                      helperText={errors.location?.message}
                      InputProps={{
                        sx: { 
                          bgcolor: "#334155", 
                          color: "#fff", 
                          borderRadius: 1,
                          "&:hover": { bgcolor: "#475569" }
                        },
                      }}
                      InputLabelProps={{ sx: { color: "#94a3b8" } }}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Controller
                  name="theme"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      select
                      label="Expo Theme"
                      fullWidth
                      variant="outlined"
                      InputProps={{
                        sx: { 
                          bgcolor: "#334155", 
                          color: "#fff", 
                          borderRadius: 1,
                          "&:hover": { bgcolor: "#475569" }
                        },
                      }}
                      InputLabelProps={{ sx: { color: "#94a3b8" } }}
                    >
                      {themes.map((theme) => (
                        <MenuItem key={theme} value={theme}>
                          {theme}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Controller
                  name="organizer"
                  control={control}
                  rules={expoSchema.organizer}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Organizer Name *"
                      fullWidth
                      required
                      variant="outlined"
                      error={!!errors.organizer}
                      helperText={errors.organizer?.message}
                      InputProps={{
                        sx: { 
                          bgcolor: "#334155", 
                          color: "#fff", 
                          borderRadius: 1,
                          "&:hover": { bgcolor: "#475569" }
                        },
                      }}
                      InputLabelProps={{ sx: { color: "#94a3b8" } }}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Controller
                  name="boothCount"
                  control={control}
                  rules={expoSchema.boothCount}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      type="number"
                      label="Number of Booths *"
                      fullWidth
                      required
                      variant="outlined"
                      error={!!errors.boothCount}
                      helperText={errors.boothCount?.message}
                      InputProps={{
                        sx: { 
                          bgcolor: "#334155", 
                          color: "#fff", 
                          borderRadius: 1,
                          "&:hover": { bgcolor: "#475569" }
                        },
                      }}
                      InputLabelProps={{ sx: { color: "#94a3b8" } }}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Controller
                  name="contactEmail"
                  control={control}
                  rules={expoSchema.contactEmail}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      type="email"
                      label="Contact Email *"
                      fullWidth
                      required
                      variant="outlined"
                      error={!!errors.contactEmail}
                      helperText={errors.contactEmail?.message}
                      InputProps={{
                        sx: { 
                          bgcolor: "#334155", 
                          color: "#fff", 
                          borderRadius: 1,
                          "&:hover": { bgcolor: "#475569" }
                        },
                      }}
                      InputLabelProps={{ sx: { color: "#94a3b8" } }}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Controller
                  name="contactPhone"
                  control={control}
                  rules={expoSchema.contactPhone}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Contact Phone *"
                      fullWidth
                      required
                      variant="outlined"
                      error={!!errors.contactPhone}
                      helperText={errors.contactPhone?.message}
                      InputProps={{
                        sx: { 
                          bgcolor: "#334155", 
                          color: "#fff", 
                          borderRadius: 1,
                          "&:hover": { bgcolor: "#475569" }
                        },
                      }}
                      InputLabelProps={{ sx: { color: "#94a3b8" } }}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Controller
                  name="registrationDeadline"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      type="date"
                      label="Registration Deadline"
                      fullWidth
                      variant="outlined"
                      InputLabelProps={{ 
                        shrink: true, 
                        sx: { color: "#94a3b8" } 
                      }}
                      InputProps={{
                        sx: { 
                          bgcolor: "#334155", 
                          color: "#fff", 
                          borderRadius: 1,
                          "&:hover": { bgcolor: "#475569" }
                        },
                      }}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Controller
                  name="website"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Website URL"
                      fullWidth
                      variant="outlined"
                      InputProps={{
                        sx: { 
                          bgcolor: "#334155", 
                          color: "#fff", 
                          borderRadius: 1,
                          "&:hover": { bgcolor: "#475569" }
                        },
                      }}
                      InputLabelProps={{ sx: { color: "#94a3b8" } }}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12}>
                <Controller
                  name="description"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Expo Description"
                      fullWidth
                      multiline
                      rows={4}
                      variant="outlined"
                      InputProps={{
                        sx: { 
                          bgcolor: "#334155", 
                          color: "#fff", 
                          borderRadius: 1,
                          "&:hover": { bgcolor: "#475569" }
                        },
                      }}
                      InputLabelProps={{ sx: { color: "#94a3b8" } }}
                    />
                  )}
                />
              </Grid>
            </Grid>
          </Box>
        );

      case 1:
        return (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" sx={{ color: "#fff", fontWeight: 600 }}>
                Booth Allocation ({booths.length} booths allocated)
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => openBoothDialog()}
                sx={{
                  bgcolor: '#6366f1',
                  color: '#fff',
                  px: 3,
                  py: 1,
                  borderRadius: 2,
                  fontWeight: 600,
                  '&:hover': { bgcolor: '#575de8' },
                }}
              >
                Add Booth
              </Button>
            </Box>

            {booths.length > 0 ? (
              <Grid container spacing={2}>
                {booths.map((booth) => (
                  <Grid item xs={12} sm={6} md={4} key={booth.id}>
                    <Card sx={{ 
                      bgcolor: '#334155', 
                      borderRadius: 2,
                      borderLeft: `4px solid ${booth.status === 'occupied' ? '#10b981' : '#6366f1'}`,
                    }}>
                      <CardContent sx={{ p: 2.5 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                          <Box>
                            <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: '18px', mb: 0.5 }}>
                              Booth {booth.number}
                            </Typography>
                            <Chip
                              label={booth.status.toUpperCase()}
                              size="small"
                              sx={{
                                bgcolor: booth.status === 'occupied' ? '#10b98120' : '#6366f120',
                                color: booth.status === 'occupied' ? '#10b981' : '#6366f1',
                                fontWeight: 600,
                                fontSize: '11px',
                              }}
                            />
                          </Box>
                          <Box sx={{ display: 'flex', gap: 0.5 }}>
                            <IconButton
                              size="small"
                              onClick={() => openBoothDialog(booth)}
                              sx={{ 
                                color: '#94a3b8',
                                bgcolor: 'rgba(255,255,255,0.05)',
                                '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
                              }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => deleteBooth(booth.id)}
                              sx={{ 
                                color: '#ef4444',
                                bgcolor: 'rgba(239,68,68,0.1)',
                                '&:hover': { bgcolor: 'rgba(239,68,68,0.2)' }
                              }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </Box>
                        
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                          <Typography sx={{ color: '#94a3b8', fontSize: '14px' }}>
                            Size
                          </Typography>
                          <Typography sx={{ color: '#fff', fontSize: '14px', fontWeight: 500 }}>
                            {booth.size}
                          </Typography>
                        </Box>
                        
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                          <Typography sx={{ color: '#94a3b8', fontSize: '14px' }}>
                            Price
                          </Typography>
                          <Typography sx={{ color: '#fff', fontSize: '14px', fontWeight: 500 }}>
                            ${booth.price}
                          </Typography>
                        </Box>
                        
                        {booth.exhibitor && (
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography sx={{ color: '#94a3b8', fontSize: '14px' }}>
                              Exhibitor
                            </Typography>
                            <Typography sx={{ color: '#fff', fontSize: '14px', fontWeight: 500 }}>
                              {booth.exhibitor}
                            </Typography>
                          </Box>
                        )}
                        
                        <Button
                          fullWidth
                          variant="outlined"
                          size="small"
                          onClick={() => toggleBoothStatus(booth.id)}
                          sx={{ 
                            mt: 2,
                            borderColor: booth.status === 'occupied' ? '#ef4444' : '#10b981',
                            color: booth.status === 'occupied' ? '#ef4444' : '#10b981',
                            fontSize: '13px',
                            fontWeight: 500,
                          }}
                        >
                          {booth.status === 'occupied' ? 'Mark as Available' : 'Mark as Occupied'}
                        </Button>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Box sx={{ 
                textAlign: 'center', 
                py: 8,
                bgcolor: 'rgba(255,255,255,0.02)',
                borderRadius: 2,
                border: '1px dashed rgba(255,255,255,0.1)'
              }}>
                <ChairIcon sx={{ fontSize: 48, color: '#94a3b8', mb: 2, opacity: 0.5 }} />
                <Typography sx={{ color: '#94a3b8', mb: 2 }}>
                  No booths allocated yet
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => openBoothDialog()}
                  sx={{
                    bgcolor: '#6366f1',
                    color: '#fff',
                    px: 4,
                    py: 1.2,
                    borderRadius: 2,
                    fontWeight: 600,
                    '&:hover': { bgcolor: '#575de8' },
                  }}
                >
                  Add Your First Booth
                </Button>
              </Box>
            )}
          </Box>
        );

      case 2:
        return (
          <Box>
            <Typography variant="h6" sx={{ color: "#fff", mb: 4, fontWeight: 600 }}>
              Review & Confirm
            </Typography>

            <Grid container spacing={4}>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3, bgcolor: '#334155', borderRadius: 2 }}>
                  <Typography variant="h6" sx={{ color: '#fff', mb: 3, fontWeight: 600 }}>
                    Expo Summary
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <EventIcon sx={{ color: '#6366f1', mr: 2 }} />
                    <Box>
                      <Typography sx={{ color: '#94a3b8', fontSize: '14px' }}>
                        Title
                      </Typography>
                      <Typography sx={{ color: '#fff', fontWeight: 500 }}>
                        {watch('title') || 'Not specified'}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <LocationOnIcon sx={{ color: '#6366f1', mr: 2 }} />
                    <Box>
                      <Typography sx={{ color: '#94a3b8', fontSize: '14px' }}>
                        Location
                      </Typography>
                      <Typography sx={{ color: '#fff', fontWeight: 500 }}>
                        {watch('location') || 'Not specified'}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <PersonIcon sx={{ color: '#6366f1', mr: 2 }} />
                    <Box>
                      <Typography sx={{ color: '#94a3b8', fontSize: '14px' }}>
                        Organizer
                      </Typography>
                      <Typography sx={{ color: '#fff', fontWeight: 500 }}>
                        {watch('organizer') || 'Not specified'}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <EmailIcon sx={{ color: '#6366f1', mr: 2 }} />
                    <Box>
                      <Typography sx={{ color: '#94a3b8', fontSize: '14px' }}>
                        Contact Email
                      </Typography>
                      <Typography sx={{ color: '#fff', fontWeight: 500 }}>
                        {watch('contactEmail') || 'Not specified'}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <PhoneIcon sx={{ color: '#6366f1', mr: 2 }} />
                    <Box>
                      <Typography sx={{ color: '#94a3b8', fontSize: '14px' }}>
                        Contact Phone
                      </Typography>
                      <Typography sx={{ color: '#fff', fontWeight: 500 }}>
                        {watch('contactPhone') || 'Not specified'}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <LanguageIcon sx={{ color: '#6366f1', mr: 2 }} />
                    <Box>
                      <Typography sx={{ color: '#94a3b8', fontSize: '14px' }}>
                        Theme
                      </Typography>
                      <Typography sx={{ color: '#fff', fontWeight: 500 }}>
                        {watch('theme') || 'Not specified'}
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              </Grid>

              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3, bgcolor: '#334155', borderRadius: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h6" sx={{ color: '#fff', fontWeight: 600 }}>
                      Booth Summary
                    </Typography>
                    <Chip 
                      label={`${booths.length} booths`} 
                      sx={{ bgcolor: '#6366f1', color: '#fff', fontWeight: 600 }}
                    />
                  </Box>

                  {booths.length > 0 ? (
                    <Box sx={{ maxHeight: '300px', overflowY: 'auto' }}>
                      {booths.map((booth, index) => (
                        <Box key={booth.id} sx={{ 
                          p: 2, 
                          mb: 2, 
                          bgcolor: 'rgba(255,255,255,0.05)', 
                          borderRadius: 1,
                          borderLeft: `3px solid ${booth.status === 'occupied' ? '#10b981' : '#6366f1'}`
                        }}>
                          <Typography sx={{ color: '#fff', fontWeight: 600, mb: 0.5 }}>
                            Booth {booth.number}
                          </Typography>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography sx={{ color: '#94a3b8', fontSize: '14px' }}>
                              {booth.size} • ${booth.price}
                            </Typography>
                            <Typography sx={{ 
                              color: booth.status === 'occupied' ? '#10b981' : '#6366f1',
                              fontSize: '14px',
                              fontWeight: 600
                            }}>
                              {booth.status.toUpperCase()}
                            </Typography>
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  ) : (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <Typography sx={{ color: '#94a3b8' }}>
                        No booths allocated
                      </Typography>
                    </Box>
                  )}
                </Paper>
              </Grid>

              <Grid item xs={12}>
                <Paper sx={{ p: 3, bgcolor: '#334155', borderRadius: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <DescriptionIcon sx={{ color: '#6366f1', mr: 2 }} />
                    <Typography variant="h6" sx={{ color: '#fff', fontWeight: 600 }}>
                      Description
                    </Typography>
                  </Box>
                  <Typography sx={{ color: '#94a3b8', lineHeight: 1.6 }}>
                    {watch('description') || 'No description provided'}
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Box sx={{ display: "flex", background: "#0f172a", minHeight: "100vh" }}>
      <Sidebar open={sidebarOpen} toggleSidebar={toggleSidebar} />

      <Box
        sx={{
          flexGrow: 1,
          ml: sidebarOpen ? "270px" : "80px",
          transition: "0.3s",
          p: 3,
        }}
      >
        <Box sx={{ maxWidth: '1200px', mx: 'auto' }}>
          {/* Page Header */}
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="h4"
              sx={{
                color: "#fff",
                fontWeight: 800,
                mb: 1,
              }}
            >
              Create New Expo
            </Typography>
            <Typography sx={{ color: "#94a3b8", fontSize: "16px" }}>
              Follow the steps to create a complete expo event
            </Typography>
          </Box>

          {/* Error and Success Messages */}
          {error && (
            <Alert 
              severity="error" 
              sx={{ mb: 3 }}
              onClose={() => setError("")}
            >
              {error}
            </Alert>
          )}
          
          {success && (
            <Alert 
              severity="success" 
              sx={{ mb: 3 }}
              onClose={() => setSuccess("")}
            >
              {success}
            </Alert>
          )}

          {/* Stepper */}
          <Paper sx={{ p: 3, mb: 4, bgcolor: '#1e293b', borderRadius: 3 }}>
            <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel sx={{ 
                    '& .MuiStepLabel-label': { 
                      color: '#fff !important',
                      fontSize: '15px',
                      fontWeight: 500
                    } 
                  }}>
                    {label}
                  </StepLabel>
                </Step>
              ))}
            </Stepper>

            {/* Form Content */}
            <form onSubmit={handleSubmit(onSubmit)}>
              {renderStepContent(activeStep)}

              {/* Navigation Buttons */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 6, pt: 3, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                <Button
                  variant="outlined"
                  onClick={activeStep === 0 ? () => navigate("/viewexpo") : handleBack}
                  disabled={loading}
                  sx={{
                    borderColor: '#94a3b8',
                    color: '#94a3b8',
                    px: 4,
                    py: 1.2,
                    borderRadius: 2,
                    fontWeight: 600,
                  }}
                >
                  {activeStep === 0 ? 'Cancel' : 'Back'}
                </Button>

                {activeStep === steps.length - 1 ? (
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={loading || !isValid}
                    sx={{
                      bgcolor: "#10b981",
                      px: 5,
                      py: 1.2,
                      fontSize: "16px",
                      fontWeight: 600,
                      borderRadius: 2,
                      boxShadow: "0 4px 14px rgba(16, 185, 129, 0.3)",
                      "&:hover": {
                        bgcolor: "#0da271",
                        boxShadow: "0 6px 20px rgba(16, 185, 129, 0.4)",
                      },
                      "&.Mui-disabled": {
                        bgcolor: "#0f766e",
                        color: "#94a3b8",
                      },
                    }}
                  >
                    {loading ? (
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <CircularProgress size={20} sx={{ mr: 1, color: '#fff' }} />
                        Creating...
                      </Box>
                    ) : (
                      "Create Expo"
                    )}
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    onClick={handleNext}
                    disabled={loading}
                    sx={{
                      bgcolor: "#6366f1",
                      px: 5,
                      py: 1.2,
                      fontSize: "16px",
                      fontWeight: 600,
                      borderRadius: 2,
                      boxShadow: "0 4px 14px rgba(99, 102, 241, 0.3)",
                      "&:hover": {
                        bgcolor: "#575de8",
                        boxShadow: "0 6px 20px rgba(99, 102, 241, 0.4)",
                      },
                    }}
                  >
                    Continue
                  </Button>
                )}
              </Box>
            </form>
          </Paper>
        </Box>
      </Box>

      {/* Booth Dialog */}
      <Dialog 
        open={boothDialogOpen} 
        onClose={closeBoothDialog} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: { bgcolor: '#1e293b' }
        }}
      >
        <DialogTitle sx={{ 
          bgcolor: '#1e293b', 
          color: '#fff',
          fontWeight: 600,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid rgba(255,255,255,0.1)'
        }}>
          {currentBooth.id ? 'Edit Booth' : 'Add New Booth'}
          <IconButton
            onClick={closeBoothDialog}
            sx={{ color: '#94a3b8' }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ bgcolor: '#1e293b', py: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                name="number"
                label="Booth Number *"
                value={currentBooth.number}
                onChange={handleBoothChange}
                fullWidth
                required
                variant="outlined"
                InputProps={{ 
                  sx: { 
                    bgcolor: '#334155', 
                    color: '#fff',
                    borderRadius: 1
                  } 
                }}
                InputLabelProps={{ sx: { color: '#94a3b8' } }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                select
                name="size"
                label="Booth Size *"
                value={currentBooth.size}
                onChange={handleBoothChange}
                fullWidth
                required
                variant="outlined"
                InputProps={{ 
                  sx: { 
                    bgcolor: '#334155', 
                    color: '#fff',
                    borderRadius: 1
                  } 
                }}
                InputLabelProps={{ sx: { color: '#94a3b8' } }}
              >
                <MenuItem value="Standard">Standard (10x10)</MenuItem>
                <MenuItem value="Large">Large (20x10)</MenuItem>
                <MenuItem value="Premium">Premium (20x20)</MenuItem>
                <MenuItem value="Custom">Custom Size</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={6}>
              <TextField
                name="price"
                label="Price ($) *"
                type="number"
                value={currentBooth.price}
                onChange={handleBoothChange}
                fullWidth
                required
                variant="outlined"
                InputProps={{ 
                  sx: { 
                    bgcolor: '#334155', 
                    color: '#fff',
                    borderRadius: 1
                  } 
                }}
                InputLabelProps={{ sx: { color: '#94a3b8' } }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="exhibitor"
                label="Exhibitor Name"
                value={currentBooth.exhibitor}
                onChange={handleBoothChange}
                fullWidth
                variant="outlined"
                InputProps={{ 
                  sx: { 
                    bgcolor: '#334155', 
                    color: '#fff',
                    borderRadius: 1
                  } 
                }}
                InputLabelProps={{ sx: { color: '#94a3b8' } }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                select
                name="status"
                label="Status *"
                value={currentBooth.status}
                onChange={handleBoothChange}
                fullWidth
                required
                variant="outlined"
                InputProps={{ 
                  sx: { 
                    bgcolor: '#334155', 
                    color: '#fff',
                    borderRadius: 1
                  } 
                }}
                InputLabelProps={{ sx: { color: '#94a3b8' } }}
              >
                <MenuItem value="available">Available</MenuItem>
                <MenuItem value="reserved">Reserved</MenuItem>
                <MenuItem value="occupied">Occupied</MenuItem>
                <MenuItem value="maintenance">Under Maintenance</MenuItem>
              </TextField>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ 
          bgcolor: '#1e293b', 
          px: 3, 
          pb: 3,
          borderTop: '1px solid rgba(255,255,255,0.1)'
        }}>
          <Button 
            onClick={closeBoothDialog} 
            disabled={loading}
            sx={{ 
              color: '#94a3b8',
              px: 3,
              py: 1
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={saveBooth}
            variant="contained"
            disabled={loading}
            sx={{ 
              bgcolor: '#6366f1', 
              color: '#fff',
              px: 4,
              py: 1,
              borderRadius: 2,
              fontWeight: 600
            }}
          >
            {currentBooth.id ? 'Update Booth' : 'Add Booth'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AddExpo;
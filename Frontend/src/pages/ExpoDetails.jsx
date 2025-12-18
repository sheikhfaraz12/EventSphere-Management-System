import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Grid,
  Button,
  Chip,
  Divider,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  Stack,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CalendarToday as CalendarIcon,
  LocationOn as LocationIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Language as LanguageIcon,
  Description as DescriptionIcon,
  Chair as ChairIcon,
  AttachMoney as MoneyIcon,
  Business as BusinessIcon,
  EventAvailable as EventAvailableIcon,
  EventBusy as EventBusyIcon,
  Link as LinkIcon,
} from "@mui/icons-material";
import Sidebar from "./components/Sidebar";
import { getExpoById, deleteExpo } from "../services/api";

const ExpoDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [expo, setExpo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState(0);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // Fetch expo details
  useEffect(() => {
    const fetchExpoDetails = async () => {
      try {
        setLoading(true);
        const response = await getExpoById(id);
        const expoData = response.data?.data || response.data;
        
        if (!expoData) {
          throw new Error("Expo not found");
        }
        
        setExpo(expoData);
      } catch (error) {
        console.error("Error fetching expo details:", error);
        setError("Failed to load expo details. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      fetchExpoDetails();
    }
  }, [id]);

  // Handle delete
  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete "${expo.title}"? This action cannot be undone.`)) {
      try {
        await deleteExpo(id);
        alert("Expo deleted successfully!");
        navigate("/viewexpo");
      } catch (error) {
        console.error("Error deleting expo:", error);
        setError("Failed to delete expo. Please try again.");
      }
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "Not set";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Format date without weekday
  const formatShortDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Get status color and text
  const getStatusInfo = (status) => {
    switch (status) {
      case 'draft': return { color: 'warning', label: 'Draft', bgColor: '#fef3c7', textColor: '#92400e' };
      case 'published': return { color: 'info', label: 'Published', bgColor: '#dbeafe', textColor: '#1e40af' };
      case 'active': return { color: 'success', label: 'Active', bgColor: '#d1fae5', textColor: '#065f46' };
      case 'completed': return { color: 'default', label: 'Completed', bgColor: '#f3f4f6', textColor: '#374151' };
      default: return { color: 'default', label: 'Unknown', bgColor: '#f3f4f6', textColor: '#374151' };
    }
  };

  // Calculate booth statistics
  const calculateBoothStats = () => {
    if (!expo?.booths) return { total: 0, available: 0, occupied: 0, reserved: 0 };
    
    const booths = expo.booths;
    return {
      total: booths.length,
      available: booths.filter(b => b.status === 'available').length,
      occupied: booths.filter(b => b.status === 'occupied').length,
      reserved: booths.filter(b => b.status === 'reserved').length,
    };
  };

  const boothStats = calculateBoothStats();

  if (loading) {
    return (
      <Box sx={{ display: "flex", background: "#0f172a", minHeight: "100vh", alignItems: "center", justifyContent: "center" }}>
        <CircularProgress sx={{ color: '#6366f1' }} />
        <Typography sx={{ color: '#fff', ml: 2 }}>Loading expo details...</Typography>
      </Box>
    );
  }

  if (error || !expo) {
    return (
      <Box sx={{ display: "flex", background: "#0f172a", minHeight: "100vh" }}>
        <Sidebar open={sidebarOpen} toggleSidebar={toggleSidebar} />
        <Box sx={{ flexGrow: 1, ml: sidebarOpen ? "270px" : "80px", p: 3, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Alert severity="error" sx={{ maxWidth: 600 }}>
            {error || "Expo not found"}
            <Button sx={{ ml: 2 }} onClick={() => navigate("/viewexpo")}>
              Back to Expos
            </Button>
          </Alert>
        </Box>
      </Box>
    );
  }

  const statusInfo = getStatusInfo(expo.status);

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
        <Box sx={{ maxWidth: '1400px', mx: 'auto' }}>
          {/* Back and Action Buttons */}
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Button
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate("/viewexpo")}
                sx={{ 
                  color: '#94a3b8',
                  '&:hover': { color: '#fff' }
                }}
              >
                Back to Expos
              </Button>
              
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="outlined"
                  startIcon={<EditIcon />}
                  onClick={() => navigate(`/editexpo/${id}`)}
                  sx={{ 
                    borderColor: '#6366f1',
                    color: '#6366f1',
                    '&:hover': { borderColor: '#575de8' }
                  }}
                >
                  Edit Expo
                </Button>
                <Button
                  variant="contained"
                  startIcon={<DeleteIcon />}
                  onClick={handleDelete}
                  sx={{ 
                    bgcolor: '#ef4444',
                    color: '#fff',
                    '&:hover': { bgcolor: '#dc2626' }
                  }}
                >
                  Delete
                </Button>
              </Box>
            </Box>
          </Box>

          {/* Error Alert */}
          {error && (
            <Alert 
              severity="error" 
              sx={{ mb: 3 }}
              onClose={() => setError("")}
            >
              {error}
            </Alert>
          )}

          {/* Expo Header */}
          <Paper sx={{ p: 4, mb: 4, bgcolor: '#1e293b', borderRadius: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
              <Box>
                <Typography variant="h3" sx={{ color: "#fff", fontWeight: 800, mb: 1 }}>
                  {expo.title}
                </Typography>
                <Chip
                  label={statusInfo.label}
                  sx={{
                    bgcolor: statusInfo.bgColor,
                    color: statusInfo.textColor,
                    fontWeight: 600,
                    fontSize: '14px',
                    px: 2,
                    py: 1
                  }}
                />
              </Box>
              
              <Box sx={{ textAlign: 'right' }}>
                <Typography sx={{ color: '#94a3b8', fontSize: '14px', mb: 0.5 }}>
                  Created
                </Typography>
                <Typography sx={{ color: '#fff', fontWeight: 500 }}>
                  {formatDate(expo.createdAt)}
                </Typography>
              </Box>
            </Box>

            {/* Quick Info Grid */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ bgcolor: '#334155', borderRadius: 2, height: '100%' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <CalendarIcon sx={{ color: '#6366f1', mr: 2 }} />
                      <Typography sx={{ color: '#94a3b8', fontSize: '14px' }}>
                        Event Date
                      </Typography>
                    </Box>
                    <Typography sx={{ color: '#fff', fontWeight: 600, fontSize: '18px' }}>
                      {formatDate(expo.date)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ bgcolor: '#334155', borderRadius: 2, height: '100%' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <LocationIcon sx={{ color: '#6366f1', mr: 2 }} />
                      <Typography sx={{ color: '#94a3b8', fontSize: '14px' }}>
                        Location
                      </Typography>
                    </Box>
                    <Typography sx={{ color: '#fff', fontWeight: 600, fontSize: '18px' }}>
                      {expo.location || 'Not specified'}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ bgcolor: '#334155', borderRadius: 2, height: '100%' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <BusinessIcon sx={{ color: '#6366f1', mr: 2 }} />
                      <Typography sx={{ color: '#94a3b8', fontSize: '14px' }}>
                        Theme
                      </Typography>
                    </Box>
                    <Typography sx={{ color: '#fff', fontWeight: 600, fontSize: '18px' }}>
                      {expo.theme || 'Not specified'}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ bgcolor: '#334155', borderRadius: 2, height: '100%' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <ChairIcon sx={{ color: '#6366f1', mr: 2 }} />
                      <Typography sx={{ color: '#94a3b8', fontSize: '14px' }}>
                        Total Booths
                      </Typography>
                    </Box>
                    <Typography sx={{ color: '#fff', fontWeight: 600, fontSize: '18px' }}>
                      {boothStats.total}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Tabs */}
            <Box sx={{ borderBottom: 1, borderColor: 'rgba(255,255,255,0.1)' }}>
              <Tabs 
                value={activeTab} 
                onChange={(e, newValue) => setActiveTab(newValue)}
                sx={{
                  '& .MuiTab-root': { color: '#94a3b8' },
                  '& .Mui-selected': { color: '#6366f1 !important' },
                  '& .MuiTabs-indicator': { bgcolor: '#6366f1' }
                }}
              >
                <Tab label="Overview" />
                <Tab label="Booths" />
                <Tab label="Organizer Info" />
                <Tab label="Statistics" />
              </Tabs>
            </Box>
          </Paper>

          {/* Tab Content */}
          <Paper sx={{ p: 4, bgcolor: '#1e293b', borderRadius: 3 }}>
            {activeTab === 0 && (
              <Box>
                <Typography variant="h5" sx={{ color: "#fff", mb: 3, fontWeight: 600 }}>
                  Expo Overview
                </Typography>
                
                <Grid container spacing={4}>
                  <Grid item xs={12} md={8}>
                    <Card sx={{ bgcolor: '#334155', borderRadius: 2, mb: 3 }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <DescriptionIcon sx={{ color: '#6366f1', mr: 2 }} />
                          <Typography variant="h6" sx={{ color: '#fff', fontWeight: 600 }}>
                            Description
                          </Typography>
                        </Box>
                        <Typography sx={{ color: '#94a3b8', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                          {expo.description || 'No description provided for this expo.'}
                        </Typography>
                      </CardContent>
                    </Card>

                    {/* Booth Stats */}
                    <Card sx={{ bgcolor: '#334155', borderRadius: 2 }}>
                      <CardContent>
                        <Typography variant="h6" sx={{ color: '#fff', mb: 3, fontWeight: 600 }}>
                          Booth Statistics
                        </Typography>
                        <Grid container spacing={2}>
                          <Grid item xs={6} sm={3}>
                            <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'rgba(99, 102, 241, 0.1)', borderRadius: 2 }}>
                              <Typography sx={{ color: '#6366f1', fontSize: '24px', fontWeight: 700 }}>
                                {boothStats.total}
                              </Typography>
                              <Typography sx={{ color: '#94a3b8', fontSize: '14px' }}>
                                Total Booths
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={6} sm={3}>
                            <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'rgba(16, 185, 129, 0.1)', borderRadius: 2 }}>
                              <Typography sx={{ color: '#10b981', fontSize: '24px', fontWeight: 700 }}>
                                {boothStats.available}
                              </Typography>
                              <Typography sx={{ color: '#94a3b8', fontSize: '14px' }}>
                                Available
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={6} sm={3}>
                            <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'rgba(239, 68, 68, 0.1)', borderRadius: 2 }}>
                              <Typography sx={{ color: '#ef4444', fontSize: '24px', fontWeight: 700 }}>
                                {boothStats.occupied}
                              </Typography>
                              <Typography sx={{ color: '#94a3b8', fontSize: '14px' }}>
                                Occupied
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={6} sm={3}>
                            <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'rgba(245, 158, 11, 0.1)', borderRadius: 2 }}>
                              <Typography sx={{ color: '#f59e0b', fontSize: '24px', fontWeight: 700 }}>
                                {boothStats.reserved}
                              </Typography>
                              <Typography sx={{ color: '#94a3b8', fontSize: '14px' }}>
                                Reserved
                              </Typography>
                            </Box>
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <Card sx={{ bgcolor: '#334155', borderRadius: 2, mb: 3 }}>
                      <CardContent>
                        <Typography variant="h6" sx={{ color: '#fff', mb: 3, fontWeight: 600 }}>
                          Event Details
                        </Typography>
                        
                        <Stack spacing={2}>
                          <Box>
                            <Typography sx={{ color: '#94a3b8', fontSize: '14px', mb: 0.5 }}>
                              Registration Deadline
                            </Typography>
                            <Typography sx={{ color: '#fff', fontWeight: 500 }}>
                              {expo.registrationDeadline ? formatDate(expo.registrationDeadline) : 'Not set'}
                            </Typography>
                          </Box>
                          
                          <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />
                          
                          <Box>
                            <Typography sx={{ color: '#94a3b8', fontSize: '14px', mb: 0.5 }}>
                              Expected Booth Count
                            </Typography>
                            <Typography sx={{ color: '#fff', fontWeight: 500 }}>
                              {expo.boothCount || boothStats.total}
                            </Typography>
                          </Box>
                          
                          <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />
                          
                          {expo.website && (
                            <>
                              <Box>
                                <Typography sx={{ color: '#94a3b8', fontSize: '14px', mb: 0.5 }}>
                                  Website
                                </Typography>
                                <Button
                                  startIcon={<LinkIcon />}
                                  href={expo.website}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  sx={{ 
                                    color: '#6366f1',
                                    textTransform: 'none',
                                    p: 0,
                                    '&:hover': { color: '#575de8' }
                                  }}
                                >
                                  {expo.website}
                                </Button>
                              </Box>
                              <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />
                            </>
                          )}
                          
                          <Box>
                            <Typography sx={{ color: '#94a3b8', fontSize: '14px', mb: 0.5 }}>
                              Last Updated
                            </Typography>
                            <Typography sx={{ color: '#fff', fontWeight: 500 }}>
                              {formatDate(expo.updatedAt || expo.createdAt)}
                            </Typography>
                          </Box>
                        </Stack>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </Box>
            )}

            {activeTab === 1 && (
              <Box>
                <Typography variant="h5" sx={{ color: "#fff", mb: 3, fontWeight: 600 }}>
                  Booth Management
                </Typography>
                
                {expo.booths && expo.booths.length > 0 ? (
                  <TableContainer component={Paper} sx={{ bgcolor: '#334155' }}>
                    <Table>
                      <TableHead>
                        <TableRow sx={{ bgcolor: '#475569' }}>
                          <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Booth #</TableCell>
                          <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Size</TableCell>
                          <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Price</TableCell>
                          <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Status</TableCell>
                          <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Exhibitor</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {expo.booths.map((booth, index) => (
                          <TableRow 
                            key={booth._id || index}
                            sx={{ 
                              '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' },
                              borderBottom: '1px solid rgba(255,255,255,0.1)'
                            }}
                          >
                            <TableCell sx={{ color: '#fff', fontWeight: 500 }}>
                              {booth.number}
                            </TableCell>
                            <TableCell sx={{ color: '#fff' }}>
                              {booth.size}
                            </TableCell>
                            <TableCell sx={{ color: '#fff' }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <MoneyIcon sx={{ color: '#94a3b8', fontSize: '16px' }} />
                                ${booth.price}
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={booth.status?.toUpperCase() || 'UNKNOWN'}
                                size="small"
                                sx={{
                                  bgcolor: booth.status === 'available' ? 'rgba(16, 185, 129, 0.1)' :
                                           booth.status === 'occupied' ? 'rgba(239, 68, 68, 0.1)' :
                                           booth.status === 'reserved' ? 'rgba(245, 158, 11, 0.1)' :
                                           'rgba(99, 102, 241, 0.1)',
                                  color: booth.status === 'available' ? '#10b981' :
                                         booth.status === 'occupied' ? '#ef4444' :
                                         booth.status === 'reserved' ? '#f59e0b' :
                                         '#6366f1',
                                  fontWeight: 600,
                                  fontSize: '11px',
                                }}
                              />
                            </TableCell>
                            <TableCell sx={{ color: '#fff' }}>
                              {booth.exhibitor || 'Not assigned'}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 8, bgcolor: 'rgba(255,255,255,0.02)', borderRadius: 2 }}>
                    <ChairIcon sx={{ fontSize: 48, color: '#94a3b8', mb: 2, opacity: 0.5 }} />
                    <Typography sx={{ color: '#94a3b8', mb: 2 }}>
                      No booths allocated for this expo
                    </Typography>
                    <Button
                      variant="contained"
                      startIcon={<EditIcon />}
                      onClick={() => navigate(`/editexpo/${id}`)}
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
                      Add Booths
                    </Button>
                  </Box>
                )}
              </Box>
            )}

            {activeTab === 2 && (
              <Box>
                <Typography variant="h5" sx={{ color: "#fff", mb: 3, fontWeight: 600 }}>
                  Organizer Information
                </Typography>
                
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Card sx={{ bgcolor: '#334155', borderRadius: 2, height: '100%' }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                          <PersonIcon sx={{ color: '#6366f1', mr: 2, fontSize: '28px' }} />
                          <Typography variant="h6" sx={{ color: '#fff', fontWeight: 600 }}>
                            Contact Person
                          </Typography>
                        </Box>
                        
                        <Stack spacing={3}>
                          <Box>
                            <Typography sx={{ color: '#94a3b8', fontSize: '14px', mb: 1 }}>
                              Organizer Name
                            </Typography>
                            <Typography sx={{ color: '#fff', fontWeight: 500, fontSize: '18px' }}>
                              {expo.organizer?.name || expo.organizer || 'Not specified'}
                            </Typography>
                          </Box>
                          
                          <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />
                          
                          <Box>
                            <Typography sx={{ color: '#94a3b8', fontSize: '14px', mb: 1 }}>
                              Contact Email
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <EmailIcon sx={{ color: '#94a3b8', fontSize: '18px' }} />
                              <Typography sx={{ color: '#fff', fontWeight: 500 }}>
                                {expo.contactEmail || expo.organizer?.email || 'Not specified'}
                              </Typography>
                            </Box>
                          </Box>
                          
                          <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />
                          
                          <Box>
                            <Typography sx={{ color: '#94a3b8', fontSize: '14px', mb: 1 }}>
                              Contact Phone
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <PhoneIcon sx={{ color: '#94a3b8', fontSize: '18px' }} />
                              <Typography sx={{ color: '#fff', fontWeight: 500 }}>
                                {expo.contactPhone || expo.organizer?.phone || 'Not specified'}
                              </Typography>
                            </Box>
                          </Box>
                        </Stack>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Card sx={{ bgcolor: '#334155', borderRadius: 2, height: '100%' }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                          <BusinessIcon sx={{ color: '#6366f1', mr: 2, fontSize: '28px' }} />
                          <Typography variant="h6" sx={{ color: '#fff', fontWeight: 600 }}>
                            Additional Information
                          </Typography>
                        </Box>
                        
                        <Stack spacing={3}>
                          <Box>
                            <Typography sx={{ color: '#94a3b8', fontSize: '14px', mb: 1 }}>
                              Registration Deadline
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <EventAvailableIcon sx={{ color: boothStats.available > 0 ? '#10b981' : '#94a3b8' }} />
                              <Typography sx={{ color: '#fff', fontWeight: 500 }}>
                                {expo.registrationDeadline ? formatDate(expo.registrationDeadline) : 'Not set'}
                              </Typography>
                            </Box>
                          </Box>
                          
                          <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />
                          
                          <Box>
                            <Typography sx={{ color: '#94a3b8', fontSize: '14px', mb: 1 }}>
                              Event Date
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <CalendarIcon sx={{ color: '#94a3b8' }} />
                              <Typography sx={{ color: '#fff', fontWeight: 500 }}>
                                {formatDate(expo.date)}
                              </Typography>
                            </Box>
                          </Box>
                          
                          <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />
                          
                          {expo.website && (
                            <Box>
                              <Typography sx={{ color: '#94a3b8', fontSize: '14px', mb: 1 }}>
                                Website
                              </Typography>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <LanguageIcon sx={{ color: '#94a3b8' }} />
                                <Button
                                  href={expo.website}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  sx={{ 
                                    color: '#6366f1',
                                    textTransform: 'none',
                                    p: 0,
                                    '&:hover': { color: '#575de8' }
                                  }}
                                >
                                  Visit Website
                                </Button>
                              </Box>
                            </Box>
                          )}
                        </Stack>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </Box>
            )}

            {activeTab === 3 && (
              <Box>
                <Typography variant="h5" sx={{ color: "#fff", mb: 3, fontWeight: 600 }}>
                  Expo Statistics
                </Typography>
                
                <Grid container spacing={3}>
                  <Grid item xs={12} md={4}>
                    <Card sx={{ bgcolor: '#334155', borderRadius: 2, height: '100%' }}>
                      <CardContent>
                        <Typography sx={{ color: '#94a3b8', fontSize: '14px', mb: 2 }}>
                          Booth Distribution
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <EventAvailableIcon sx={{ color: '#10b981' }} />
                              <Typography sx={{ color: '#94a3b8', fontSize: '14px' }}>
                                Available
                              </Typography>
                            </Box>
                            <Typography sx={{ color: '#fff', fontWeight: 600 }}>
                              {boothStats.available} ({boothStats.total > 0 ? Math.round((boothStats.available / boothStats.total) * 100) : 0}%)
                            </Typography>
                          </Box>
                          
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <EventBusyIcon sx={{ color: '#ef4444' }} />
                              <Typography sx={{ color: '#94a3b8', fontSize: '14px' }}>
                                Occupied
                              </Typography>
                            </Box>
                            <Typography sx={{ color: '#fff', fontWeight: 600 }}>
                              {boothStats.occupied} ({boothStats.total > 0 ? Math.round((boothStats.occupied / boothStats.total) * 100) : 0}%)
                            </Typography>
                          </Box>
                          
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <EventBusyIcon sx={{ color: '#f59e0b' }} />
                              <Typography sx={{ color: '#94a3b8', fontSize: '14px' }}>
                                Reserved
                              </Typography>
                            </Box>
                            <Typography sx={{ color: '#fff', fontWeight: 600 }}>
                              {boothStats.reserved} ({boothStats.total > 0 ? Math.round((boothStats.reserved / boothStats.total) * 100) : 0}%)
                            </Typography>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  <Grid item xs={12} md={4}>
                    <Card sx={{ bgcolor: '#334155', borderRadius: 2, height: '100%' }}>
                      <CardContent>
                        <Typography sx={{ color: '#94a3b8', fontSize: '14px', mb: 2 }}>
                          Financial Overview
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          <Box>
                            <Typography sx={{ color: '#94a3b8', fontSize: '12px', mb: 0.5 }}>
                              Total Revenue Potential
                            </Typography>
                            <Typography sx={{ color: '#fff', fontWeight: 600, fontSize: '20px' }}>
                              ${expo.booths?.reduce((sum, booth) => sum + (Number(booth.price) || 0), 0).toLocaleString() || '0'}
                            </Typography>
                          </Box>
                          
                          <Box>
                            <Typography sx={{ color: '#94a3b8', fontSize: '12px', mb: 0.5 }}>
                              Average Booth Price
                            </Typography>
                            <Typography sx={{ color: '#fff', fontWeight: 600, fontSize: '20px' }}>
                              ${boothStats.total > 0 ? Math.round(expo.booths?.reduce((sum, booth) => sum + (Number(booth.price) || 0), 0) / boothStats.total) : '0'}
                            </Typography>
                          </Box>
                          
                          <Box>
                            <Typography sx={{ color: '#94a3b8', fontSize: '12px', mb: 0.5 }}>
                              Expected Booth Count
                            </Typography>
                            <Typography sx={{ color: '#fff', fontWeight: 600, fontSize: '20px' }}>
                              {expo.boothCount || boothStats.total}
                            </Typography>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  <Grid item xs={12} md={4}>
                    <Card sx={{ bgcolor: '#334155', borderRadius: 2, height: '100%' }}>
                      <CardContent>
                        <Typography sx={{ color: '#94a3b8', fontSize: '14px', mb: 2 }}>
                          Event Status
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          <Box>
                            <Typography sx={{ color: '#94a3b8', fontSize: '12px', mb: 0.5 }}>
                              Current Status
                            </Typography>
                            <Chip
                              label={statusInfo.label}
                              sx={{
                                bgcolor: statusInfo.bgColor,
                                color: statusInfo.textColor,
                                fontWeight: 600,
                                fontSize: '14px',
                              }}
                            />
                          </Box>
                          
                          <Box>
                            <Typography sx={{ color: '#94a3b8', fontSize: '12px', mb: 0.5 }}>
                              Days Until Event
                            </Typography>
                            <Typography sx={{ color: '#fff', fontWeight: 600, fontSize: '20px' }}>
                              {expo.date ? Math.max(0, Math.ceil((new Date(expo.date) - new Date()) / (1000 * 60 * 60 * 24))) : 'N/A'}
                            </Typography>
                          </Box>
                          
                          <Box>
                            <Typography sx={{ color: '#94a3b8', fontSize: '12px', mb: 0.5 }}>
                              Created On
                            </Typography>
                            <Typography sx={{ color: '#fff', fontWeight: 500, fontSize: '14px' }}>
                              {formatShortDate(expo.createdAt)}
                            </Typography>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </Box>
            )}
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};

export default ExpoDetail;
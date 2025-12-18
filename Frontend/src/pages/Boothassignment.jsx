import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../pages/components/Sidebar.jsx';
import { getExhibitors, getExpos, updateExhibitor, updateExpo } from '../services/api.js';
import {
  Box,
  Button,
  Typography,
  Paper,
  Card,
  CardContent,
  Grid,
  Chip,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  TextField,
  alpha,
  Avatar,
  Divider,
  Tooltip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  Chair as BoothIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Assignment as AssignmentIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  SwapHoriz as SwapIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Event as EventIcon,
} from '@mui/icons-material';

const BoothAssignment = () => {
  const navigate = useNavigate();
  const [exhibitors, setExhibitors] = useState([]);
  const [expos, setExpos] = useState([]);
  const [selectedExpo, setSelectedExpo] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [boothDialogOpen, setBoothDialogOpen] = useState(false);
  const [selectedExhibitor, setSelectedExhibitor] = useState(null);
  const [selectedBooth, setSelectedBooth] = useState('');
  const [boothLayout, setBoothLayout] = useState([]);
  const [showUnassignedOnly, setShowUnassignedOnly] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Fetch exhibitors and expos
      const [exhibitorsData, exposData] = await Promise.all([
        getExhibitors(),
        getExpos()
      ]);
      
      // Filter for approved exhibitors
      const approvedExhibitors = exhibitorsData.filter(exhibitor => 
        exhibitor.status === 'approved' || exhibitor.status === 'Approved'
      );
      
      setExhibitors(approvedExhibitors);
      setExpos(exposData);
      
      // If there are expos, select the first one
      if (exposData.length > 0 && !selectedExpo) {
        setSelectedExpo(exposData[0]._id || exposData[0].id);
        generateBoothLayout(exposData[0]);
      }
      
    } catch (error) {
      console.error('Failed to fetch data:', error);
      setError('Failed to load data. Please check your backend connection.');
    } finally {
      setLoading(false);
    }
  };

  const generateBoothLayout = (expo) => {
    if (!expo || !expo.booths) return;
    
    // Create booth layout from expo data
    const layout = expo.booths.map(booth => ({
      ...booth,
      exhibitor: exhibitors.find(e => e.boothNumber === booth.number)
    }));
    
    setBoothLayout(layout);
  };

  const handleExpoChange = (expoId) => {
    setSelectedExpo(expoId);
    const expo = expos.find(e => (e._id || e.id) === expoId);
    if (expo) {
      generateBoothLayout(expo);
    }
  };

  const handleBoothAssignment = (exhibitor) => {
    setSelectedExhibitor(exhibitor);
    setBoothDialogOpen(true);
  };

  const handleAssignBooth = async () => {
    if (!selectedExhibitor || !selectedBooth) return;
    
    try {
      const exhibitorId = selectedExhibitor._id || selectedExhibitor.id;
      
      // Update exhibitor with booth assignment
      await updateExhibitor(exhibitorId, {
        boothNumber: selectedBooth,
        boothAssignedAt: new Date().toISOString()
      });
      
      // Update local state
      setExhibitors(exhibitors.map(exhibitor => 
        (exhibitor._id || exhibitor.id) === exhibitorId 
          ? { ...exhibitor, boothNumber: selectedBooth }
          : exhibitor
      ));
      
      // Update booth layout
      setBoothLayout(boothLayout.map(booth => 
        booth.number === selectedBooth
          ? { ...booth, exhibitor: selectedExhibitor }
          : booth
      ));
      
      setSuccess(`Successfully assigned Booth ${selectedBooth} to ${selectedExhibitor.name}`);
      setBoothDialogOpen(false);
      setSelectedExhibitor(null);
      setSelectedBooth('');
      
    } catch (error) {
      console.error('Failed to assign booth:', error);
      setError('Failed to assign booth. Please try again.');
    }
  };

  const handleRemoveBooth = async (exhibitorId) => {
    try {
      // Update exhibitor to remove booth assignment
      await updateExhibitor(exhibitorId, {
        boothNumber: null,
        boothAssignedAt: null
      });
      
      // Update local state
      setExhibitors(exhibitors.map(exhibitor => 
        (exhibitor._id || exhibitor.id) === exhibitorId 
          ? { ...exhibitor, boothNumber: null }
          : exhibitor
      ));
      
      // Update booth layout
      setBoothLayout(boothLayout.map(booth => 
        booth.exhibitor && (booth.exhibitor._id || booth.exhibitor.id) === exhibitorId
          ? { ...booth, exhibitor: null }
          : booth
      ));
      
      setSuccess('Booth assignment removed successfully');
      
    } catch (error) {
      console.error('Failed to remove booth:', error);
      setError('Failed to remove booth assignment. Please try again.');
    }
  };

  const getAvailableBooths = () => {
    if (!boothLayout.length) return [];
    return boothLayout.filter(booth => !booth.exhibitor && booth.status === 'available');
  };

  const getAssignedExhibitors = () => {
    return exhibitors.filter(exhibitor => exhibitor.boothNumber);
  };

  const getUnassignedExhibitors = () => {
    return exhibitors.filter(exhibitor => !exhibitor.boothNumber);
  };

  const filteredExhibitors = showUnassignedOnly 
    ? getUnassignedExhibitors()
    : exhibitors.filter(exhibitor =>
        (exhibitor.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
         exhibitor.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
         exhibitor.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
         exhibitor.boothNumber?.includes(searchQuery))
      );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', background: '#0f172a', minHeight: '100vh' }}>
        <Sidebar open={sidebarOpen} toggleSidebar={toggleSidebar} />
        <Box sx={{ 
          flexGrow: 1, 
          ml: sidebarOpen ? '270px' : '80px',
          transition: '0.3s',
          p: 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Box sx={{ textAlign: 'center' }}>
            <CircularProgress sx={{ color: '#6366f1', mb: 3 }} />
            <Typography sx={{ color: '#fff' }}>Loading booth assignment data...</Typography>
          </Box>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', background: '#0f172a', minHeight: '100vh' }}>
      <Sidebar open={sidebarOpen} toggleSidebar={toggleSidebar} />

      <Box
        sx={{
          flexGrow: 1,
          ml: sidebarOpen ? '270px' : '80px',
          transition: '0.3s',
          p: 3,
        }}
      >
        <Box sx={{ maxWidth: '1600px', mx: 'auto' }}>
          {/* Header */}
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="h4"
              sx={{
                color: '#fff',
                fontWeight: 800,
                mb: 1,
              }}
            >
              Booth Assignment
            </Typography>
            <Typography sx={{ color: '#94a3b8', fontSize: '16px' }}>
              Assign booths to approved exhibitors and manage booth layout
            </Typography>
          </Box>

          {/* Error and Success Alerts */}
          {error && (
            <Alert 
              severity="error" 
              sx={{ mb: 3 }}
              onClose={() => setError('')}
            >
              {error}
            </Alert>
          )}
          
          {success && (
            <Alert 
              severity="success" 
              sx={{ mb: 3 }}
              onClose={() => setSuccess('')}
            >
              {success}
            </Alert>
          )}

          {/* Expo Selection and Stats */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, bgcolor: '#1e293b', borderRadius: 3, height: '100%' }}>
                <Typography sx={{ color: '#fff', fontWeight: 600, mb: 2 }}>
                  Select Expo Event
                </Typography>
                
                <FormControl fullWidth>
                  <InputLabel sx={{ color: '#94a3b8' }}>Select Expo</InputLabel>
                  <Select
                    value={selectedExpo}
                    onChange={(e) => handleExpoChange(e.target.value)}
                    label="Select Expo"
                    sx={{
                      bgcolor: '#334155',
                      color: '#fff',
                      borderRadius: 1,
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(255,255,255,0.1)',
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#6366f1',
                      },
                    }}
                  >
                    {expos.map((expo) => (
                      <MenuItem key={expo._id || expo.id} value={expo._id || expo.id}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <EventIcon sx={{ color: '#6366f1' }} />
                          <Box>
                            <Typography sx={{ color: '#fff' }}>{expo.title}</Typography>
                            <Typography sx={{ color: '#94a3b8', fontSize: '12px' }}>
                              {expo.date} • {expo.booths?.length || 0} booths
                            </Typography>
                          </Box>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                
                {selectedExpo && (
                  <Box sx={{ mt: 3 }}>
                    <Typography sx={{ color: '#94a3b8', fontSize: '14px', mb: 1 }}>
                      Booth Summary
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#334155', borderRadius: 2 }}>
                          <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: '24px' }}>
                            {getAvailableBooths().length}
                          </Typography>
                          <Typography sx={{ color: '#94a3b8', fontSize: '12px' }}>
                            Available
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6}>
                        <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#334155', borderRadius: 2 }}>
                          <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: '24px' }}>
                            {getAssignedExhibitors().length}
                          </Typography>
                          <Typography sx={{ color: '#94a3b8', fontSize: '12px' }}>
                            Assigned
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </Box>
                )}
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, bgcolor: '#1e293b', borderRadius: 3, height: '100%' }}>
                <Typography sx={{ color: '#fff', fontWeight: 600, mb: 2 }}>
                  Quick Stats
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Card sx={{ bgcolor: '#334155', borderRadius: 2 }}>
                      <CardContent sx={{ p: 2 }}>
                        <Typography sx={{ color: '#94a3b8', fontSize: '12px', mb: 1 }}>
                          Approved Exhibitors
                        </Typography>
                        <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: '20px' }}>
                          {exhibitors.length}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  <Grid item xs={6}>
                    <Card sx={{ bgcolor: '#334155', borderRadius: 2 }}>
                      <CardContent sx={{ p: 2 }}>
                        <Typography sx={{ color: '#94a3b8', fontSize: '12px', mb: 1 }}>
                          Unassigned
                        </Typography>
                        <Typography sx={{ color: '#f59e0b', fontWeight: 700, fontSize: '20px' }}>
                          {getUnassignedExhibitors().length}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                      <Button
                        variant="outlined"
                        startIcon={<RefreshIcon />}
                        onClick={fetchData}
                        sx={{
                          borderColor: '#94a3b8',
                          color: '#94a3b8',
                          flex: 1,
                          py: 1,
                          borderRadius: 2,
                          fontWeight: 600,
                          fontSize: '14px',
                        }}
                      >
                        Refresh Data
                      </Button>
                      
                      <Button
                        variant="contained"
                        startIcon={<SwapIcon />}
                        onClick={() => navigate('/viewexpo')}
                        sx={{
                          bgcolor: '#6366f1',
                          color: '#fff',
                          flex: 1,
                          py: 1,
                          borderRadius: 2,
                          fontWeight: 600,
                          fontSize: '14px',
                          '&:hover': { bgcolor: '#575de8' }
                        }}
                      >
                        View Expo Details
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          </Grid>

          {/* Search and Filter Bar */}
          <Paper sx={{ p: 3, mb: 3, bgcolor: '#1e293b', borderRadius: 3 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  placeholder="Search exhibitors by name, company, email, or booth..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <SearchIcon sx={{ color: '#94a3b8', mr: 1 }} />
                    ),
                    sx: {
                      bgcolor: '#334155',
                      color: '#fff',
                      borderRadius: 2,
                    }
                  }}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, justifyContent: 'flex-end' }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={showUnassignedOnly}
                        onChange={(e) => setShowUnassignedOnly(e.target.checked)}
                        sx={{
                          '& .MuiSwitch-switchBase.Mui-checked': {
                            color: '#6366f1',
                          },
                          '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                            backgroundColor: '#6366f1',
                          },
                        }}
                      />
                    }
                    label={
                      <Typography sx={{ color: '#94a3b8', fontSize: '14px' }}>
                        Show unassigned only
                      </Typography>
                    }
                  />
                  
                  <Button
                    variant="outlined"
                    startIcon={<FilterIcon />}
                    sx={{
                      borderColor: '#94a3b8',
                      color: '#94a3b8',
                      px: 3,
                      py: 1,
                      borderRadius: 2,
                      fontWeight: 600,
                    }}
                  >
                    Filter
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Paper>

          {/* Main Content - Two Columns */}
          <Grid container spacing={3}>
            {/* Left Column - Exhibitors List */}
            <Grid item xs={12} lg={8}>
              <Paper sx={{ bgcolor: '#1e293b', borderRadius: 3, overflow: 'hidden' }}>
                <Box sx={{ p: 3, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                  <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: '18px' }}>
                    Approved Exhibitors ({filteredExhibitors.length})
                  </Typography>
                </Box>
                
                <Box sx={{ maxHeight: '600px', overflowY: 'auto' }}>
                  {filteredExhibitors.length === 0 ? (
                    <Box sx={{ p: 6, textAlign: 'center' }}>
                      <AssignmentIcon sx={{ fontSize: 64, color: '#94a3b8', mb: 3, opacity: 0.5 }} />
                      <Typography sx={{ color: '#94a3b8', mb: 1, fontSize: '18px' }}>
                        {showUnassignedOnly ? 'All exhibitors have been assigned booths!' : 'No exhibitors found'}
                      </Typography>
                      <Typography sx={{ color: '#64748b', fontSize: '14px' }}>
                        {showUnassignedOnly 
                          ? 'Great job! All approved exhibitors have booth assignments.'
                          : searchQuery ? 'Try a different search term' : 'No approved exhibitors available'}
                      </Typography>
                    </Box>
                  ) : (
                    <TableContainer>
                      <Table>
                        <TableHead>
                          <TableRow sx={{ bgcolor: '#334155' }}>
                            <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Exhibitor</TableCell>
                            <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Company</TableCell>
                            <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Booth</TableCell>
                            <TableCell sx={{ color: '#fff', fontWeight: 700, textAlign: 'center' }}>Actions</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {filteredExhibitors.map((exhibitor) => (
                            <TableRow 
                              key={exhibitor._id || exhibitor.id}
                              sx={{ 
                                '&:hover': { bgcolor: 'rgba(255,255,255,0.02)' },
                                borderBottom: '1px solid rgba(255,255,255,0.05)'
                              }}
                            >
                              <TableCell sx={{ color: '#fff', py: 2 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                  <Avatar sx={{ bgcolor: alpha('#6366f1', 0.2), color: '#6366f1', width: 40, height: 40 }}>
                                    <PersonIcon />
                                  </Avatar>
                                  <Box>
                                    <Typography sx={{ fontWeight: 600, fontSize: '14px' }}>
                                      {exhibitor.name}
                                    </Typography>
                                    <Typography sx={{ color: '#94a3b8', fontSize: '12px' }}>
                                      {exhibitor.email}
                                    </Typography>
                                  </Box>
                                </Box>
                              </TableCell>
                              
                              <TableCell sx={{ color: '#94a3b8', py: 2 }}>
                                {exhibitor.company || '—'}
                              </TableCell>
                              
                              <TableCell sx={{ py: 2 }}>
                                {exhibitor.boothNumber ? (
                                  <Chip
                                    icon={<BoothIcon />}
                                    label={`Booth ${exhibitor.boothNumber}`}
                                    sx={{
                                      bgcolor: alpha('#10b981', 0.1),
                                      color: '#10b981',
                                      fontWeight: 600,
                                    }}
                                  />
                                ) : (
                                  <Chip
                                    label="Unassigned"
                                    sx={{
                                      bgcolor: alpha('#f59e0b', 0.1),
                                      color: '#f59e0b',
                                      fontWeight: 600,
                                    }}
                                  />
                                )}
                              </TableCell>
                              
                              <TableCell sx={{ py: 2 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                                  {exhibitor.boothNumber ? (
                                    <>
                                      <Tooltip title="View Booth">
                                        <IconButton
                                          size="small"
                                          sx={{ 
                                            color: '#6366f1',
                                            bgcolor: alpha('#6366f1', 0.1),
                                          }}
                                        >
                                          <ViewIcon fontSize="small" />
                                        </IconButton>
                                      </Tooltip>
                                      
                                      <Tooltip title="Remove Booth">
                                        <IconButton
                                          size="small"
                                          onClick={() => handleRemoveBooth(exhibitor._id || exhibitor.id)}
                                          sx={{ 
                                            color: '#ef4444',
                                            bgcolor: alpha('#ef4444', 0.1),
                                          }}
                                        >
                                          <DeleteIcon fontSize="small" />
                                        </IconButton>
                                      </Tooltip>
                                    </>
                                  ) : (
                                    <Button
                                      variant="contained"
                                      startIcon={<AssignmentIcon />}
                                      onClick={() => handleBoothAssignment(exhibitor)}
                                      size="small"
                                      sx={{
                                        bgcolor: '#6366f1',
                                        color: '#fff',
                                        px: 2,
                                        py: 0.5,
                                        borderRadius: 1,
                                        fontWeight: 600,
                                        fontSize: '12px',
                                        '&:hover': { bgcolor: '#575de8' }
                                      }}
                                    >
                                      Assign Booth
                                    </Button>
                                  )}
                                </Box>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}
                </Box>
              </Paper>
            </Grid>

            {/* Right Column - Booth Layout Preview */}
            <Grid item xs={12} lg={4}>
              <Paper sx={{ bgcolor: '#1e293b', borderRadius: 3, height: '100%' }}>
                <Box sx={{ p: 3, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                  <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: '18px' }}>
                    Booth Layout Preview
                  </Typography>
                </Box>
                
                <Box sx={{ p: 3 }}>
                  {!selectedExpo ? (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <BoothIcon sx={{ fontSize: 48, color: '#94a3b8', mb: 2, opacity: 0.5 }} />
                      <Typography sx={{ color: '#94a3b8', mb: 1 }}>
                        Select an Expo to view booth layout
                      </Typography>
                    </Box>
                  ) : boothLayout.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <BoothIcon sx={{ fontSize: 48, color: '#94a3b8', mb: 2, opacity: 0.5 }} />
                      <Typography sx={{ color: '#94a3b8', mb: 1 }}>
                        No booth data available
                      </Typography>
                      <Typography sx={{ color: '#64748b', fontSize: '14px' }}>
                        This expo doesn't have any booths configured
                      </Typography>
                    </Box>
                  ) : (
                    <>
                      <Typography sx={{ color: '#94a3b8', fontSize: '14px', mb: 2 }}>
                        Available Booths: {getAvailableBooths().length}
                      </Typography>
                      
                      <Grid container spacing={1}>
                        {boothLayout.slice(0, 20).map((booth) => (
                          <Grid item xs={3} key={booth.number}>
                            <Tooltip 
                              title={
                                booth.exhibitor 
                                  ? `Assigned to: ${booth.exhibitor.name}`
                                  : `Booth ${booth.number} - ${booth.status}`
                              }
                            >
                              <Box
                                sx={{
                                  aspectRatio: '1',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  bgcolor: booth.exhibitor 
                                    ? alpha('#10b981', 0.2) 
                                    : booth.status === 'available'
                                    ? alpha('#6366f1', 0.1)
                                    : alpha('#94a3b8', 0.1),
                                  border: `2px solid ${
                                    booth.exhibitor 
                                      ? '#10b981' 
                                      : booth.status === 'available'
                                      ? '#6366f1'
                                      : '#94a3b8'
                                  }`,
                                  borderRadius: 1,
                                  position: 'relative',
                                  cursor: 'pointer',
                                  '&:hover': {
                                    transform: 'scale(1.05)',
                                    transition: 'transform 0.2s',
                                  }
                                }}
                              >
                                <Typography 
                                  sx={{ 
                                    color: booth.exhibitor ? '#10b981' : booth.status === 'available' ? '#6366f1' : '#94a3b8',
                                    fontWeight: 600,
                                    fontSize: '12px',
                                  }}
                                >
                                  {booth.number}
                                </Typography>
                                
                                {booth.exhibitor && (
                                  <Box
                                    sx={{
                                      position: 'absolute',
                                      top: 2,
                                      right: 2,
                                      width: 8,
                                      height: 8,
                                      bgcolor: '#10b981',
                                      borderRadius: '50%',
                                    }}
                                  />
                                )}
                              </Box>
                            </Tooltip>
                          </Grid>
                        ))}
                      </Grid>
                      
                      {boothLayout.length > 20 && (
                        <Typography sx={{ color: '#94a3b8', fontSize: '12px', mt: 2, textAlign: 'center' }}>
                          + {boothLayout.length - 20} more booths
                        </Typography>
                      )}
                      
                      <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                        <Typography sx={{ color: '#94a3b8', fontSize: '12px', mb: 1 }}>
                          Legend
                        </Typography>
                        <Grid container spacing={1}>
                          <Grid item xs={6}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Box sx={{ width: 12, height: 12, bgcolor: '#10b981', borderRadius: '50%' }} />
                              <Typography sx={{ color: '#94a3b8', fontSize: '11px' }}>
                                Assigned
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={6}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Box sx={{ width: 12, height: 12, bgcolor: '#6366f1', borderRadius: '50%' }} />
                              <Typography sx={{ color: '#94a3b8', fontSize: '11px' }}>
                                Available
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={6}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Box sx={{ width: 12, height: 12, bgcolor: '#94a3b8', borderRadius: '50%' }} />
                              <Typography sx={{ color: '#94a3b8', fontSize: '11px' }}>
                                Unavailable
                              </Typography>
                            </Box>
                          </Grid>
                        </Grid>
                      </Box>
                    </>
                  )}
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </Box>

      {/* Booth Assignment Dialog */}
      <Dialog
        open={boothDialogOpen}
        onClose={() => setBoothDialogOpen(false)}
        PaperProps={{
          sx: { bgcolor: '#1e293b', borderRadius: 3, width: '500px' }
        }}
      >
        <DialogTitle sx={{ color: '#fff', fontWeight: 700, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <AssignmentIcon sx={{ color: '#6366f1' }} />
            Assign Booth
          </Box>
        </DialogTitle>
        
        <DialogContent sx={{ pt: 3 }}>
          {selectedExhibitor && (
            <Box sx={{ mb: 3, p: 2, bgcolor: 'rgba(255,255,255,0.02)', borderRadius: 1 }}>
              <Typography sx={{ color: '#fff', fontWeight: 600, mb: 1 }}>
                {selectedExhibitor.name}
              </Typography>
              <Typography sx={{ color: '#94a3b8', fontSize: '14px' }}>
                {selectedExhibitor.company} • {selectedExhibitor.email}
              </Typography>
            </Box>
          )}
          
          <Typography sx={{ color: '#94a3b8', mb: 2 }}>
            Select a booth to assign:
          </Typography>
          
          {getAvailableBooths().length === 0 ? (
            <Alert severity="warning" sx={{ bgcolor: alpha('#f59e0b', 0.1), color: '#f59e0b' }}>
              No available booths in the selected expo. Please add more booths first.
            </Alert>
          ) : (
            <Grid container spacing={1} sx={{ mb: 2 }}>
              {getAvailableBooths().slice(0, 12).map((booth) => (
                <Grid item xs={3} key={booth.number}>
                  <Box
                    onClick={() => setSelectedBooth(booth.number)}
                    sx={{
                      aspectRatio: '1',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: selectedBooth === booth.number ? '#6366f1' : alpha('#6366f1', 0.1),
                      border: `2px solid ${selectedBooth === booth.number ? '#6366f1' : 'transparent'}`,
                      borderRadius: 1,
                      cursor: 'pointer',
                      '&:hover': {
                        bgcolor: selectedBooth === booth.number ? '#575de8' : alpha('#6366f1', 0.2),
                      }
                    }}
                  >
                    <Typography sx={{ color: selectedBooth === booth.number ? '#fff' : '#6366f1', fontWeight: 600 }}>
                      {booth.number}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          )}
          
          <FormControl fullWidth>
            <InputLabel sx={{ color: '#94a3b8' }}>Or select from dropdown</InputLabel>
            <Select
              value={selectedBooth}
              onChange={(e) => setSelectedBooth(e.target.value)}
              label="Or select from dropdown"
              sx={{
                bgcolor: '#334155',
                color: '#fff',
                borderRadius: 1,
                mt: 1,
              }}
            >
              {getAvailableBooths().map((booth) => (
                <MenuItem key={booth.number} value={booth.number}>
                  Booth {booth.number} - {booth.size} (${booth.price})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        
        <DialogActions sx={{ px: 3, pb: 3, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <Button
            onClick={() => setBoothDialogOpen(false)}
            sx={{ 
              color: '#94a3b8',
              px: 3,
              py: 1
            }}
          >
            Cancel
          </Button>
          
          <Button
            onClick={handleAssignBooth}
            variant="contained"
            disabled={!selectedBooth || getAvailableBooths().length === 0}
            sx={{ 
              bgcolor: '#6366f1', 
              color: '#fff',
              px: 4,
              py: 1,
              borderRadius: 2,
              fontWeight: 600,
              '&:hover': { bgcolor: '#575de8' },
              '&.Mui-disabled': {
                bgcolor: '#374151',
                color: '#94a3b8',
              }
            }}
          >
            Assign Booth
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BoothAssignment;
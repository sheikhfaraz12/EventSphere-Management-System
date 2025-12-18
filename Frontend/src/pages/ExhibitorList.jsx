import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getExhibitors, deleteExhibitor, searchExhibitors } from "../services/api.js";
import Sidebar from '../pages/components/Sidebar.jsx';
import {
  Box,
  Button,
  Typography,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Alert,
  CircularProgress,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Tooltip,
  alpha,
  Card,
  CardContent,
  Grid,
} from '@mui/material';
import {
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Chair as ChairIcon,
  Visibility as VisibilityIcon,
  Refresh as RefreshIcon,
  FilterList as FilterListIcon,
} from '@mui/icons-material';

const ExhibitorList = () => {
  const navigate = useNavigate();
  const [exhibitors, setExhibitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedExhibitor, setSelectedExhibitor] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // Fetch exhibitors on component mount
  useEffect(() => {
    fetchExhibitors();
  }, []);

  const fetchExhibitors = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await getExhibitors();
      console.log(response); // Check the structure of response
      if (Array.isArray(response.data)) {
        setExhibitors(response.data);
      } else {
        throw new Error("Exhibitors data is not in an expected array format.");
      }
    } catch (error) {
      console.error('Failed to fetch exhibitors:', error);
      setError('Failed to load exhibitors. Please check if the backend is running and accessible.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (searchQuery.trim() === '') {
      fetchExhibitors();
    } else {
      try {
        setLoading(true);
        const results = await searchExhibitors(searchQuery);
        if (Array.isArray(results.data)) {
          setExhibitors(results.data); // Ensure it's an array
        } else {
          setError('Search returned invalid data.');
        }
      } catch (error) {
        console.error('Search error:', error);
        setError('Search failed. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDeleteClick = (exhibitor) => {
    setSelectedExhibitor(exhibitor);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedExhibitor) return;
    
    try {
      await deleteExhibitor(selectedExhibitor._id || selectedExhibitor.id);
      setExhibitors(exhibitors.filter(e => e._id !== selectedExhibitor._id && e.id !== selectedExhibitor.id));
      setDeleteDialogOpen(false);
      setSelectedExhibitor(null);
    } catch (error) {
      setError('Failed to delete exhibitor. Please try again.');
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setSelectedExhibitor(null);
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
      case 'approved':
        return '#10b981';
      case 'pending':
        return '#f59e0b';
      case 'rejected':
      case 'inactive':
        return '#ef4444';
      default:
        return '#6366f1';
    }
  };

  const getStatusLabel = (status) => {
    return status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Unknown';
  };

  if (loading && exhibitors.length === 0) {
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
            <Typography sx={{ color: '#fff' }}>Loading exhibitors...</Typography>
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
        <Box sx={{ maxWidth: '1400px', mx: 'auto' }}>
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
              Exhibitor Management
            </Typography>
            <Typography sx={{ color: '#94a3b8', fontSize: '16px' }}>
              View and manage all exhibitor registrations
            </Typography>
          </Box>

          {/* Stats Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ bgcolor: '#334155', borderRadius: 3 }}>
                <CardContent>
                  <Typography sx={{ color: '#94a3b8', fontSize: '14px', mb: 1 }}>
                    Total Exhibitors
                  </Typography>
                  <Typography variant="h4" sx={{ color: '#fff', fontWeight: 700 }}>
                    {exhibitors.length}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ bgcolor: '#334155', borderRadius: 3 }}>
                <CardContent>
                  <Typography sx={{ color: '#94a3b8', fontSize: '14px', mb: 1 }}>
                    Approved
                  </Typography>
                  <Typography variant="h4" sx={{ color: '#10b981', fontWeight: 700 }}>
                    {exhibitors.filter(e => e.status === 'approved').length}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ bgcolor: '#334155', borderRadius: 3 }}>
                <CardContent>
                  <Typography sx={{ color: '#94a3b8', fontSize: '14px', mb: 1 }}>
                    Pending
                  </Typography>
                  <Typography variant="h4" sx={{ color: '#f59e0b', fontWeight: 700 }}>
                    {exhibitors.filter(e => e.status === 'pending').length}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ bgcolor: '#334155', borderRadius: 3 }}>
                <CardContent>
                  <Typography sx={{ color: '#94a3b8', fontSize: '14px', mb: 1 }}>
                    With Booths
                  </Typography>
                  <Typography variant="h4" sx={{ color: '#6366f1', fontWeight: 700 }}>
                    {exhibitors.filter(e => e.boothNumber).length}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Error Alert */}
          {error && (
            <Alert 
              severity="error" 
              sx={{ mb: 3 }}
              onClose={() => setError('')}
            >
              {error}
            </Alert>
          )}

          {/* Search and Action Bar */}
          <Paper sx={{ p: 3, mb: 3, bgcolor: '#1e293b', borderRadius: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
              <TextField
                placeholder="Search exhibitors by name, company, or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                sx={{ 
                  flexGrow: 1,
                  '& .MuiOutlinedInput-root': {
                    bgcolor: '#334155',
                    color: '#fff',
                    borderRadius: 2,
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#6366f1',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: '#94a3b8',
                  },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: '#94a3b8' }} />
                    </InputAdornment>
                  ),
                }}
              />
              
              <Button
                variant="contained"
                onClick={handleSearch}
                sx={{
                  bgcolor: '#6366f1',
                  color: '#fff',
                  px: 3,
                  py: 1.5,
                  borderRadius: 2,
                  fontWeight: 600,
                  '&:hover': { bgcolor: '#575de8' },
                }}
              >
                Search
              </Button>
              
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={fetchExhibitors}
                sx={{
                  borderColor: '#94a3b8',
                  color: '#94a3b8',
                  px: 3,
                  py: 1.5,
                  borderRadius: 2,
                  fontWeight: 600,
                }}
              >
                Refresh
              </Button>
              
              <Button
                variant="outlined"
                startIcon={<FilterListIcon />}
                sx={{
                  borderColor: '#94a3b8',
                  color: '#94a3b8',
                  px: 3,
                  py: 1.5,
                  borderRadius: 2,
                  fontWeight: 600,
                }}
              >
                Filter
              </Button>
            </Box>
          </Paper>

          {/* Exhibitors Table */}
          <Paper sx={{ bgcolor: '#1e293b', borderRadius: 3, overflow: 'hidden' }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#334155' }}>
                    <TableCell sx={{ color: '#fff', fontWeight: 700, fontSize: '15px', py: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <PersonIcon sx={{ mr: 1, color: '#6366f1' }} />
                        Exhibitor
                      </Box>
                    </TableCell>
                    <TableCell sx={{ color: '#fff', fontWeight: 700, fontSize: '15px', py: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <BusinessIcon sx={{ mr: 1, color: '#6366f1' }} />
                        Company
                      </Box>
                    </TableCell>
                    <TableCell sx={{ color: '#fff', fontWeight: 700, fontSize: '15px', py: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <EmailIcon sx={{ mr: 1, color: '#6366f1' }} />
                        Contact
                      </Box>
                    </TableCell>
                    <TableCell sx={{ color: '#fff', fontWeight: 700, fontSize: '15px', py: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <ChairIcon sx={{ mr: 1, color: '#6366f1' }} />
                        Booth
                      </Box>
                    </TableCell>
                    <TableCell sx={{ color: '#fff', fontWeight: 700, fontSize: '15px', py: 2 }}>
                      Status
                    </TableCell>
                    <TableCell sx={{ color: '#fff', fontWeight: 700, fontSize: '15px', py: 2, textAlign: 'center' }}>
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {exhibitors.length > 0 ? (
                    exhibitors.map((exhibitor) => (
                      <TableRow 
                        key={exhibitor._id || exhibitor.id}
                        sx={{ 
                          '&:hover': { bgcolor: 'rgba(255,255,255,0.02)' },
                          borderBottom: '1px solid rgba(255,255,255,0.05)'
                        }}
                      >
                        <TableCell sx={{ color: '#fff', py: 2.5 }}>
                          <Box>
                            <Typography sx={{ fontWeight: 600, mb: 0.5 }}>
                              {exhibitor.name}
                            </Typography>
                            {exhibitor.category && (
                              <Chip
                                label={exhibitor.category}
                                size="small"
                                sx={{
                                  bgcolor: alpha('#6366f1', 0.1),
                                  color: '#6366f1',
                                  fontWeight: 500,
                                  fontSize: '11px',
                                }}
                              />
                            )}
                          </Box>
                        </TableCell>
                        <TableCell sx={{ color: '#94a3b8', py: 2.5 }}>
                          {exhibitor.company || '—'}
                        </TableCell>
                        <TableCell sx={{ color: '#94a3b8', py: 2.5 }}>
                          <Box>
                            <Typography sx={{ fontSize: '14px' }}>
                              {exhibitor.email}
                            </Typography>
                            {exhibitor.phone && (
                              <Typography sx={{ fontSize: '13px', color: '#94a3b8' }}>
                                <PhoneIcon sx={{ fontSize: '12px', verticalAlign: 'middle', mr: 0.5 }} />
                                {exhibitor.phone}
                              </Typography>
                            )}
                          </Box>
                        </TableCell>
                        <TableCell sx={{ color: '#fff', py: 2.5 }}>
                          {exhibitor.boothNumber ? (
                            <Chip
                              label={`Booth ${exhibitor.boothNumber}`}
                              sx={{
                                bgcolor: alpha('#10b981', 0.1),
                                color: '#10b981',
                                fontWeight: 600,
                              }}
                            />
                          ) : (
                            <Typography sx={{ color: '#94a3b8' }}>Not assigned</Typography>
                          )}
                        </TableCell>
                        <TableCell sx={{ py: 2.5 }}>
                          <Chip
                            label={getStatusLabel(exhibitor.status)}
                            sx={{
                              bgcolor: alpha(getStatusColor(exhibitor.status), 0.1),
                              color: getStatusColor(exhibitor.status),
                              fontWeight: 600,
                            }}
                          />
                        </TableCell>
                        <TableCell sx={{ py: 2.5 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                            <Tooltip title="View Details">
                              <IconButton
                                onClick={() => navigate(`/exhibitor/${exhibitor._id || exhibitor.id}`)}
                                sx={{ 
                                  color: '#6366f1',
                                  bgcolor: alpha('#6366f1', 0.1),
                                  '&:hover': { bgcolor: alpha('#6366f1', 0.2) }
                                }}
                              >
                                <VisibilityIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            

                            <Tooltip title="Edit">
                              <IconButton
                                onClick={() => navigate(`/edit-exhibitor/${exhibitor._id || exhibitor.id}`)}
                                sx={{ 
                                  color: '#10b981',
                                  bgcolor: alpha('#10b981', 0.1),
                                  '&:hover': { bgcolor: alpha('#10b981', 0.2) }
                                }}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            
                            <Tooltip title="Delete">
                              <IconButton
                                onClick={() => handleDeleteClick(exhibitor)}
                                sx={{ 
                                  color: '#ef4444',
                                  bgcolor: alpha('#ef4444', 0.1),
                                  '&:hover': { bgcolor: alpha('#ef4444', 0.2) }
                                }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} sx={{ textAlign: 'center', py: 6 }}>
                        <Box sx={{ textAlign: 'center' }}>
                          <PersonIcon sx={{ fontSize: 48, color: '#94a3b8', mb: 2, opacity: 0.5 }} />
                          <Typography sx={{ color: '#94a3b8', mb: 1 }}>
                            No exhibitors found
                          </Typography>
                          <Typography sx={{ color: '#64748b', fontSize: '14px' }}>
                            {searchQuery ? 'Try a different search term' : 'No exhibitors registered yet'}
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>

          {/* Pagination/Info */}
          {/* You can add pagination and info here if needed */}
        </Box>

        {/* Delete Dialog */}
        <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
          <DialogTitle>Confirm Deletion</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete this exhibitor? This action cannot be undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDeleteCancel}>Cancel</Button>
            <Button onClick={handleDeleteConfirm} sx={{ color: '#ef4444' }}>Delete</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
};

export default ExhibitorList;

import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Button,
  IconButton,
  Chip,
  TextField,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Card,
  CardContent,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Tooltip,
  Menu,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import {
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Add as AddIcon,
  CalendarToday as CalendarIcon,
  LocationOn as LocationIcon,
  Category as CategoryIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
  MoreVert as MoreVertIcon,
  CheckCircle as CheckCircleIcon,
  Publish as PublishIcon,
  PlayCircle as PlayCircleIcon,
  DoneAll as DoneAllIcon,
} from "@mui/icons-material";
import Sidebar from "./components/Sidebar";
import { getExpos, deleteExpo, updateExpo } from "../services/api";

const ViewExpo = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [expos, setExpos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [expoToDelete, setExpoToDelete] = useState(null);
  const [statusMenuAnchor, setStatusMenuAnchor] = useState(null);
  const [selectedExpo, setSelectedExpo] = useState(null);
  
  // Table state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [themeFilter, setThemeFilter] = useState("all");
  
  // Stats
  const [stats, setStats] = useState({
    total: 0,
    draft: 0,
    published: 0,
    active: 0,
    completed: 0,
  });

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // Fetch expos from API
  const fetchExpos = async () => {
    setLoading(true);
    setError("");
    
    try {
      const response = await getExpos();
      console.log('📥 Full API response:', response);
      
      // Extract data from response.data.data
      const exposData = response.data ? response.data.data : response.data || [];
      console.log('📦 Extracted expos:', exposData);
      
      setExpos(exposData || []);
      calculateStats(exposData || []);
    } catch (error) {
      console.error('❌ Error fetching expos:', error);
      setError("Failed to load expos. Please try again.");
      setExpos([]);
    } finally {
      setLoading(false);
    }
  };

  // Calculate statistics
  const calculateStats = (expoList) => {
    const stats = {
      total: expoList.length,
      draft: expoList.filter(e => e.status === 'draft').length,
      published: expoList.filter(e => e.status === 'published').length,
      active: expoList.filter(e => e.status === 'active').length,
      completed: expoList.filter(e => e.status === 'completed').length,
    };
    setStats(stats);
  };

  useEffect(() => {
    fetchExpos();
  }, []);

  // Handle status change
  const handleStatusChange = async (expoId, newStatus) => {
    try {
      // Find the expo
      const expoToUpdate = expos.find(e => e._id === expoId || e.id === expoId);
      if (!expoToUpdate) return;
      
      // Update locally first for instant feedback
      const updatedExpos = expos.map(expo => 
        (expo._id === expoId || expo.id === expoId) 
          ? { ...expo, status: newStatus }
          : expo
      );
      setExpos(updatedExpos);
      calculateStats(updatedExpos);
      
      // Send update to backend
      await updateExpo(expoId, { status: newStatus });
      
      console.log(`✅ Status changed to ${newStatus}`);
    } catch (error) {
      console.error('❌ Error updating status:', error);
      setError("Failed to update status. Please try again.");
      // Revert on error
      fetchExpos();
    } finally {
      setStatusMenuAnchor(null);
      setSelectedExpo(null);
    }
  };

  // Open status menu
  const handleStatusMenuOpen = (event, expo) => {
    setStatusMenuAnchor(event.currentTarget);
    setSelectedExpo(expo);
  };

  const handleStatusMenuClose = () => {
    setStatusMenuAnchor(null);
    setSelectedExpo(null);
  };

  // Handle delete confirmation
  const handleDeleteClick = (expo) => {
    setExpoToDelete(expo);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!expoToDelete) return;
    
    try {
      await deleteExpo(expoToDelete._id || expoToDelete.id);
      
      // Filter out the deleted expo
      setExpos(expos.filter(e => 
        e._id !== expoToDelete._id && 
        e.id !== expoToDelete.id
      ));
      
      setDeleteDialogOpen(false);
      setExpoToDelete(null);
      
      // Show success message
      alert("Expo deleted successfully!");
    } catch (error) {
      console.error('❌ Error deleting expo:', error);
      
      // Check if error has response data
      if (error.response?.data?.error) {
        setError(`Failed: ${error.response.data.error}`);
      } else {
        setError("Failed to delete expo. Please try again.");
      }
    }
  };

  // Status options with icons
  const statusOptions = [
    { 
      value: 'draft', 
      label: 'Draft', 
      icon: <CheckCircleIcon fontSize="small" sx={{ mr: 1, color: '#f59e0b' }} />,
      description: 'Work in progress',
      color: 'warning'
    },
    { 
      value: 'published', 
      label: 'Published', 
      icon: <PublishIcon fontSize="small" sx={{ mr: 1, color: '#3b82f6' }} />,
      description: 'Visible to public',
      color: 'info'
    },
    { 
      value: 'active', 
      label: 'Active', 
      icon: <PlayCircleIcon fontSize="small" sx={{ mr: 1, color: '#10b981' }} />,
      description: 'Event is live',
      color: 'success'
    },
    { 
      value: 'completed', 
      label: 'Completed', 
      icon: <DoneAllIcon fontSize="small" sx={{ mr: 1, color: '#6b7280' }} />,
      description: 'Event has ended',
      color: 'default'
    },
  ];

  // Get next status options (logical progression)
  const getNextStatusOptions = (currentStatus) => {
    switch(currentStatus) {
      case 'draft': 
        return statusOptions.filter(opt => opt.value === 'published' || opt.value === 'draft');
      case 'published':
        return statusOptions.filter(opt => opt.value === 'active' || opt.value === 'published' || opt.value === 'draft');
      case 'active':
        return statusOptions.filter(opt => opt.value === 'completed' || opt.value === 'active' || opt.value === 'published');
      case 'completed':
        return statusOptions.filter(opt => opt.value === 'completed' || opt.value === 'published');
      default:
        return statusOptions;
    }
  };

  // Filter expos based on search and filters
  const filteredExpos = expos.filter((expo) => {
    // Search filter
    const matchesSearch = searchTerm === "" || 
      expo.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expo.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expo.organizer?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Status filter
    const matchesStatus = statusFilter === "all" || expo.status === statusFilter;
    
    // Theme filter
    const matchesTheme = themeFilter === "all" || expo.theme === themeFilter;
    
    return matchesSearch && matchesStatus && matchesTheme;
  });

  // Pagination
  const paginatedExpos = filteredExpos.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'draft': return 'warning';
      case 'published': return 'info';
      case 'active': return 'success';
      case 'completed': return 'default';
      default: return 'default';
    }
  };

  // Status options for filter dropdown
  const filterStatusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'draft', label: 'Draft' },
    { value: 'published', label: 'Published' },
    { value: 'active', label: 'Active' },
    { value: 'completed', label: 'Completed' },
  ];

  // Theme options
  const themeOptions = [
    { value: 'all', label: 'All Themes' },
    { value: 'Technology', label: 'Technology' },
    { value: 'Healthcare', label: 'Healthcare' },
    { value: 'Education', label: 'Education' },
    { value: 'Business', label: 'Business' },
    { value: 'Entertainment', label: 'Entertainment' },
    { value: 'Startup', label: 'Startup' },
    { value: 'Innovation', label: 'Innovation' },
    { value: 'Networking', label: 'Networking' },
  ];

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
          {/* Page Header */}
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h4" sx={{ color: "#fff", fontWeight: 800 }}>
                Expo Management
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => navigate("/addexpo")}
                sx={{
                  bgcolor: '#6366f1',
                  color: '#fff',
                  px: 3,
                  py: 1.2,
                  borderRadius: 2,
                  fontWeight: 600,
                  '&:hover': { bgcolor: '#575de8' },
                }}
              >
                Create New Expo
              </Button>
            </Box>
            <Typography sx={{ color: "#94a3b8", fontSize: "16px" }}>
              Manage and monitor all your expos in one place
            </Typography>
          </Box>

          {/* Stats Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={2.4}>
              <Card sx={{ bgcolor: '#1e293b', borderRadius: 2, height: '100%' }}>
                <CardContent>
                  <Typography sx={{ color: '#94a3b8', fontSize: '14px', mb: 1 }}>
                    Total Expos
                  </Typography>
                  <Typography variant="h4" sx={{ color: '#fff', fontWeight: 700 }}>
                    {stats.total}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={2.4}>
              <Card sx={{ bgcolor: '#1e293b', borderRadius: 2, height: '100%' }}>
                <CardContent>
                  <Typography sx={{ color: '#94a3b8', fontSize: '14px', mb: 1 }}>
                    Draft
                  </Typography>
                  <Typography variant="h4" sx={{ color: '#f59e0b', fontWeight: 700 }}>
                    {stats.draft}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={2.4}>
              <Card sx={{ bgcolor: '#1e293b', borderRadius: 2, height: '100%' }}>
                <CardContent>
                  <Typography sx={{ color: '#94a3b8', fontSize: '14px', mb: 1 }}>
                    Published
                  </Typography>
                  <Typography variant="h4" sx={{ color: '#3b82f6', fontWeight: 700 }}>
                    {stats.published}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={2.4}>
              <Card sx={{ bgcolor: '#1e293b', borderRadius: 2, height: '100%' }}>
                <CardContent>
                  <Typography sx={{ color: '#94a3b8', fontSize: '14px', mb: 1 }}>
                    Active
                  </Typography>
                  <Typography variant="h4" sx={{ color: '#10b981', fontWeight: 700 }}>
                    {stats.active}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={2.4}>
              <Card sx={{ bgcolor: '#1e293b', borderRadius: 2, height: '100%' }}>
                <CardContent>
                  <Typography sx={{ color: '#94a3b8', fontSize: '14px', mb: 1 }}>
                    Completed
                  </Typography>
                  <Typography variant="h4" sx={{ color: '#8b5cf6', fontWeight: 700 }}>
                    {stats.completed}
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
              onClose={() => setError("")}
            >
              {error}
            </Alert>
          )}

          {/* Filters and Search */}
          <Paper sx={{ p: 3, mb: 3, bgcolor: '#1e293b', borderRadius: 3 }}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center', mb: 2 }}>
              <TextField
                placeholder="Search expos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                sx={{ 
                  flexGrow: 1,
                  minWidth: '250px',
                  '& .MuiOutlinedInput-root': {
                    bgcolor: '#334155',
                    color: '#fff',
                  },
                  '& .MuiInputLabel-root': {
                    color: '#94a3b8',
                  }
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: '#94a3b8' }} />
                    </InputAdornment>
                  ),
                }}
              />
              
              <FormControl sx={{ minWidth: 150 }}>
                <InputLabel sx={{ color: '#94a3b8' }}>Status</InputLabel>
                <Select
                  value={statusFilter}
                  label="Status"
                  onChange={(e) => setStatusFilter(e.target.value)}
                  sx={{ 
                    bgcolor: '#334155',
                    color: '#fff',
                    '& .MuiSelect-icon': { color: '#94a3b8' }
                  }}
                >
                  {filterStatusOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <FormControl sx={{ minWidth: 150 }}>
                <InputLabel sx={{ color: '#94a3b8' }}>Theme</InputLabel>
                <Select
                  value={themeFilter}
                  label="Theme"
                  onChange={(e) => setThemeFilter(e.target.value)}
                  sx={{ 
                    bgcolor: '#334155',
                    color: '#fff',
                    '& .MuiSelect-icon': { color: '#94a3b8' }
                  }}
                >
                  {themeOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={fetchExpos}
                sx={{ 
                  borderColor: '#6366f1',
                  color: '#6366f1',
                  px: 3,
                  '&:hover': { borderColor: '#575de8' }
                }}
              >
                Refresh
              </Button>
            </Box>
            
            <Typography sx={{ color: '#94a3b8', fontSize: '14px' }}>
              Showing {filteredExpos.length} of {expos.length} expos
            </Typography>
          </Paper>

          {/* Expos Table */}
          <Paper sx={{ bgcolor: '#1e293b', borderRadius: 3, overflow: 'hidden' }}>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                <CircularProgress sx={{ color: '#6366f1' }} />
              </Box>
            ) : filteredExpos.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography sx={{ color: '#94a3b8', mb: 2 }}>
                  {expos.length === 0 ? 'No expos found. Create your first expo!' : 'No expos match your filters.'}
                </Typography>
                {expos.length === 0 && (
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => navigate("/addexpo")}
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
                    Create First Expo
                  </Button>
                )}
              </Box>
            ) : (
              <>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ bgcolor: '#334155' }}>
                        <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Expo Title</TableCell>
                        <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Date</TableCell>
                        <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Location</TableCell>
                        <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Theme</TableCell>
                        <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Booths</TableCell>
                        <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Status</TableCell>
                        <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Organizer</TableCell>
                        <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {paginatedExpos.map((expo) => (
                        <TableRow 
                          key={expo._id || expo.id}
                          sx={{ 
                            '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' },
                            borderBottom: '1px solid rgba(255,255,255,0.1)'
                          }}
                        >
                          <TableCell sx={{ color: '#fff' }}>
                            <Typography sx={{ fontWeight: 600, mb: 0.5 }}>
                              {expo.title}
                            </Typography>
                            <Typography sx={{ color: '#94a3b8', fontSize: '12px' }}>
                              Created: {formatDate(expo.createdAt)}
                            </Typography>
                          </TableCell>
                          
                          <TableCell sx={{ color: '#fff' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <CalendarIcon sx={{ color: '#94a3b8', fontSize: '16px' }} />
                              {formatDate(expo.date)}
                            </Box>
                          </TableCell>
                          
                          <TableCell sx={{ color: '#fff' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <LocationIcon sx={{ color: '#94a3b8', fontSize: '16px' }} />
                              {expo.location || 'N/A'}
                            </Box>
                          </TableCell>
                          
                          <TableCell sx={{ color: '#fff' }}>
                            <Chip
                              label={expo.theme || 'Not set'}
                              size="small"
                              sx={{
                                bgcolor: 'rgba(99, 102, 241, 0.1)',
                                color: '#6366f1',
                                fontWeight: 500,
                              }}
                            />
                          </TableCell>
                          
                          <TableCell sx={{ color: '#fff' }}>
                            <Box>
                              <Typography sx={{ fontSize: '14px' }}>
                                Total: {expo.boothCount || expo.booths?.length || 0}
                              </Typography>
                              <Typography sx={{ color: '#94a3b8', fontSize: '12px' }}>
                                Available: {expo.availableBooths || 0}
                              </Typography>
                            </Box>
                          </TableCell>
                          
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Chip
                                label={expo.status?.toUpperCase() || 'DRAFT'}
                                size="small"
                                color={getStatusColor(expo.status)}
                                sx={{ fontWeight: 600 }}
                              />
                              <Tooltip title="Change Status">
                                <IconButton
                                  size="small"
                                  onClick={(e) => handleStatusMenuOpen(e, expo)}
                                  sx={{ 
                                    color: '#94a3b8',
                                    '&:hover': { 
                                      color: '#6366f1',
                                      bgcolor: 'rgba(99, 102, 241, 0.1)'
                                    }
                                  }}
                                >
                                  <MoreVertIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </TableCell>
                          
                          <TableCell sx={{ color: '#fff' }}>
                            {expo.organizer?.name || expo.organizer || 'N/A'}
                          </TableCell>
                          
                          <TableCell>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <Tooltip title="View Details">
                                <IconButton
                                  size="small"
                                  onClick={() => navigate(`/expo/${expo._id || expo.id}`)}
                                  sx={{ 
                                    color: '#6366f1',
                                    bgcolor: 'rgba(99, 102, 241, 0.1)',
                                    '&:hover': { bgcolor: 'rgba(99, 102, 241, 0.2)' }
                                  }}
                                >
                                  <ViewIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              
                              <Tooltip title="Edit">
                                <IconButton
                                  size="small"
                                  onClick={() => navigate(`/editexpo/${expo._id || expo.id}`)}
                                  sx={{ 
                                    color: '#10b981',
                                    bgcolor: 'rgba(16, 185, 129, 0.1)',
                                    '&:hover': { bgcolor: 'rgba(16, 185, 129, 0.2)' }
                                  }}
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              
                              <Tooltip title="Delete">
                                <IconButton
                                  size="small"
                                  onClick={() => handleDeleteClick(expo)}
                                  sx={{ 
                                    color: '#ef4444',
                                    bgcolor: 'rgba(239, 68, 68, 0.1)',
                                    '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.2)' }
                                  }}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                
                <TablePagination
                  rowsPerPageOptions={[5, 10, 25]}
                  component="div"
                  count={filteredExpos.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                  sx={{ 
                    color: '#94a3b8',
                    borderTop: '1px solid rgba(255,255,255,0.1)',
                    '& .MuiTablePagination-selectIcon': { color: '#94a3b8' }
                  }}
                />
              </>
            )}
          </Paper>
        </Box>
      </Box>

      {/* Status Change Menu */}
      <Menu
        anchorEl={statusMenuAnchor}
        open={Boolean(statusMenuAnchor)}
        onClose={handleStatusMenuClose}
        PaperProps={{
          sx: { 
            bgcolor: '#1e293b',
            color: '#fff',
            minWidth: '200px'
          }
        }}
      >
        {selectedExpo && getNextStatusOptions(selectedExpo.status).map((option) => (
          <MenuItem 
            key={option.value}
            onClick={() => handleStatusChange(selectedExpo._id || selectedExpo.id, option.value)}
            selected={selectedExpo.status === option.value}
            sx={{
              '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' },
              '&.Mui-selected': { 
                bgcolor: 'rgba(99, 102, 241, 0.2)',
                '&:hover': { bgcolor: 'rgba(99, 102, 241, 0.3)' }
              }
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
              {option.icon}
              <Box>
                <Typography sx={{ fontSize: '14px', fontWeight: 500 }}>
                  {option.label}
                </Typography>
                <Typography sx={{ color: '#94a3b8', fontSize: '12px' }}>
                  {option.description}
                </Typography>
              </Box>
            </Box>
          </MenuItem>
        ))}
      </Menu>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        PaperProps={{
          sx: { bgcolor: '#1e293b', color: '#fff' }
        }}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography sx={{ color: '#94a3b8' }}>
            Are you sure you want to delete "{expoToDelete?.title}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setDeleteDialogOpen(false)}
            sx={{ color: '#94a3b8' }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            variant="contained"
            sx={{ 
              bgcolor: '#ef4444',
              color: '#fff',
              '&:hover': { bgcolor: '#dc2626' }
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ViewExpo;
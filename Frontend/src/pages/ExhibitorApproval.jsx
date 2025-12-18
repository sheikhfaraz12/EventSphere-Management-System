import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../pages/components/Sidebar.jsx';
import { getExhibitors, updateExhibitor } from '../services/api.js';
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
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon, // Fixed: Added this import
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Work as WorkIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';

const ExhibitorApproval = () => {
  const navigate = useNavigate();
  const [exhibitors, setExhibitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedExhibitor, setSelectedExhibitor] = useState(null);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [currentAction, setCurrentAction] = useState(''); // 'approve' or 'reject'

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // Fetch exhibitors on component mount
  useEffect(() => {
    fetchExhibitors();
  }, []);

  const fetchExhibitors = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Try to fetch exhibitors
      const allExhibitors = await getExhibitors();
      
      // Filter for pending exhibitors
      const pendingExhibitors = allExhibitors.filter(exhibitor => 
        exhibitor.status === 'pending' || 
        exhibitor.status === 'Pending' || 
        !exhibitor.status
      );
      
      setExhibitors(pendingExhibitors);
    } catch (error) {
      console.error('Failed to fetch exhibitors:', error);
      
      // Check what type of error it is
      if (error.response) {
        // Server responded with error status
        if (error.response.status === 404) {
          setError('Exhibitor API endpoint not found. Please check your backend.');
        } else if (error.response.status === 500) {
          setError('Server error. Please try again later.');
        } else {
          setError(`Error ${error.response.status}: ${error.response.data?.message || 'Failed to load exhibitors'}`);
        }
      } else if (error.request) {
        // Request was made but no response
        setError('No response from server. Check your backend is running on http://localhost:3000');
      } else {
        // Something else happened
        setError('Failed to load exhibitor applications. Please check connection.');
      }
      
      // Set empty array to avoid crash
      setExhibitors([]);
    } finally {
      setLoading(false);
    }
  };

  const handleActionClick = (exhibitor, action) => {
    setSelectedExhibitor(exhibitor);
    setCurrentAction(action);
    
    if (action === 'reject') {
      setRejectionReason(''); // Reset reason for rejection
      setActionDialogOpen(true);
    } else {
      // For approve, show confirmation dialog immediately
      setActionDialogOpen(true);
    }
  };

  const handleActionConfirm = async () => {
    if (!selectedExhibitor) return;
    
    try {
      const exhibitorId = selectedExhibitor._id || selectedExhibitor.id;
      const updateData = {
        status: currentAction === 'approve' ? 'approved' : 'rejected'
      };
      
      // Add rejection reason if rejecting
      if (currentAction === 'reject' && rejectionReason) {
        updateData.rejectionReason = rejectionReason;
      }
      
      // Update exhibitor status
      await updateExhibitor(exhibitorId, updateData);
      
      // Remove from the list
      setExhibitors(exhibitors.filter(e => (e._id || e.id) !== exhibitorId));
      
      // Show success message
      const actionText = currentAction === 'approve' ? 'approved' : 'rejected';
      setSuccess(`Successfully ${actionText} ${selectedExhibitor.name || selectedExhibitor.company}`);
      
      // Close dialog and reset
      setActionDialogOpen(false);
      setSelectedExhibitor(null);
      setRejectionReason('');
      setCurrentAction('');
      
    } catch (error) {
      console.error('Failed to update exhibitor:', error);
      setError(`Failed to ${currentAction} exhibitor. Please try again.`);
    }
  };

  const handleActionCancel = () => {
    setActionDialogOpen(false);
    setSelectedExhibitor(null);
    setRejectionReason('');
    setCurrentAction('');
  };

  const getStatusColor = (status) => {
    const statusLower = status?.toLowerCase();
    switch (statusLower) {
      case 'approved':
        return '#10b981';
      case 'rejected':
        return '#ef4444';
      case 'pending':
        return '#f59e0b';
      default:
        return '#f59e0b'; // Default to pending color
    }
  };

  const getStatusLabel = (status) => {
    if (!status) return 'Pending Review';
    return status.charAt(0).toUpperCase() + status.slice(1);
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
            <Typography sx={{ color: '#fff' }}>Loading exhibitor applications...</Typography>
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
              Exhibitor Approval
            </Typography>
            <Typography sx={{ color: '#94a3b8', fontSize: '16px' }}>
              Review and approve/reject exhibitor applications
            </Typography>
          </Box>

          {/* Stats */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={4}>
              <Card sx={{ bgcolor: '#334155', borderRadius: 3 }}>
                <CardContent>
                  <Typography sx={{ color: '#94a3b8', fontSize: '14px', mb: 1 }}>
                    Pending Applications
                  </Typography>
                  <Typography variant="h4" sx={{ color: '#f59e0b', fontWeight: 700 }}>
                    {exhibitors.length}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Card sx={{ bgcolor: '#334155', borderRadius: 3 }}>
                <CardContent>
                  <Typography sx={{ color: '#94a3b8', fontSize: '14px', mb: 1 }}>
                    Require Action
                  </Typography>
                  <Typography variant="h4" sx={{ color: '#fff', fontWeight: 700 }}>
                    {exhibitors.length}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Card sx={{ bgcolor: '#334155', borderRadius: 3 }}>
                <CardContent>
                  <Typography sx={{ color: '#94a3b8', fontSize: '14px', mb: 1 }}>
                    Last Updated
                  </Typography>
                  <Typography variant="h6" sx={{ color: '#fff', fontWeight: 700 }}>
                    {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

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

          {/* Action Bar */}
          <Paper sx={{ p: 3, mb: 3, bgcolor: '#1e293b', borderRadius: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography sx={{ color: '#fff', fontWeight: 600 }}>
                {exhibitors.length} applications pending your review
              </Typography>
              
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={fetchExhibitors}
                sx={{
                  borderColor: '#94a3b8',
                  color: '#94a3b8',
                  px: 3,
                  py: 1.2,
                  borderRadius: 2,
                  fontWeight: 600,
                  '&:hover': {
                    borderColor: '#6366f1',
                    color: '#6366f1',
                  }
                }}
              >
                Refresh List
              </Button>
            </Box>
          </Paper>

          {/* Exhibitor Applications */}
          {exhibitors.length === 0 ? (
            <Paper sx={{ 
              p: 8, 
              bgcolor: '#1e293b', 
              borderRadius: 3,
              textAlign: 'center'
            }}>
              {/* FIXED: Changed CheckCircle to CheckCircleIcon */}
              <CheckCircleIcon sx={{ fontSize: 64, color: '#10b981', mb: 3, opacity: 0.5 }} />
              <Typography sx={{ color: '#94a3b8', mb: 1, fontSize: '20px' }}>
                No pending applications
              </Typography>
              <Typography sx={{ color: '#64748b', fontSize: '15px' }}>
                All exhibitor applications have been reviewed
              </Typography>
              <Button
                variant="outlined"
                onClick={() => navigate('/exhibitors')}
                sx={{
                  mt: 3,
                  borderColor: '#6366f1',
                  color: '#6366f1',
                  px: 4,
                  py: 1.5,
                  borderRadius: 2,
                  fontWeight: 600,
                }}
              >
                View All Exhibitors
              </Button>
            </Paper>
          ) : (
            <Grid container spacing={3}>
              {exhibitors.map((exhibitor) => (
                <Grid item xs={12} key={exhibitor._id || exhibitor.id}>
                  <Card sx={{ bgcolor: '#334155', borderRadius: 3 }}>
                    <CardContent sx={{ p: 3 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar sx={{ bgcolor: alpha('#f59e0b', 0.2), color: '#f59e0b', width: 60, height: 60 }}>
                            <BusinessIcon />
                          </Avatar>
                          <Box>
                            <Typography variant="h6" sx={{ color: '#fff', fontWeight: 700, mb: 0.5 }}>
                              {exhibitor.company || exhibitor.name || 'Unnamed Exhibitor'}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              {exhibitor.name && (
                                <Typography sx={{ color: '#94a3b8', fontSize: '14px' }}>
                                  <PersonIcon sx={{ fontSize: '14px', verticalAlign: 'middle', mr: 0.5 }} />
                                  {exhibitor.name}
                                </Typography>
                              )}
                              
                              <Chip
                                label={getStatusLabel(exhibitor.status)}
                                sx={{
                                  bgcolor: alpha(getStatusColor(exhibitor.status), 0.1),
                                  color: getStatusColor(exhibitor.status),
                                  fontWeight: 600,
                                  fontSize: '12px',
                                }}
                              />
                            </Box>
                          </Box>
                        </Box>
                        
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button
                            variant="contained"
                            startIcon={<ApproveIcon />}
                            onClick={() => handleActionClick(exhibitor, 'approve')}
                            sx={{
                              bgcolor: '#10b981',
                              color: '#fff',
                              px: 3,
                              py: 1,
                              borderRadius: 2,
                              fontWeight: 600,
                              '&:hover': { bgcolor: '#0da271' }
                            }}
                          >
                            Approve
                          </Button>
                          
                          <Button
                            variant="outlined"
                            startIcon={<RejectIcon />}
                            onClick={() => handleActionClick(exhibitor, 'reject')}
                            sx={{
                              borderColor: '#ef4444',
                              color: '#ef4444',
                              px: 3,
                              py: 1,
                              borderRadius: 2,
                              fontWeight: 600,
                              '&:hover': { 
                                borderColor: '#dc2626',
                                color: '#dc2626',
                                bgcolor: 'rgba(239,68,68,0.05)'
                              }
                            }}
                          >
                            Reject
                          </Button>
                        </Box>
                      </Box>

                      <Grid container spacing={3}>
                        <Grid item xs={12} md={8}>
                          {/* Exhibitor Details */}
                          <Grid container spacing={2}>
                            {exhibitor.email && (
                              <Grid item xs={12} sm={6}>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                  <EmailIcon sx={{ color: '#6366f1', mr: 2, fontSize: '20px' }} />
                                  <Box>
                                    <Typography sx={{ color: '#94a3b8', fontSize: '13px' }}>
                                      Email
                                    </Typography>
                                    <Typography sx={{ color: '#fff', fontSize: '14px' }}>
                                      {exhibitor.email}
                                    </Typography>
                                  </Box>
                                </Box>
                              </Grid>
                            )}
                            
                            {exhibitor.phone && (
                              <Grid item xs={12} sm={6}>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                  <PhoneIcon sx={{ color: '#6366f1', mr: 2, fontSize: '20px' }} />
                                  <Box>
                                    <Typography sx={{ color: '#94a3b8', fontSize: '13px' }}>
                                      Phone
                                    </Typography>
                                    <Typography sx={{ color: '#fff', fontSize: '14px' }}>
                                      {exhibitor.phone}
                                    </Typography>
                                  </Box>
                                </Box>
                              </Grid>
                            )}
                            
                            {exhibitor.category && (
                              <Grid item xs={12} sm={6}>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                  <WorkIcon sx={{ color: '#6366f1', mr: 2, fontSize: '20px' }} />
                                  <Box>
                                    <Typography sx={{ color: '#94a3b8', fontSize: '13px' }}>
                                      Category
                                    </Typography>
                                    <Typography sx={{ color: '#fff', fontSize: '14px' }}>
                                      {exhibitor.category}
                                    </Typography>
                                  </Box>
                                </Box>
                              </Grid>
                            )}
                            
                            {exhibitor.boothNumber && (
                              <Grid item xs={12} sm={6}>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                  <LocationIcon sx={{ color: '#6366f1', mr: 2, fontSize: '20px' }} />
                                  <Box>
                                    <Typography sx={{ color: '#94a3b8', fontSize: '13px' }}>
                                      Requested Booth
                                    </Typography>
                                    <Typography sx={{ color: '#fff', fontSize: '14px' }}>
                                      {exhibitor.boothNumber}
                                    </Typography>
                                  </Box>
                                </Box>
                              </Grid>
                            )}
                          </Grid>
                          
                          {exhibitor.description && (
                            <Box sx={{ mt: 2 }}>
                              <Typography sx={{ color: '#fff', fontWeight: 600, mb: 1 }}>
                                Description
                              </Typography>
                              <Typography sx={{ color: '#94a3b8', lineHeight: 1.6 }}>
                                {exhibitor.description}
                              </Typography>
                            </Box>
                          )}
                        </Grid>
                        
                        <Grid item xs={12} md={4}>
                          <Box sx={{ bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 2, p: 2.5, height: '100%' }}>
                            <Typography sx={{ color: '#fff', fontWeight: 600, mb: 2 }}>
                              Application Details
                            </Typography>
                            
                            <Box sx={{ mb: 2 }}>
                              <Typography sx={{ color: '#94a3b8', fontSize: '13px' }}>
                                Application ID
                              </Typography>
                              <Typography sx={{ color: '#fff', fontSize: '14px', fontFamily: 'monospace' }}>
                                {exhibitor._id || exhibitor.id || 'N/A'}
                              </Typography>
                            </Box>
                            
                            <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', my: 2 }} />
                            
                            <Typography sx={{ color: '#94a3b8', fontSize: '13px', mb: 1 }}>
                              Quick Actions
                            </Typography>
                            
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                              <Button
                                fullWidth
                                variant="contained"
                                startIcon={<ApproveIcon />}
                                onClick={() => handleActionClick(exhibitor, 'approve')}
                                sx={{
                                  bgcolor: '#10b981',
                                  color: '#fff',
                                  py: 1,
                                  borderRadius: 1,
                                  fontWeight: 600,
                                  fontSize: '14px',
                                }}
                              >
                                Approve Application
                              </Button>
                              
                              <Button
                                fullWidth
                                variant="outlined"
                                startIcon={<RejectIcon />}
                                onClick={() => handleActionClick(exhibitor, 'reject')}
                                sx={{
                                  borderColor: '#ef4444',
                                  color: '#ef4444',
                                  py: 1,
                                  borderRadius: 1,
                                  fontWeight: 600,
                                  fontSize: '14px',
                                }}
                              >
                                Reject Application
                              </Button>
                            </Box>
                          </Box>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      </Box>

      {/* Action Confirmation Dialog */}
      <Dialog
        open={actionDialogOpen}
        onClose={handleActionCancel}
        PaperProps={{
          sx: { bgcolor: '#1e293b', borderRadius: 3, width: '500px' }
        }}
      >
        <DialogTitle sx={{ color: '#fff', fontWeight: 700, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {currentAction === 'approve' ? (
              <>
                <ApproveIcon sx={{ color: '#10b981' }} />
                Approve Exhibitor
              </>
            ) : (
              <>
                <RejectIcon sx={{ color: '#ef4444' }} />
                Reject Exhibitor
              </>
            )}
          </Box>
        </DialogTitle>
        
        <DialogContent sx={{ pt: 3 }}>
          <DialogContentText sx={{ color: '#94a3b8', mb: 3 }}>
            {currentAction === 'approve' 
              ? `Are you sure you want to approve ${selectedExhibitor?.name || selectedExhibitor?.company || 'this exhibitor'}?`
              : `Please provide a reason for rejecting ${selectedExhibitor?.name || selectedExhibitor?.company || 'this exhibitor'}:`
            }
          </DialogContentText>
          
          {currentAction === 'reject' && (
            <TextField
              fullWidth
              label="Rejection Reason *"
              placeholder="Explain why this application is being rejected..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              multiline
              rows={3}
              required
              sx={{ 
                '& .MuiOutlinedInput-root': {
                  bgcolor: '#334155',
                  color: '#fff',
                  borderRadius: 1,
                },
                '& .MuiInputLabel-root': {
                  color: '#94a3b8',
                },
              }}
            />
          )}
        </DialogContent>
        
        <DialogActions sx={{ px: 3, pb: 3, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <Button
            onClick={handleActionCancel}
            sx={{ 
              color: '#94a3b8',
              px: 3,
              py: 1
            }}
          >
            Cancel
          </Button>
          
          <Button
            onClick={handleActionConfirm}
            variant="contained"
            disabled={currentAction === 'reject' && !rejectionReason.trim()}
            sx={{ 
              bgcolor: currentAction === 'approve' ? '#10b981' : '#ef4444', 
              color: '#fff',
              px: 4,
              py: 1,
              borderRadius: 2,
              fontWeight: 600,
              '&:hover': { 
                bgcolor: currentAction === 'approve' ? '#0da271' : '#dc2626' 
              },
              '&.Mui-disabled': {
                bgcolor: currentAction === 'approve' ? '#0f766e' : '#7f1d1d',
                color: '#94a3b8',
              }
            }}
          >
            {currentAction === 'approve' ? 'Confirm Approval' : 'Confirm Rejection'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ExhibitorApproval;
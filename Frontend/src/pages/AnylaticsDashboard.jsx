import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../pages/components/Sidebar.jsx';
import { getExpos, getExhibitors } from '../services/api.js';
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
  alpha,
  Avatar,
  Divider,
  Tooltip,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  Switch,
  FormControlLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
} from '@mui/material';
import {
  Timeline as TimelineIcon,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  People as PeopleIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Event as EventIcon,
  Business as BusinessIcon,
  LocationOn as LocationIcon,
  CalendarToday as CalendarIcon,
  AttachMoney as MoneyIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  FilterList as FilterIcon,
  DateRange as DateRangeIcon,
  Visibility as VisibilityIcon,
  Share as ShareIcon,
  Print as PrintIcon,
  ExpandMore as ExpandMoreIcon,
  CheckCircle as CheckIcon,
  Schedule as ScheduleIcon,
  EmojiEvents as TrophyIcon,
  Category as CategoryIcon,
  HourglassEmpty as HourglassIcon,
  Chair as BoothIcon,
  Star as StarIcon,
  ThumbUp as ThumbUpIcon,
  Assignment as AssignmentIcon,
} from '@mui/icons-material';

// Define chart colors array (used in category distribution)
const CHART_COLORS_ARRAY = [
  '#6366f1', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444',
  '#3b82f6', '#ec4899', '#14b8a6', '#f97316', '#06b6d4'
];

const AnalyticsDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [expos, setExpos] = useState([]);
  const [exhibitors, setExhibitors] = useState([]);
  const [selectedExpo, setSelectedExpo] = useState('');
  const [selectedTimeRange, setSelectedTimeRange] = useState('all');
  const [activeTab, setActiveTab] = useState(0);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  // Auto-refresh interval
  useEffect(() => {
    let interval;
    if (autoRefresh) {
      interval = setInterval(() => {
        fetchAnalytics();
      }, 30000); // Refresh every 30 seconds
    }
    return () => clearInterval(interval);
  }, [autoRefresh, selectedExpo]);

  const extractDataArray = (response) => {
    // Handle different API response structures
    if (Array.isArray(response)) {
      return response;
    } else if (response && response.data && Array.isArray(response.data)) {
      return response.data;
    } else if (response && response.expos && Array.isArray(response.expos)) {
      return response.expos;
    } else if (response && response.exhibitors && Array.isArray(response.exhibitors)) {
      return response.exhibitors;
    }
    return [];
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Fetch expos and exhibitors
      const [exposResponse, exhibitorsResponse] = await Promise.all([
        getExpos(),
        getExhibitors()
      ]);
      
      // Extract data from API responses
      const exposData = extractDataArray(exposResponse);
      const exhibitorsData = extractDataArray(exhibitorsResponse);
      
      setExpos(exposData);
      setExhibitors(exhibitorsData);
      
      if (exposData.length > 0 && !selectedExpo) {
        const firstExpoId = exposData[0]._id || exposData[0].id;
        setSelectedExpo(firstExpoId);
        await fetchAnalytics(firstExpoId, exhibitorsData);
      } else if (selectedExpo) {
        await fetchAnalytics(selectedExpo, exhibitorsData);
      }
      
    } catch (error) {
      console.error('Failed to fetch data:', error);
      setError('Failed to load analytics data. Please check your backend connection.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async (expoId = selectedExpo, exhibitorsList = exhibitors) => {
    try {
      if (!expoId || !Array.isArray(exhibitorsList) || !Array.isArray(expos)) return;
      
      const selectedExpoData = expos.find(e => (e._id || e.id) === expoId);
      if (!selectedExpoData) return;
      
      // Calculate analytics from real data
      const analytics = calculateAnalytics(selectedExpoData, exhibitorsList);
      setAnalyticsData(analytics);
      
    } catch (error) {
      console.error('Failed to calculate analytics:', error);
    }
  };

  const calculateAnalytics = (expo, exhibitorsList) => {
    if (!expo || !Array.isArray(exhibitorsList)) {
      return {
        expoInfo: expo || {},
        metrics: {
          totalExhibitors: 0,
          approvedExhibitors: 0,
          exhibitorsWithBooths: 0,
          pendingExhibitors: 0,
          totalBooths: 0,
          occupiedBooths: 0,
          availableBooths: 0,
          boothOccupancyRate: 0,
          totalRevenue: 0,
          estimatedRevenue: 0,
          revenueCollected: 0,
        },
        categories: [],
        statusDistribution: { approved: 0, pending: 0, rejected: 0 },
        topExhibitors: [],
        boothStats: { bySize: {}, byStatus: {} },
        recentActivity: []
      };
    }
    
    // Filter exhibitors for this expo (if expo has exhibitor IDs)
    const expoExhibitors = exhibitorsList.filter(exhibitor => 
      exhibitor.expoId === expo._id || exhibitor.expoId === expo.id || true // Adjust based on your data structure
    );
    
    // Approved exhibitors
    const approvedExhibitors = expoExhibitors.filter(e => 
      e.status === 'approved' || e.status === 'Approved' || e.status === 'active'
    );
    
    // Exhibitors with booths
    const exhibitorsWithBooths = approvedExhibitors.filter(e => e.boothNumber || e.booth);
    
    // Category distribution
    const categoryCount = {};
    approvedExhibitors.forEach(exhibitor => {
      if (exhibitor.category) {
        categoryCount[exhibitor.category] = (categoryCount[exhibitor.category] || 0) + 1;
      }
    });
    
    // Booth occupancy
    const totalBooths = expo.booths?.length || expo.totalBooths || 0;
    const occupiedBooths = exhibitorsWithBooths.length;
    const boothOccupancyRate = totalBooths > 0 ? (occupiedBooths / totalBooths) * 100 : 0;
    
    // Status distribution
    const statusCount = {
      approved: approvedExhibitors.length,
      pending: expoExhibitors.filter(e => e.status === 'pending' || e.status === 'Pending').length,
      rejected: expoExhibitors.filter(e => e.status === 'rejected' || e.status === 'Rejected').length,
    };
    
    // Top exhibitors (by booth number or other metrics)
    const topExhibitors = [...approvedExhibitors]
      .sort((a, b) => (b.boothNumber || b.booth || '').localeCompare(a.boothNumber || a.booth || ''))
      .slice(0, 5);
    
    // Calculate revenue (if price data exists)
    let totalRevenue = 0;
    let estimatedRevenue = 0;
    
    if (expo.booths) {
      expo.booths.forEach(booth => {
        if (booth.price) {
          estimatedRevenue += parseFloat(booth.price) || 0;
        }
      });
    }
    
    // Calculate actual revenue from assigned booths
    exhibitorsWithBooths.forEach(exhibitor => {
      const booth = expo.booths?.find(b => b.number === (exhibitor.boothNumber || exhibitor.booth));
      if (booth?.price) {
        totalRevenue += parseFloat(booth.price) || 0;
      }
    });
    
    return {
      expoInfo: expo,
      metrics: {
        totalExhibitors: expoExhibitors.length,
        approvedExhibitors: approvedExhibitors.length,
        exhibitorsWithBooths: exhibitorsWithBooths.length,
        pendingExhibitors: statusCount.pending,
        totalBooths,
        occupiedBooths,
        availableBooths: totalBooths - occupiedBooths,
        boothOccupancyRate: Math.round(boothOccupancyRate),
        totalRevenue,
        estimatedRevenue,
        revenueCollected: estimatedRevenue > 0 ? Math.round((totalRevenue / estimatedRevenue) * 100) : 0,
      },
      categories: Object.entries(categoryCount).map(([name, count]) => ({
        name,
        count,
        percentage: approvedExhibitors.length > 0 ? Math.round((count / approvedExhibitors.length) * 100) : 0
      })),
      statusDistribution: statusCount,
      topExhibitors: topExhibitors.map(exhibitor => ({
        name: exhibitor.name || exhibitor.companyName || 'Unknown',
        company: exhibitor.company || exhibitor.companyName || '—',
        booth: exhibitor.boothNumber || exhibitor.booth,
        category: exhibitor.category || '—',
        status: exhibitor.status || 'unknown',
        email: exhibitor.email || '—'
      })),
      boothStats: {
        bySize: calculateBoothSizeStats(expo.booths, exhibitorsWithBooths),
        byStatus: calculateBoothStatusStats(expo.booths)
      },
      recentActivity: generateRecentActivity(expoExhibitors)
    };
  };

  const calculateBoothSizeStats = (booths, exhibitorsWithBooths) => {
    if (!Array.isArray(booths)) return {};
    
    const sizeStats = {};
    booths.forEach(booth => {
      const size = booth.size || 'Standard';
      sizeStats[size] = sizeStats[size] || { total: 0, occupied: 0 };
      sizeStats[size].total++;
      
      if (exhibitorsWithBooths.find(e => (e.boothNumber || e.booth) === booth.number)) {
        sizeStats[size].occupied++;
      }
    });
    
    return sizeStats;
  };

  const calculateBoothStatusStats = (booths) => {
    if (!Array.isArray(booths)) return {};
    
    const statusStats = {};
    booths.forEach(booth => {
      const status = booth.status || 'available';
      statusStats[status] = (statusStats[status] || 0) + 1;
    });
    
    return statusStats;
  };

  const generateRecentActivity = (exhibitorsList) => {
    if (!Array.isArray(exhibitorsList)) return [];
    
    // Sort by some date field if available, otherwise use sample data
    return exhibitorsList
      .slice(0, 5)
      .map(exhibitor => ({
        action: (exhibitor.boothNumber || exhibitor.booth) ? 'Booth Assigned' : 'Registered',
        exhibitor: exhibitor.name || exhibitor.companyName || 'Unknown',
        company: exhibitor.company || exhibitor.companyName || '—',
        time: 'Recently',
        status: exhibitor.status || 'unknown'
      }));
  };

  const handleExpoChange = async (expoId) => {
    setSelectedExpo(expoId);
    if (Array.isArray(exhibitors)) {
      await fetchAnalytics(expoId, exhibitors);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleExportReport = (format) => {
    // Create export data
    const exportData = {
      expo: analyticsData?.expoInfo?.title || 'Analytics Report',
      generated: new Date().toISOString(),
      metrics: analyticsData?.metrics || {},
      categories: analyticsData?.categories || [],
      topExhibitors: analyticsData?.topExhibitors || []
    };
    
    if (format === 'json') {
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `analytics-report-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
    } else {
      // For CSV/PDF, you would need additional libraries
      alert(`Export in ${format.toUpperCase()} format would require additional setup. JSON exported instead.`);
      handleExportReport('json');
    }
  };

  const getTrendIcon = (value) => {
    if (value > 0) {
      return <TrendingUpIcon sx={{ color: '#10b981' }} />;
    } else if (value < 0) {
      return <TrendingDownIcon sx={{ color: '#ef4444' }} />;
    }
    return null;
  };

  const renderMetricCard = (title, value, subtitle, icon, color, trend) => (
    <Card sx={{ 
      bgcolor: '#334155', 
      borderRadius: 3,
      height: '100%',
      transition: 'all 0.3s',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: `0 8px 25px ${alpha(color, 0.3)}`,
      }
    }}>
      <CardContent sx={{ p: 2.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ 
            width: 48, 
            height: 48, 
            bgcolor: alpha(color, 0.2), 
            borderRadius: 3,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {icon}
          </Box>
          {trend && (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {getTrendIcon(trend)}
              {trend !== 0 && (
                <Typography sx={{ 
                  color: trend > 0 ? '#10b981' : '#ef4444',
                  fontSize: '12px',
                  fontWeight: 600,
                  ml: 0.5
                }}>
                  {Math.abs(trend)}%
                </Typography>
              )}
            </Box>
          )}
        </Box>
        
        <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: '28px', mb: 0.5 }}>
          {value}
        </Typography>
        <Typography sx={{ color: '#94a3b8', fontSize: '14px', mb: 1 }}>
          {title}
        </Typography>
        {subtitle && (
          <Typography sx={{ color: '#94a3b8', fontSize: '12px', opacity: 0.8 }}>
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </Card>
  );

  if (loading && !analyticsData) {
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
            <Typography sx={{ color: '#fff' }}>Loading analytics dashboard...</Typography>
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
          {/* Header Section */}
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Box>
                <Typography
                  variant="h4"
                  sx={{
                    color: '#fff',
                    fontWeight: 800,
                    mb: 0.5,
                  }}
                >
                  Analytics & Reporting
                </Typography>
                <Typography sx={{ color: '#94a3b8', fontSize: '16px' }}>
                  Real-time insights and performance metrics for your expos
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={autoRefresh}
                      onChange={(e) => setAutoRefresh(e.target.checked)}
                      size="small"
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
                    <Typography sx={{ color: '#94a3b8', fontSize: '13px' }}>
                      Auto-refresh
                    </Typography>
                  }
                />
                
                <Button
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={fetchData}
                  sx={{
                    borderColor: '#94a3b8',
                    color: '#94a3b8',
                    px: 3,
                    py: 1,
                    borderRadius: 2,
                    fontWeight: 600,
                    '&:hover': {
                      borderColor: '#6366f1',
                      color: '#6366f1',
                    }
                  }}
                >
                  Refresh
                </Button>
              </Box>
            </Box>

            {/* Expo Selection */}
            <Paper sx={{ p: 3, bgcolor: '#1e293b', borderRadius: 3, mb: 3 }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={6}>
                  <Typography sx={{ color: '#fff', fontWeight: 600, mb: 1 }}>
                    Select Expo for Analytics
                  </Typography>
                  <FormControl fullWidth size="small">
                    <InputLabel sx={{ color: '#94a3b8' }}>Choose Expo</InputLabel>
                    <Select
                      value={selectedExpo}
                      onChange={(e) => handleExpoChange(e.target.value)}
                      label="Choose Expo"
                      sx={{
                        bgcolor: '#334155',
                        color: '#fff',
                        borderRadius: 2,
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'rgba(255,255,255,0.1)',
                        },
                      }}
                    >
                      {Array.isArray(expos) && expos.length > 0 ? (
                        expos.map((expo) => (
                          <MenuItem key={expo._id || expo.id} value={expo._id || expo.id}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              <EventIcon sx={{ color: '#6366f1' }} />
                              <Box>
                                <Typography sx={{ color: '#fff' }}>
                                  {expo.title || expo.name || 'Untitled Expo'}
                                </Typography>
                                <Typography sx={{ color: '#94a3b8', fontSize: '12px' }}>
                                  {expo.date ? `${expo.date} • ` : ''}{expo.location || 'Location not specified'}
                                </Typography>
                              </Box>
                            </Box>
                          </MenuItem>
                        ))
                      ) : (
                        <MenuItem disabled>
                          <Typography sx={{ color: '#94a3b8' }}>
                            No expos available
                          </Typography>
                        </MenuItem>
                      )}
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography sx={{ color: '#fff', fontWeight: 600, mb: 1 }}>
                    Time Range
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    {['all', 'week', 'month', 'quarter'].map((range) => (
                      <Chip
                        key={range}
                        label={range.charAt(0).toUpperCase() + range.slice(1)}
                        onClick={() => setSelectedTimeRange(range)}
                        sx={{
                          bgcolor: selectedTimeRange === range ? '#6366f1' : alpha('#94a3b8', 0.1),
                          color: selectedTimeRange === range ? '#fff' : '#94a3b8',
                          fontWeight: 600,
                          cursor: 'pointer',
                          '&:hover': {
                            bgcolor: alpha('#6366f1', 0.8),
                          }
                        }}
                      />
                    ))}
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </Box>

          {/* Error Alert */}
          {error && (
            <Alert 
              severity="error" 
              sx={{ mb: 3, borderRadius: 2 }}
              onClose={() => setError('')}
            >
              {error}
            </Alert>
          )}

          {/* Main Dashboard Content */}
          {analyticsData && (
            <>
              {/* Key Metrics */}
              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                  {renderMetricCard(
                    'Total Exhibitors',
                    analyticsData.metrics.totalExhibitors,
                    'Registered for expo',
                    <BusinessIcon sx={{ color: '#6366f1', fontSize: 24 }} />,
                    '#6366f1',
                    12.5
                  )}
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  {renderMetricCard(
                    'Approved Exhibitors',
                    analyticsData.metrics.approvedExhibitors,
                    'Ready for booth assignment',
                    <CheckIcon sx={{ color: '#10b981', fontSize: 24 }} />,
                    '#10b981',
                    8.3
                  )}
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  {renderMetricCard(
                    'Booth Occupancy',
                    `${analyticsData.metrics.boothOccupancyRate}%`,
                    `${analyticsData.metrics.occupiedBooths} of ${analyticsData.metrics.totalBooths} booths`,
                    <BoothIcon sx={{ color: '#8b5cf6', fontSize: 24 }} />,
                    '#8b5cf6',
                    5.2
                  )}
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  {renderMetricCard(
                    'Revenue Collected',
                    `$${analyticsData.metrics.totalRevenue.toLocaleString()}`,
                    `${analyticsData.metrics.revenueCollected}% of estimated`,
                    <MoneyIcon sx={{ color: '#f59e0b', fontSize: 24 }} />,
                    '#f59e0b',
                    15.7
                  )}
                </Grid>
              </Grid>

              {/* Tabs Section */}
              <Paper sx={{ bgcolor: '#1e293b', borderRadius: 3, mb: 3 }}>
                <Tabs 
                  value={activeTab} 
                  onChange={handleTabChange}
                  sx={{
                    borderBottom: '1px solid rgba(255,255,255,0.1)',
                    '& .MuiTab-root': {
                      color: '#94a3b8',
                      fontWeight: 600,
                      fontSize: '14px',
                      textTransform: 'none',
                      minHeight: '60px',
                    },
                    '& .Mui-selected': {
                      color: '#6366f1 !important',
                    },
                    '& .MuiTabs-indicator': {
                      backgroundColor: '#6366f1',
                    },
                  }}
                >
                  <Tab icon={<TimelineIcon />} iconPosition="start" label="Overview" />
                  <Tab icon={<PeopleIcon />} iconPosition="start" label="Exhibitors" />
                  <Tab icon={<BarChartIcon />} iconPosition="start" label="Booth Analytics" />
                  <Tab icon={<PieChartIcon />} iconPosition="start" label="Category Insights" />
                </Tabs>

                {/* Tab Content */}
                <Box sx={{ p: 3 }}>
                  {activeTab === 0 && (
                    <Grid container spacing={3}>
                      {/* Status Distribution */}
                      <Grid item xs={12} md={6}>
                        <Paper sx={{ p: 3, bgcolor: '#334155', borderRadius: 3, height: '100%' }}>
                          <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: '18px', mb: 3 }}>
                            Exhibitor Status Distribution
                          </Typography>
                          
                          <Grid container spacing={2}>
                            {Object.entries(analyticsData.statusDistribution).map(([status, count]) => (
                              <Grid item xs={12} key={status}>
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                                  <Typography sx={{ color: '#94a3b8', fontSize: '14px', textTransform: 'capitalize' }}>
                                    {status}
                                  </Typography>
                                  <Typography sx={{ color: '#fff', fontWeight: 600 }}>
                                    {count}
                                  </Typography>
                                </Box>
                                <LinearProgress 
                                  variant="determinate" 
                                  value={analyticsData.metrics.totalExhibitors > 0 ? (count / analyticsData.metrics.totalExhibitors) * 100 : 0}
                                  sx={{
                                    height: 8,
                                    borderRadius: 4,
                                    bgcolor: alpha('#94a3b8', 0.2),
                                    '& .MuiLinearProgress-bar': {
                                      bgcolor: 
                                        status === 'approved' ? '#10b981' :
                                        status === 'pending' ? '#f59e0b' : '#ef4444',
                                      borderRadius: 4,
                                    }
                                  }}
                                />
                              </Grid>
                            ))}
                          </Grid>
                        </Paper>
                      </Grid>

                      {/* Recent Activity */}
                      <Grid item xs={12} md={6}>
                        <Paper sx={{ p: 3, bgcolor: '#334155', borderRadius: 3, height: '100%' }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                            <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: '18px' }}>
                              Recent Activity
                            </Typography>
                            <Chip
                              label="Live"
                              size="small"
                              sx={{
                                bgcolor: alpha('#ef4444', 0.2),
                                color: '#ef4444',
                                fontWeight: 600,
                              }}
                            />
                          </Box>
                          
                          <Box>
                            {analyticsData.recentActivity.map((activity, index) => (
                              <Box key={index} sx={{ mb: 2.5 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                                  <Avatar sx={{ 
                                    bgcolor: 
                                      activity.action.includes('Assigned') ? alpha('#10b981', 0.2) : 
                                      alpha('#6366f1', 0.2),
                                    color: 
                                      activity.action.includes('Assigned') ? '#10b981' : '#6366f1',
                                    width: 36,
                                    height: 36,
                                    fontSize: '14px'
                                  }}>
                                    {activity.action.includes('Assigned') ? 'B' : 'R'}
                                  </Avatar>
                                  <Box sx={{ flexGrow: 1 }}>
                                    <Typography sx={{ color: '#fff', fontSize: '14px', fontWeight: 600 }}>
                                      {activity.exhibitor}
                                    </Typography>
                                    <Typography sx={{ color: '#94a3b8', fontSize: '12px' }}>
                                      {activity.company} • {activity.action}
                                    </Typography>
                                  </Box>
                                  <Typography sx={{ color: '#94a3b8', fontSize: '11px' }}>
                                    {activity.time}
                                  </Typography>
                                </Box>
                              </Box>
                            ))}
                          </Box>
                        </Paper>
                      </Grid>

                      {/* Booth Statistics */}
                      <Grid item xs={12}>
                        <Paper sx={{ p: 3, bgcolor: '#334155', borderRadius: 3 }}>
                          <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: '18px', mb: 3 }}>
                            Booth Statistics
                          </Typography>
                          
                          <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                              <Typography sx={{ color: '#94a3b8', fontSize: '14px', mb: 2 }}>
                                By Size
                              </Typography>
                              {Object.entries(analyticsData.boothStats.bySize).map(([size, stats]) => (
                                <Box key={size} sx={{ mb: 2 }}>
                                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                    <Typography sx={{ color: '#fff', fontSize: '13px' }}>
                                      {size}
                                    </Typography>
                                    <Typography sx={{ color: '#94a3b8', fontSize: '13px' }}>
                                      {stats.occupied}/{stats.total} occupied
                                    </Typography>
                                  </Box>
                                  <LinearProgress 
                                    variant="determinate" 
                                    value={stats.total > 0 ? (stats.occupied / stats.total) * 100 : 0}
                                    sx={{
                                      height: 6,
                                      borderRadius: 3,
                                      bgcolor: alpha('#94a3b8', 0.2),
                                      '& .MuiLinearProgress-bar': {
                                        bgcolor: '#6366f1',
                                        borderRadius: 3,
                                      }
                                    }}
                                  />
                                </Box>
                              ))}
                            </Grid>
                            
                            <Grid item xs={12} md={6}>
                              <Typography sx={{ color: '#94a3b8', fontSize: '14px', mb: 2 }}>
                                By Status
                              </Typography>
                              {Object.entries(analyticsData.boothStats.byStatus).map(([status, count]) => (
                                <Box key={status} sx={{ mb: 2 }}>
                                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                    <Typography sx={{ color: '#fff', fontSize: '13px', textTransform: 'capitalize' }}>
                                      {status}
                                    </Typography>
                                    <Typography sx={{ color: '#94a3b8', fontSize: '13px' }}>
                                      {count} booths
                                    </Typography>
                                  </Box>
                                  <LinearProgress 
                                    variant="determinate" 
                                    value={analyticsData.metrics.totalBooths > 0 ? (count / analyticsData.metrics.totalBooths) * 100 : 0}
                                    sx={{
                                      height: 6,
                                      borderRadius: 3,
                                      bgcolor: alpha('#94a3b8', 0.2),
                                      '& .MuiLinearProgress-bar': {
                                        bgcolor: 
                                          status === 'available' ? '#10b981' :
                                          status === 'occupied' ? '#6366f1' : '#f59e0b',
                                        borderRadius: 3,
                                      }
                                    }}
                                  />
                                </Box>
                              ))}
                            </Grid>
                          </Grid>
                        </Paper>
                      </Grid>
                    </Grid>
                  )}

                  {activeTab === 1 && (
                    <Grid container spacing={3}>
                      {/* Top Exhibitors Table */}
                      <Grid item xs={12}>
                        <Paper sx={{ bgcolor: '#334155', borderRadius: 3, overflow: 'hidden' }}>
                          <Box sx={{ 
                            p: 3, 
                            bgcolor: '#1e293b',
                            borderBottom: '1px solid rgba(255,255,255,0.1)'
                          }}>
                            <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: '18px' }}>
                              <TrophyIcon sx={{ mr: 1, verticalAlign: 'middle', color: '#f59e0b' }} />
                              Top Exhibitors
                            </Typography>
                          </Box>
                          
                          <TableContainer>
                            <Table>
                              <TableHead>
                                <TableRow sx={{ bgcolor: 'rgba(255,255,255,0.05)' }}>
                                  <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Exhibitor</TableCell>
                                  <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Company</TableCell>
                                  <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Booth</TableCell>
                                  <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Category</TableCell>
                                  <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Status</TableCell>
                                  <TableCell sx={{ color: '#fff', fontWeight: 700, textAlign: 'center' }}>Actions</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {analyticsData.topExhibitors.map((exhibitor, index) => (
                                  <TableRow 
                                    key={index}
                                    sx={{ 
                                      '&:hover': { bgcolor: 'rgba(255,255,255,0.02)' },
                                      borderBottom: '1px solid rgba(255,255,255,0.05)'
                                    }}
                                  >
                                    <TableCell sx={{ color: '#fff', py: 2 }}>
                                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Avatar sx={{ 
                                          bgcolor: alpha('#6366f1', 0.2), 
                                          color: '#6366f1',
                                          width: 36,
                                          height: 36,
                                          fontSize: '14px'
                                        }}>
                                          {exhibitor.name?.charAt(0) || 'E'}
                                        </Avatar>
                                        <Box>
                                          <Typography sx={{ color: '#fff', fontWeight: 600, fontSize: '14px' }}>
                                            {exhibitor.name}
                                          </Typography>
                                          <Typography sx={{ color: '#94a3b8', fontSize: '12px' }}>
                                            {exhibitor.email}
                                          </Typography>
                                        </Box>
                                      </Box>
                                    </TableCell>
                                    
                                    <TableCell sx={{ color: '#94a3b8', py: 2 }}>
                                      {exhibitor.company}
                                    </TableCell>
                                    
                                    <TableCell sx={{ py: 2 }}>
                                      {exhibitor.booth ? (
                                        <Chip
                                          label={`Booth ${exhibitor.booth}`}
                                          size="small"
                                          sx={{
                                            bgcolor: alpha('#10b981', 0.1),
                                            color: '#10b981',
                                            fontWeight: 600,
                                          }}
                                        />
                                      ) : (
                                        <Chip
                                          label="Unassigned"
                                          size="small"
                                          sx={{
                                            bgcolor: alpha('#f59e0b', 0.1),
                                            color: '#f59e0b',
                                            fontWeight: 600,
                                          }}
                                        />
                                      )}
                                    </TableCell>
                                    
                                    <TableCell sx={{ py: 2 }}>
                                      {exhibitor.category !== '—' ? (
                                        <Chip
                                          label={exhibitor.category}
                                          size="small"
                                          sx={{
                                            bgcolor: alpha('#8b5cf6', 0.1),
                                            color: '#8b5cf6',
                                            fontWeight: 500,
                                          }}
                                        />
                                      ) : (
                                        <Typography sx={{ color: '#94a3b8' }}>—</Typography>
                                      )}
                                    </TableCell>
                                    
                                    <TableCell sx={{ py: 2 }}>
                                      <Chip
                                        label={exhibitor.status}
                                        size="small"
                                        sx={{
                                          bgcolor: 
                                            exhibitor.status === 'approved' ? alpha('#10b981', 0.1) :
                                            exhibitor.status === 'pending' ? alpha('#f59e0b', 0.1) :
                                            alpha('#ef4444', 0.1),
                                          color: 
                                            exhibitor.status === 'approved' ? '#10b981' :
                                            exhibitor.status === 'pending' ? '#f59e0b' : '#ef4444',
                                          fontWeight: 600,
                                        }}
                                      />
                                    </TableCell>
                                    
                                    <TableCell sx={{ py: 2 }}>
                                      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                                        <Tooltip title="View Details">
                                          <IconButton
                                            size="small"
                                            sx={{ 
                                              color: '#6366f1',
                                              bgcolor: alpha('#6366f1', 0.1),
                                            }}
                                          >
                                            <VisibilityIcon fontSize="small" />
                                          </IconButton>
                                        </Tooltip>
                                        
                                        <Tooltip title="Assign Booth">
                                          <IconButton
                                            size="small"
                                            sx={{ 
                                              color: '#10b981',
                                              bgcolor: alpha('#10b981', 0.1),
                                            }}
                                          >
                                            <AssignmentIcon fontSize="small" />
                                          </IconButton>
                                        </Tooltip>
                                      </Box>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </TableContainer>
                        </Paper>
                      </Grid>
                    </Grid>
                  )}

                  {activeTab === 2 && (
                    <Grid container spacing={3}>
                      {/* Booth Analytics */}
                      <Grid item xs={12} md={6}>
                        <Paper sx={{ p: 3, bgcolor: '#334155', borderRadius: 3, height: '100%' }}>
                          <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: '18px', mb: 3 }}>
                            <BoothIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                            Booth Occupancy Analysis
                          </Typography>
                          
                          <Box sx={{ textAlign: 'center', py: 4 }}>
                            <Box sx={{ position: 'relative', display: 'inline-block', mb: 3 }}>
                              <CircularProgress
                                variant="determinate"
                                value={analyticsData.metrics.boothOccupancyRate}
                                size={120}
                                thickness={4}
                                sx={{
                                  color: '#6366f1',
                                  '& .MuiCircularProgress-circle': {
                                    strokeLinecap: 'round',
                                  }
                                }}
                              />
                              <Box
                                sx={{
                                  position: 'absolute',
                                  top: '50%',
                                  left: '50%',
                                  transform: 'translate(-50%, -50%)',
                                  textAlign: 'center',
                                }}
                              >
                                <Typography sx={{ color: '#fff', fontWeight: 800, fontSize: '24px' }}>
                                  {analyticsData.metrics.boothOccupancyRate}%
                                </Typography>
                                <Typography sx={{ color: '#94a3b8', fontSize: '12px' }}>
                                  Occupancy Rate
                                </Typography>
                              </Box>
                            </Box>
                            
                            <Grid container spacing={2}>
                              <Grid item xs={6}>
                                <Box sx={{ p: 2, bgcolor: alpha('#10b981', 0.1), borderRadius: 2 }}>
                                  <Typography sx={{ color: '#10b981', fontWeight: 700, fontSize: '20px' }}>
                                    {analyticsData.metrics.occupiedBooths}
                                  </Typography>
                                  <Typography sx={{ color: '#94a3b8', fontSize: '12px' }}>
                                    Occupied
                                  </Typography>
                                </Box>
                              </Grid>
                              <Grid item xs={6}>
                                <Box sx={{ p: 2, bgcolor: alpha('#f59e0b', 0.1), borderRadius: 2 }}>
                                  <Typography sx={{ color: '#f59e0b', fontWeight: 700, fontSize: '20px' }}>
                                    {analyticsData.metrics.availableBooths}
                                  </Typography>
                                  <Typography sx={{ color: '#94a3b8', fontSize: '12px' }}>
                                    Available
                                  </Typography>
                                </Box>
                              </Grid>
                            </Grid>
                          </Box>
                        </Paper>
                      </Grid>

                      {/* Revenue Analytics */}
                      <Grid item xs={12} md={6}>
                        <Paper sx={{ p: 3, bgcolor: '#334155', borderRadius: 3, height: '100%' }}>
                          <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: '18px', mb: 3 }}>
                            <MoneyIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                            Revenue Analysis
                          </Typography>
                          
                          <Box sx={{ mb: 4 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                              <Typography sx={{ color: '#94a3b8', fontSize: '14px' }}>
                                Collected Revenue
                              </Typography>
                              <Typography sx={{ color: '#fff', fontWeight: 600 }}>
                                ${analyticsData.metrics.totalRevenue.toLocaleString()}
                              </Typography>
                            </Box>
                            <LinearProgress 
                              variant="determinate" 
                              value={analyticsData.metrics.revenueCollected}
                              sx={{
                                height: 10,
                                borderRadius: 5,
                                bgcolor: alpha('#94a3b8', 0.2),
                                '& .MuiLinearProgress-bar': {
                                  bgcolor: '#10b981',
                                  borderRadius: 5,
                                }
                              }}
                            />
                          </Box>
                          
                          <Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                              <Typography sx={{ color: '#94a3b8', fontSize: '14px' }}>
                                Estimated Total
                              </Typography>
                              <Typography sx={{ color: '#fff', fontWeight: 600 }}>
                                ${analyticsData.metrics.estimatedRevenue.toLocaleString()}
                              </Typography>
                            </Box>
                            <Typography sx={{ color: '#94a3b8', fontSize: '12px', mb: 3 }}>
                              Based on booth pricing
                            </Typography>
                            
                            <Box sx={{ 
                              p: 2, 
                              bgcolor: alpha('#6366f1', 0.1), 
                              borderRadius: 2,
                              textAlign: 'center'
                            }}>
                              <Typography sx={{ color: '#fff', fontWeight: 600, fontSize: '16px', mb: 0.5 }}>
                                Potential Revenue
                              </Typography>
                              <Typography sx={{ color: '#94a3b8', fontSize: '14px' }}>
                                ${(analyticsData.metrics.estimatedRevenue - analyticsData.metrics.totalRevenue).toLocaleString()} remaining
                              </Typography>
                            </Box>
                          </Box>
                        </Paper>
                      </Grid>
                    </Grid>
                  )}

                  {activeTab === 3 && (
                    <Grid container spacing={3}>
                      {/* Category Distribution */}
                      <Grid item xs={12}>
                        <Paper sx={{ p: 3, bgcolor: '#334155', borderRadius: 3 }}>
                          <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: '18px', mb: 3 }}>
                            <CategoryIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                            Exhibitor Category Distribution
                          </Typography>
                          
                          <Grid container spacing={3}>
                            {analyticsData.categories.map((category, index) => (
                              <Grid item xs={12} sm={6} md={4} lg={3} key={category.name}>
                                <Card sx={{ 
                                  bgcolor: '#1e293b', 
                                  borderRadius: 3,
                                  height: '100%'
                                }}>
                                  <CardContent sx={{ p: 2.5, textAlign: 'center' }}>
                                    <Box sx={{ 
                                      width: 48, 
                                      height: 48, 
                                      bgcolor: alpha(CHART_COLORS_ARRAY[index % CHART_COLORS_ARRAY.length], 0.2), 
                                      borderRadius: 3,
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      mx: 'auto',
                                      mb: 2
                                    }}>
                                      <BusinessIcon sx={{ 
                                        color: CHART_COLORS_ARRAY[index % CHART_COLORS_ARRAY.length],
                                        fontSize: 24
                                      }} />
                                    </Box>
                                    
                                    <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: '20px', mb: 0.5 }}>
                                      {category.count}
                                    </Typography>
                                    <Typography sx={{ color: '#94a3b8', fontSize: '13px', mb: 1 }}>
                                      {category.name}
                                    </Typography>
                                    <LinearProgress 
                                      variant="determinate" 
                                      value={category.percentage}
                                      sx={{
                                        height: 6,
                                        borderRadius: 3,
                                        bgcolor: alpha('#94a3b8', 0.2),
                                        '& .MuiLinearProgress-bar': {
                                          bgcolor: CHART_COLORS_ARRAY[index % CHART_COLORS_ARRAY.length],
                                          borderRadius: 3,
                                        }
                                      }}
                                    />
                                    <Typography sx={{ color: '#94a3b8', fontSize: '11px', mt: 1 }}>
                                      {category.percentage}% of total
                                    </Typography>
                                  </CardContent>
                                </Card>
                              </Grid>
                            ))}
                          </Grid>
                        </Paper>
                      </Grid>
                    </Grid>
                  )}
                </Box>
              </Paper>

              {/* Export Section */}
              <Paper sx={{ p: 3, bgcolor: '#1e293b', borderRadius: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Box>
                    <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: '18px' }}>
                      Export Reports
                    </Typography>
                    <Typography sx={{ color: '#94a3b8', fontSize: '14px' }}>
                      Download analytics data for further analysis
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                      variant="outlined"
                      startIcon={<DownloadIcon />}
                      onClick={() => handleExportReport('pdf')}
                      sx={{
                        borderColor: '#94a3b8',
                        color: '#94a3b8',
                        px: 3,
                        py: 1,
                        borderRadius: 2,
                        fontWeight: 600,
                      }}
                    >
                      PDF Report
                    </Button>
                    
                    <Button
                      variant="outlined"
                      startIcon={<DownloadIcon />}
                      onClick={() => handleExportReport('csv')}
                      sx={{
                        borderColor: '#94a3b8',
                        color: '#94a3b8',
                        px: 3,
                        py: 1,
                        borderRadius: 2,
                        fontWeight: 600,
                      }}
                    >
                      CSV Data
                    </Button>
                    
                    <Button
                      variant="contained"
                      startIcon={<ShareIcon />}
                      sx={{
                        bgcolor: '#6366f1',
                        color: '#fff',
                        px: 3,
                        py: 1,
                        borderRadius: 2,
                        fontWeight: 600,
                        '&:hover': { bgcolor: '#575de8' }
                      }}
                    >
                      Share Dashboard
                    </Button>
                  </Box>
                </Box>
                
                <Accordion 
                  sx={{ 
                    bgcolor: '#334155', 
                    borderRadius: '8px !important',
                    boxShadow: 'none',
                    '&:before': { display: 'none' }
                  }}
                >
                  <AccordionSummary 
                    expandIcon={<ExpandMoreIcon sx={{ color: '#94a3b8' }} />}
                    sx={{ 
                      minHeight: '48px',
                      '& .MuiAccordionSummary-content': { my: '12px' }
                    }}
                  >
                    <Typography sx={{ color: '#94a3b8', fontSize: '14px', fontWeight: 600 }}>
                      Report Generation Options
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Report Title"
                          defaultValue={`${analyticsData.expoInfo.title || 'Analytics'} Report`}
                          size="small"
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              bgcolor: '#1e293b',
                              color: '#fff',
                              borderRadius: 2,
                            },
                            '& .MuiInputLabel-root': {
                              color: '#94a3b8',
                            },
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Date Range"
                          type="date"
                          size="small"
                          InputLabelProps={{ shrink: true }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              bgcolor: '#1e293b',
                              color: '#fff',
                              borderRadius: 2,
                            },
                            '& .MuiInputLabel-root': {
                              color: '#94a3b8',
                            },
                          }}
                        />
                      </Grid>
                    </Grid>
                  </AccordionDetails>
                </Accordion>
              </Paper>
            </>
          )}

          {!analyticsData && !loading && (
            <Paper sx={{ 
              p: 8, 
              bgcolor: '#1e293b', 
              borderRadius: 3,
              textAlign: 'center'
            }}>
              <TimelineIcon sx={{ fontSize: 64, color: '#94a3b8', mb: 3, opacity: 0.5 }} />
              <Typography sx={{ color: '#94a3b8', mb: 1, fontSize: '20px' }}>
                No Analytics Data Available
              </Typography>
              <Typography sx={{ color: '#64748b', fontSize: '15px', mb: 3 }}>
                Select an expo to view analytics and generate reports
              </Typography>
              <Button
                variant="contained"
                onClick={() => navigate('/viewexpo')}
                sx={{
                  bgcolor: '#6366f1',
                  color: '#fff',
                  px: 4,
                  py: 1.5,
                  borderRadius: 2,
                  fontWeight: 600,
                }}
              >
                View Expos
              </Button>
            </Paper>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default AnalyticsDashboard;
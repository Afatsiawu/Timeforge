import React, { useState, useEffect } from 'react';
import { Grid, Paper, Typography, Box, CircularProgress, Alert, Button } from '@mui/material';
import { Users, BookOpen, MapPin, Calendar } from 'lucide-react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

const StatCard = ({ title, value, icon: Icon, color, onClick, loading }) => (
    <Paper
        onClick={onClick}
        elevation={0}
        sx={{
            p: 3,
            display: 'flex',
            alignItems: 'center',
            gap: 2.5,
            cursor: onClick ? 'pointer' : 'default',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            border: '1px solid',
            borderColor: 'divider',
            background: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(12px)',
            '&:hover': onClick ? {
                transform: 'translateY(-4px)',
                boxShadow: `0 12px 20px -8px ${color}40`,
                borderColor: color,
            } : {}
        }}
    >
        <Box
            sx={{
                p: 1.5,
                borderRadius: 2.5,
                background: `linear-gradient(135deg, ${color}20 0%, ${color}10 100%)`,
                color: color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: `0 4px 12px -3px ${color}30`
            }}
        >
            <Icon size={26} strokeWidth={2.5} />
        </Box>
        <Box>
            <Typography variant="body2" color="text.secondary" fontWeight={600} sx={{ mb: 0.5 }}>{title}</Typography>
            {loading ? (
                <Box sx={{ display: 'flex', mt: 0.5 }}><CircularProgress size={20} color="inherit" /></Box>
            ) : (
                <Typography variant="h4" fontWeight={800} sx={{ color: 'text.primary' }}>{value}</Typography>
            )}
        </Box>
    </Paper>
);

const Dashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        courses: 0,
        instructors: 0,
        rooms: 0,
        sessions: 0
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchStats = async () => {
        try {
            setLoading(true);
            const data = await api.get('/dashboard/stats');
            setStats(data);
            setError('');
        } catch (err) {
            setError('Failed to fetch dashboard statistics.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    return (
        <Box gutterBottom>
            <Typography variant="h4" fontWeight={700} sx={{ mb: 1 }}>Dashboard</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                Overview of your academic resources and scheduling status
            </Typography>

            {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

            <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Total Courses"
                        value={stats.courses}
                        icon={BookOpen}
                        color="#6366f1"
                        onClick={() => navigate('/courses')}
                        loading={loading}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Total Instructors"
                        value={stats.instructors}
                        icon={Users}
                        color="#10b981"
                        onClick={() => navigate('/instructors')}
                        loading={loading}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Total Rooms"
                        value={stats.rooms}
                        icon={MapPin}
                        color="#f59e0b"
                        onClick={() => navigate('/rooms')}
                        loading={loading}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Active Sessions"
                        value={stats.sessions}
                        icon={Calendar}
                        color="#ec4899"
                        onClick={() => navigate('/timetable')}
                        loading={loading}
                    />
                </Grid>
            </Grid>

            <Box sx={{ mt: 4 }}>
                <Paper sx={{ p: 4, borderRadius: 4, textAlign: 'center', backgroundColor: '#f8fafc', border: '1px dashed #cbd5e1' }}>
                    <Typography variant="h6" fontWeight={600} gutterBottom>Ready to Generate?</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        Once you've configured your courses, instructors, and rooms, head over to the Timetable Generator to create optimal schedules.
                    </Typography>
                    <Button variant="contained" size="large" onClick={() => navigate('/timetable')}>
                        Go to Generator
                    </Button>
                </Paper>
            </Box>
        </Box>
    );
};

export default Dashboard;

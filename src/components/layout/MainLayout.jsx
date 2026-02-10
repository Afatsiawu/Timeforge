import React from 'react';
import { Box, AppBar, Toolbar, Typography, IconButton, Avatar, Container } from '@mui/material';
import Sidebar from './Sidebar';
import { Bell } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const MainLayout = ({ children }) => {
    const { user } = useAuth();

    // Get initials for avatar
    const getInitials = () => {
        if (!user) return '??';
        return `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase();
    };

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc' }}>
            <Sidebar />
            <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
                <AppBar
                    position="sticky"
                    color="transparent"
                    elevation={0}
                    sx={{
                        mb: 4,
                        borderBottom: '1px solid rgba(226, 232, 240, 0.8)',
                        backdropFilter: 'blur(8px)',
                        backgroundColor: 'rgba(248, 250, 252, 0.8)',
                        zIndex: (theme) => theme.zIndex.drawer + 1
                    }}
                >
                    <Toolbar sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                        <IconButton size="small" sx={{ border: '1px solid #e2e8f0', p: 1, borderRadius: 2 }}>
                            <Bell size={20} color="#64748b" />
                        </IconButton>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Box sx={{ textAlign: 'right' }}>
                                <Typography variant="body2" fontWeight={600} color="text.primary">
                                    {user ? `${user.firstName} ${user.lastName}` : 'Guest User'}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    {user ? user.role : 'Guest'}
                                </Typography>
                            </Box>
                            <Avatar sx={{
                                bgcolor: 'transparent',
                                width: 40,
                                height: 40,
                                border: '2px solid #e2e8f0',
                                color: 'primary.main',
                                fontWeight: 700
                            }}>
                                {getInitials()}
                            </Avatar>
                        </Box>
                    </Toolbar>
                </AppBar>
                <Container maxWidth="xl">
                    {children}
                </Container>
            </Box>
        </Box>
    );
};

export default MainLayout;

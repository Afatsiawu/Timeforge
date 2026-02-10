import React from 'react';
import { Box, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Typography, Drawer, useTheme } from '@mui/material';
import {
    LayoutDashboard,
    BookOpen,
    Users,
    MapPin,
    Calendar,
    Settings,
    CheckCircle
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const drawerWidth = 260;

const menuItems = [
    { text: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/' },
    { text: 'Courses', icon: <BookOpen size={20} />, path: '/courses' },
    { text: 'Instructors', icon: <Users size={20} />, path: '/instructors' },
    { text: 'Rooms', icon: <MapPin size={20} />, path: '/rooms' },
    { text: 'Classes', icon: <CheckCircle size={20} />, path: '/classes' },
    { text: 'Timetable', icon: <Calendar size={20} />, path: '/timetable' },
    { text: 'Settings', icon: <Settings size={20} />, path: '/settings' },
];

const Sidebar = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const location = useLocation();

    return (
        <Drawer
            variant="permanent"
            sx={{
                width: drawerWidth,
                flexShrink: 0,
                '& .MuiDrawer-paper': {
                    width: drawerWidth,
                    boxSizing: 'border-box',
                    borderRight: '1px solid #e2e8f0',
                    backgroundColor: '#fff',
                },
            }}
        >
            <Box sx={{ p: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box
                    component="img"
                    src="/src/assets/logo.png"
                    alt="TimeForge Logo"
                    sx={{
                        width: 42,
                        height: 42,
                        objectFit: 'contain'
                    }}
                />
                <Typography variant="h5" fontWeight={800} sx={{
                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    letterSpacing: '-0.02em'
                }}>
                    TimeForge
                </Typography>
            </Box>

            <List sx={{ px: 2 }}>
                {menuItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
                            <ListItemButton
                                onClick={() => navigate(item.path)}
                                sx={{
                                    borderRadius: 2,
                                    backgroundColor: isActive ? theme.palette.primary.light + '20' : 'transparent',
                                    color: isActive ? theme.palette.primary.main : theme.palette.text.secondary,
                                    '&:hover': {
                                        backgroundColor: theme.palette.primary.light + '10',
                                        color: theme.palette.primary.main,
                                    },
                                }}
                            >
                                <ListItemIcon
                                    sx={{
                                        minWidth: 40,
                                        color: 'inherit'
                                    }}
                                >
                                    {item.icon}
                                </ListItemIcon>
                                <ListItemText
                                    primary={item.text}
                                    primaryTypographyProps={{
                                        fontWeight: isActive ? 600 : 500,
                                        fontSize: '0.95rem'
                                    }}
                                />
                            </ListItemButton>
                        </ListItem>
                    );
                })}
            </List>
        </Drawer>
    );
};

export default Sidebar;

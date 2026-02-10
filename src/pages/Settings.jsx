import React from 'react';
import { Box, Typography, Paper, Switch, List, ListItem, ListItemText, Divider } from '@mui/material';

const Settings = () => {
    return (
        <Box>
            <Typography variant="h4" fontWeight={700} gutterBottom>Settings</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>Configure system preferences and global constraints</Typography>

            <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
                <List>
                    <ListItem sx={{ py: 2 }}>
                        <ListItemText
                            primary="Email Notifications"
                            secondary="Receive updates when schedules are generated or changed"
                        />
                        <Switch defaultChecked onChange={(e) => alert(`Notifications ${e.target.checked ? 'enabled' : 'disabled'}`)} />
                    </ListItem>
                    <Divider />
                    <ListItem sx={{ py: 2 }}>
                        <ListItemText
                            primary="Dark Mode"
                            secondary="Apply a darker color scheme to the interface"
                        />
                        <Switch onChange={(e) => alert(`Dark mode ${e.target.checked ? 'enabled' : 'disabled'} (feature coming soon)`)} />
                    </ListItem>
                    <Divider />
                    <ListItem sx={{ py: 2 }}>
                        <ListItemText
                            primary="Auto-Save"
                            secondary="Automatically save changes to the timetable"
                        />
                        <Switch defaultChecked onChange={(e) => alert(`Auto-save ${e.target.checked ? 'enabled' : 'disabled'}`)} />
                    </ListItem>
                </List>
            </Paper>
        </Box>
    );
};

export default Settings;

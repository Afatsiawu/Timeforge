import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Button,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Avatar,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    MenuItem,
    Alert,
    CircularProgress
} from '@mui/material';
import { Plus, Edit, Trash2, Mail } from 'lucide-react';
import api from '../services/api';

const InstructorManagement = () => {
    const [instructors, setInstructors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Dialog state
    const [open, setOpen] = useState(false);
    const [editingInstructor, setEditingInstructor] = useState(null);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        employmentType: 'FULL_TIME',
        maxHoursPerWeek: 40
    });

    const fetchData = async () => {
        try {
            setLoading(true);
            const instructorsData = await api.get('/instructors');
            setInstructors(instructorsData);
            setError('');
        } catch (err) {
            setError('Failed to fetch data. Please ensure the server is running.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleOpen = (instructor = null) => {
        if (instructor) {
            setEditingInstructor(instructor);
            setFormData({
                firstName: instructor.user.firstName,
                lastName: instructor.user.lastName,
                email: instructor.user.email,
                employmentType: instructor.employmentType,
                maxHoursPerWeek: instructor.maxHoursPerWeek
            });
        } else {
            setEditingInstructor(null);
            setFormData({
                firstName: '',
                lastName: '',
                email: '',
                employmentType: 'FULL_TIME',
                maxHoursPerWeek: 40
            });
        }
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setEditingInstructor(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingInstructor) {
                await api.put(`/instructors/${editingInstructor.id}`, formData);
            } else {
                await api.post('/instructors', formData);
            }
            fetchData();
            handleClose();
        } catch (err) {
            setError(err.message || 'Failed to save instructor');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this instructor?')) {
            try {
                await api.delete(`/instructors/${id}`);
                fetchData();
            } catch (err) {
                setError(err.message || 'Failed to delete instructor');
            }
        }
    };

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box>;

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Box>
                    <Typography variant="h4" fontWeight={700}>Instructor Management</Typography>
                    <Typography variant="body2" color="text.secondary">Manage faculty profiles and availability</Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<Plus size={20} />}
                    sx={{ py: 1.2, px: 3 }}
                    onClick={() => handleOpen()}
                >
                    Add New Instructor
                </Button>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

            <TableContainer component={Paper} sx={{ borderRadius: 3, overflow: 'hidden' }}>
                <Table>
                    <TableHead sx={{ backgroundColor: '#f1f5f9' }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 600 }}>Instructor</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                            <TableCell sx={{ fontWeight: 600 }} align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {instructors.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                                    No instructors found. Add your first instructor to get started!
                                </TableCell>
                            </TableRow>
                        ) : instructors.map((instructor) => (
                            <TableRow key={instructor.id} hover>
                                <TableCell>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Avatar sx={{ bgcolor: 'secondary.main', width: 32, height: 32, fontSize: '0.875rem' }}>
                                            {instructor.user.firstName[0]}{instructor.user.lastName[0]}
                                        </Avatar>
                                        <Typography variant="body2" fontWeight={600}>
                                            {instructor.user.firstName} {instructor.user.lastName}
                                        </Typography>
                                    </Box>
                                </TableCell>
                                <TableCell>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
                                        <Mail size={16} />
                                        <Typography variant="body2">{instructor.user.email}</Typography>
                                    </Box>
                                </TableCell>
                                <TableCell>{instructor.employmentType.replace('_', ' ')}</TableCell>
                                <TableCell align="right">
                                    <IconButton size="small" color="primary" onClick={() => handleOpen(instructor)}>
                                        <Edit size={18} />
                                    </IconButton>
                                    <IconButton size="small" color="error" onClick={() => handleDelete(instructor.id)}>
                                        <Trash2 size={18} />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Add/Edit Dialog */}
            <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
                <form onSubmit={handleSubmit}>
                    <DialogTitle>{editingInstructor ? 'Edit Instructor' : 'Add New Instructor'}</DialogTitle>
                    <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <TextField
                                label="First Name"
                                fullWidth
                                value={formData.firstName}
                                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                required
                            />
                            <TextField
                                label="Last Name"
                                fullWidth
                                value={formData.lastName}
                                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                required
                            />
                        </Box>
                        <TextField
                            label="Email Address"
                            fullWidth
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                            disabled={!!editingInstructor}
                        />
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <TextField
                                select
                                label="Employment Type"
                                fullWidth
                                value={formData.employmentType}
                                onChange={(e) => setFormData({ ...formData, employmentType: e.target.value })}
                                required
                            >
                                <MenuItem value="FULL_TIME">Full-time</MenuItem>
                                <MenuItem value="PART_TIME">Part-time</MenuItem>
                                <MenuItem value="VISITING">Visiting</MenuItem>
                            </TextField>
                            <TextField
                                type="number"
                                label="Max Hours/Week"
                                fullWidth
                                value={formData.maxHoursPerWeek}
                                onChange={(e) => setFormData({ ...formData, maxHoursPerWeek: parseInt(e.target.value) })}
                                required
                            />
                        </Box>
                    </DialogContent>
                    <DialogActions sx={{ px: 3, pb: 2 }}>
                        <Button onClick={handleClose}>Cancel</Button>
                        <Button type="submit" variant="contained">Save Instructor</Button>
                    </DialogActions>
                </form>
            </Dialog>
        </Box>
    );
};

export default InstructorManagement;

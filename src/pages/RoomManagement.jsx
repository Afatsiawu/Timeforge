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
    Chip,
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
import { Plus, Edit, Trash2, Users } from 'lucide-react';
import api from '../services/api';

const RoomManagement = () => {
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Dialog state
    const [open, setOpen] = useState(false);
    const [editingRoom, setEditingRoom] = useState(null);
    const [formData, setFormData] = useState({
        number: '',
        building: '',
        capacity: 30,
        type: 'CLASSROOM',
        facilities: ''
    });

    const fetchData = async () => {
        try {
            setLoading(true);
            const data = await api.get('/rooms');
            setRooms(data);
            setError('');
        } catch (err) {
            setError('Failed to fetch rooms. Please ensure the server is running.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleOpen = (room = null) => {
        if (room) {
            setEditingRoom(room);
            setFormData({
                number: room.number,
                building: room.building,
                capacity: room.capacity,
                type: room.type,
                facilities: Array.isArray(room.facilities) ? room.facilities.join(', ') : room.facilities || ''
            });
        } else {
            setEditingRoom(null);
            setFormData({
                number: '',
                building: '',
                capacity: 30,
                type: 'CLASSROOM',
                facilities: ''
            });
        }
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setEditingRoom(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const dataToSend = {
            ...formData,
            facilities: formData.facilities.split(',').map(f => f.trim()).filter(f => f !== '')
        };

        try {
            if (editingRoom) {
                await api.put(`/rooms/${editingRoom.id}`, dataToSend);
            } else {
                await api.post('/rooms', dataToSend);
            }
            fetchData();
            handleClose();
        } catch (err) {
            setError(err.message || 'Failed to save room');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this room?')) {
            try {
                await api.delete(`/rooms/${id}`);
                fetchData();
            } catch (err) {
                setError(err.message || 'Failed to delete room');
            }
        }
    };

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box>;

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Box>
                    <Typography variant="h4" fontWeight={700}>Room Management</Typography>
                    <Typography variant="body2" color="text.secondary">Manage classrooms, labs, and lecture halls</Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<Plus size={20} />}
                    sx={{ py: 1.2, px: 3 }}
                    onClick={() => handleOpen()}
                >
                    Add New Room
                </Button>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

            <TableContainer component={Paper} sx={{ borderRadius: 3, overflow: 'hidden' }}>
                <Table>
                    <TableHead sx={{ backgroundColor: '#f1f5f9' }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 600 }}>Room</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Building</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Capacity</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Facilities</TableCell>
                            <TableCell sx={{ fontWeight: 600 }} align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {rooms.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                                    No rooms found. Add your first room to get started!
                                </TableCell>
                            </TableRow>
                        ) : rooms.map((room) => (
                            <TableRow key={room.id} hover>
                                <TableCell sx={{ fontWeight: 600, color: 'primary.main' }}>
                                    {room.number}
                                </TableCell>
                                <TableCell>{room.building}</TableCell>
                                <TableCell>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Users size={16} color="#64748b" />
                                        {room.capacity}
                                    </Box>
                                </TableCell>
                                <TableCell>
                                    <Chip
                                        label={room.type}
                                        size="small"
                                        variant="outlined"
                                        sx={{ fontWeight: 600 }}
                                    />
                                </TableCell>
                                <TableCell>
                                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                                        {room.facilities && room.facilities.map(f => (
                                            <Chip key={f} label={f} size="small" sx={{ fontSize: '0.7rem' }} />
                                        ))}
                                    </Box>
                                </TableCell>
                                <TableCell align="right">
                                    <IconButton size="small" color="primary" onClick={() => handleOpen(room)}>
                                        <Edit size={18} />
                                    </IconButton>
                                    <IconButton size="small" color="error" onClick={() => handleDelete(room.id)}>
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
                    <DialogTitle>{editingRoom ? 'Edit Room' : 'Add New Room'}</DialogTitle>
                    <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <TextField
                                label="Room Number"
                                fullWidth
                                value={formData.number}
                                onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                                required
                            />
                            <TextField
                                label="Building"
                                fullWidth
                                value={formData.building}
                                onChange={(e) => setFormData({ ...formData, building: e.target.value })}
                                required
                            />
                        </Box>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <TextField
                                type="number"
                                label="Capacity"
                                fullWidth
                                value={formData.capacity}
                                onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                                required
                            />
                            <TextField
                                select
                                label="Type"
                                fullWidth
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                required
                            >
                                <MenuItem value="CLASSROOM">Classroom</MenuItem>
                                <MenuItem value="LAB">Lab</MenuItem>
                                <MenuItem value="LECTURE_HALL">Lecture Hall</MenuItem>
                                <MenuItem value="OFFICE">Office</MenuItem>
                            </TextField>
                        </Box>
                        <TextField
                            label="Facilities (comma separated)"
                            fullWidth
                            value={formData.facilities}
                            onChange={(e) => setFormData({ ...formData, facilities: e.target.value })}
                            placeholder="Projector, Whiteboard, AC"
                        />
                    </DialogContent>
                    <DialogActions sx={{ px: 3, pb: 2 }}>
                        <Button onClick={handleClose}>Cancel</Button>
                        <Button type="submit" variant="contained">Save Room</Button>
                    </DialogActions>
                </form>
            </Dialog>
        </Box>
    );
};

export default RoomManagement;

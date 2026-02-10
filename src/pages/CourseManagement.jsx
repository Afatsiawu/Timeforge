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
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Alert,
    CircularProgress,
    FormControlLabel,
    Checkbox,
    Stack
} from '@mui/material';
import { Plus, Edit, Trash2, Upload } from 'lucide-react';
import api from '../services/api';

const CourseManagement = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Dialog state
    const [open, setOpen] = useState(false);
    const [bulkOpen, setBulkOpen] = useState(false);
    const [bulkText, setBulkText] = useState('');
    const [editingCourse, setEditingCourse] = useState(null);
    const [formData, setFormData] = useState({
        code: '',
        name: '',
        credits: 3,
        requiresLab: false
    });

    const fetchData = async () => {
        try {
            setLoading(true);
            const coursesData = await api.get('/courses');
            setCourses(coursesData);
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

    const handleOpen = (course = null) => {
        if (course) {
            setEditingCourse(course);
            setFormData({
                code: course.code,
                name: course.name,
                credits: course.credits,
                requiresLab: course.requiresLab
            });
        } else {
            setEditingCourse(null);
            setFormData({
                code: '',
                name: '',
                credits: 3,
                requiresLab: false
            });
        }
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setEditingCourse(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingCourse) {
                await api.put(`/courses/${editingCourse.id}`, formData);
            } else {
                await api.post('/courses', formData);
            }
            fetchData();
            handleClose();
        } catch (err) {
            setError(err.message || 'Failed to save course');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this course?')) {
            try {
                await api.delete(`/courses/${id}`);
                fetchData();
            } catch (err) {
                setError(err.message || 'Failed to delete course');
            }
        }
    };

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box>;

    console.log('Courses Data:', courses);

    if (!Array.isArray(courses)) {
        return <Alert severity="error">Invalid data format received from server.</Alert>;
    }

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Box>
                    <Typography variant="h4" fontWeight={700}>Course Management</Typography>
                    <Typography variant="body2" color="text.secondary">Manage your academic courses and requirements</Typography>
                </Box>
                <Stack direction="row" spacing={2}>
                    <Button
                        variant="outlined"
                        startIcon={<Upload size={20} />}
                        sx={{ py: 1.2, px: 3 }}
                        onClick={() => setBulkOpen(true)}
                    >
                        Bulk Add
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<Plus size={20} />}
                        sx={{ py: 1.2, px: 3 }}
                        onClick={() => handleOpen()}
                    >
                        Add New Course
                    </Button>
                </Stack>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>{error}</Alert>}

            <TableContainer component={Paper} sx={{ borderRadius: 3, overflow: 'hidden' }}>
                <Table sx={{ minWidth: 650 }}>
                    <TableHead sx={{ backgroundColor: '#f1f5f9' }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 600 }}>Course Code</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Course Name</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Credits</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Lab Required</TableCell>
                            <TableCell sx={{ fontWeight: 600 }} align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {courses.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                                    No courses found. Add your first course to get started!
                                </TableCell>
                            </TableRow>
                        ) : courses.map((course) => (
                            <TableRow key={course.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                <TableCell component="th" scope="row" sx={{ fontWeight: 600, color: 'primary.main' }}>
                                    {course.code}
                                </TableCell>
                                <TableCell>{course.name}</TableCell>
                                <TableCell>{course.credits}</TableCell>
                                <TableCell>{course.requiresLab ? 'Yes' : 'No'}</TableCell>
                                <TableCell align="right">
                                    <IconButton size="small" color="primary" onClick={() => handleOpen(course)}>
                                        <Edit size={18} />
                                    </IconButton>
                                    <IconButton size="small" color="error" onClick={() => handleDelete(course.id)}>
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
                    <DialogTitle>{editingCourse ? 'Edit Course' : 'Add New Course'}</DialogTitle>
                    <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
                        <TextField
                            label="Course Code"
                            fullWidth
                            value={formData.code}
                            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                            required
                        />
                        <TextField
                            label="Course Name"
                            fullWidth
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                        />
                        <TextField
                            type="number"
                            label="Credits"
                            fullWidth
                            value={formData.credits}
                            onChange={(e) => setFormData({ ...formData, credits: parseInt(e.target.value) })}
                            required
                        />
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={formData.requiresLab}
                                    onChange={(e) => setFormData({ ...formData, requiresLab: e.target.checked })}
                                />
                            }
                            label="Requires Lab Room"
                        />
                    </DialogContent>
                    <DialogActions sx={{ px: 3, pb: 2 }}>
                        <Button onClick={handleClose}>Cancel</Button>
                        <Button type="submit" variant="contained">Save Course</Button>
                    </DialogActions>
                </form>
            </Dialog>
            {/* Bulk Add Dialog */}
            <Dialog open={bulkOpen} onClose={() => setBulkOpen(false)} maxWidth="md" fullWidth>
                <DialogTitle>Bulk Add Courses</DialogTitle>
                <DialogContent sx={{ pt: 2 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Paste your course list below. Format: <b>Code, Name, Credits, RequiresLab (true/false)</b>.
                        One course per line.
                    </Typography>
                    <TextField
                        multiline
                        rows={10}
                        fullWidth
                        placeholder="CS101, Introduction to Programming, 3, true&#10;MA102, Calculus I, 4, false"
                        value={bulkText}
                        onChange={(e) => setBulkText(e.target.value)}
                    />
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={() => setBulkOpen(false)}>Cancel</Button>
                    <Button
                        variant="contained"
                        onClick={async () => {
                            const lines = bulkText.split('\n').filter(line => line.trim() !== '');
                            const coursesToCreate = lines.map(line => {
                                const [code, name, credits, requiresLab] = line.split(',').map(s => s.trim());
                                return {
                                    code,
                                    name,
                                    credits: parseInt(credits) || 3,
                                    requiresLab: requiresLab?.toLowerCase() === 'true'
                                };
                            }).filter(c => c.code && c.name);

                            if (coursesToCreate.length === 0) {
                                setError('No valid courses found to upload.');
                                return;
                            }

                            try {
                                await api.post('/courses/bulk', { courses: coursesToCreate });
                                fetchData();
                                setBulkOpen(false);
                                setBulkText('');
                            } catch (err) {
                                setError(err.message || 'Failed to bulk upload courses');
                            }
                        }}
                    >
                        Upload {bulkText.split('\n').filter(l => l.trim() !== '').length} Courses
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default CourseManagement;

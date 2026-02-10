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
    MenuItem,
    Alert,
    CircularProgress,
    Stack
} from '@mui/material';
import { Plus, Trash2, Layers } from 'lucide-react';
import api from '../services/api';

const ClassManagement = () => {
    const [classes, setClasses] = useState([]);
    const [courses, setCourses] = useState([]);
    const [instructors, setInstructors] = useState([]);
    const [programs, setPrograms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Dialog state
    const [open, setOpen] = useState(false);
    const [formData, setFormData] = useState({
        courseId: '',
        instructorId: '',
        academicYear: '2025-2026',
        semester: 'SEM1',
        programId: '',
        yearLevel: ''
    });

    const yearLevels = [
        "Freshman (Sept)",
        "Freshman (Jan)",
        "Sophomore",
        "Junior",
        "Senior"
    ];

    const fetchData = async () => {
        try {
            setLoading(true);
            const [classesData, coursesData, instructorsData, programsData] = await Promise.all([
                api.get('/classes'),
                api.get('/courses'),
                api.get('/instructors'),
                api.get('/programs')
            ]);
            setClasses(classesData);
            setCourses(coursesData);
            setInstructors(instructorsData);
            setPrograms(programsData);

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

    const handleOpen = () => {
        setFormData({
            courseId: '',
            instructorId: '',
            academicYear: '2025-2026',
            semester: 'SEM1',
            programId: '',
            yearLevel: ''
        });
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/classes', formData);
            fetchData();
            handleClose();
        } catch (err) {
            setError(err.message || 'Failed to save class');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this class?')) {
            try {
                await api.delete(`/classes/${id}`);
                fetchData();
            } catch (err) {
                setError(err.message || 'Failed to delete class');
            }
        }
    };

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box>;

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Box>
                    <Typography variant="h4" fontWeight={700}>Classes</Typography>
                    <Typography variant="body2" color="text.secondary">Assign courses to instructors for specific cohorts</Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<Plus size={20} />}
                    sx={{ py: 1.2, px: 3 }}
                    onClick={() => handleOpen()}
                >
                    Add Class
                </Button>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

            <TableContainer component={Paper} sx={{ borderRadius: 3, overflow: 'hidden' }}>
                <Table>
                    <TableHead sx={{ backgroundColor: '#f1f5f9' }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 600 }}>Course</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Instructor</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Cohort</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Semester</TableCell>
                            <TableCell sx={{ fontWeight: 600 }} align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {classes.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                                    No classes found. Start by assigning an instructor to a course!
                                </TableCell>
                            </TableRow>
                        ) : classes.map((classItem) => (
                            <TableRow key={classItem.id} hover>
                                <TableCell sx={{ fontWeight: 600 }}>
                                    <Stack direction="row" spacing={1} alignItems="center">
                                        <Layers size={16} color="#6366f1" />
                                        <Box>
                                            <Typography variant="body2" fontWeight={600}>{classItem.course?.code}</Typography>
                                            <Typography variant="caption" color="text.secondary">{classItem.course?.name}</Typography>
                                        </Box>
                                    </Stack>
                                </TableCell>
                                <TableCell>
                                    {classItem.instructor?.user?.firstName} {classItem.instructor?.user?.lastName}
                                </TableCell>
                                <TableCell>
                                    <Box>
                                        <Typography variant="body2" fontWeight={500}>{classItem.program?.name || 'N/A'}</Typography>
                                        <Typography variant="caption" color="text.secondary">{classItem.yearLevel}</Typography>
                                    </Box>
                                </TableCell>
                                <TableCell>{classItem.semester}</TableCell>
                                <TableCell align="right">
                                    <IconButton size="small" color="error" onClick={() => handleDelete(classItem.id)}>
                                        <Trash2 size={18} />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Add Dialog */}
            <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
                <form onSubmit={handleSubmit}>
                    <DialogTitle>Add Class</DialogTitle>
                    <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <TextField
                                select
                                label="Program"
                                fullWidth
                                value={formData.programId}
                                onChange={(e) => setFormData({ ...formData, programId: e.target.value })}
                                required
                            >
                                {programs.map((prog) => (
                                    <MenuItem key={prog.id} value={prog.id}>
                                        {prog.name}
                                    </MenuItem>
                                ))}
                            </TextField>
                            <TextField
                                select
                                label="Year Level"
                                fullWidth
                                value={formData.yearLevel}
                                onChange={(e) => setFormData({ ...formData, yearLevel: e.target.value })}
                                required
                            >
                                {yearLevels.map((level) => (
                                    <MenuItem key={level} value={level}>
                                        {level}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Box>

                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <TextField
                                select
                                label="Course"
                                fullWidth
                                value={formData.courseId}
                                onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                                required
                            >
                                {courses.map((course) => (
                                    <MenuItem key={course.id} value={course.id}>
                                        {course.code} - {course.name}
                                    </MenuItem>
                                ))}
                            </TextField>
                            <TextField
                                select
                                label="Instructor"
                                fullWidth
                                value={formData.instructorId}
                                onChange={(e) => setFormData({ ...formData, instructorId: e.target.value })}
                                required
                            >
                                {instructors.map((inst) => (
                                    <MenuItem key={inst.id} value={inst.id}>
                                        {inst.user?.firstName} {inst.user?.lastName}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Box>

                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <TextField
                                select
                                label="Semester"
                                fullWidth
                                value={formData.semester}
                                onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                                required
                            >
                                <MenuItem value="SEM1">Semester 1</MenuItem>
                                <MenuItem value="SEM2">Semester 2</MenuItem>
                            </TextField>
                            <TextField
                                label="Academic Year"
                                fullWidth
                                value={formData.academicYear}
                                onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                                required
                                placeholder="2025-2026"
                            />
                        </Box>
                    </DialogContent>
                    <DialogActions sx={{ px: 3, pb: 2 }}>
                        <Button onClick={handleClose}>Cancel</Button>
                        <Button type="submit" variant="contained">Create Class</Button>
                    </DialogActions>
                </form>
            </Dialog>
        </Box >
    );
};

export default ClassManagement;

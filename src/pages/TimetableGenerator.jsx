import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Button,
    Paper,
    Grid,
    Card,
    CardContent,
    Divider,
    Stack,
    Chip,
    Alert,
    CircularProgress,
    MenuItem,
    TextField,
    Menu
} from '@mui/material';
import { RotateCcw, Download, Sparkles, FileText, FileSpreadsheet } from 'lucide-react';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import api from '../services/api';

const TimetableGenerator = () => {
    const [sessions, setSessions] = useState([]);
    const [programs, setPrograms] = useState([]);
    const [instructors, setInstructors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [error, setError] = useState('');

    // View Mode: 'STUDENT' or 'INSTRUCTOR'
    const [viewMode, setViewMode] = useState('STUDENT');

    const [filters, setFilters] = useState({
        academicYear: '2025-2026',
        semester: 'SEM1',
        programId: 'ALL',
        yearLevel: 'ALL',
        instructorId: 'ALL'
    });

    const yearLevels = [
        "Freshman (Sept)",
        "Freshman (Jan)",
        "Sophomore",
        "Junior",
        "Senior"
    ];

    const [exportAnchorEl, setExportAnchorEl] = useState(null);
    const openExport = Boolean(exportAnchorEl);

    const handleExportClick = (event) => {
        setExportAnchorEl(event.currentTarget);
    };

    const handleExportClose = () => {
        setExportAnchorEl(null);
    };

    const fetchSessions = async () => {
        try {
            setLoading(true);
            const [sessionsData, programsData, instructorsData] = await Promise.all([
                api.get(`/scheduling?academicYear=${filters.academicYear}&semester=${filters.semester}`),
                api.get('/programs'),
                api.get('/instructors')
            ]);
            setSessions(sessionsData);
            setPrograms(programsData);
            setInstructors(instructorsData);

            setError('');
        } catch (err) {
            setError('Failed to fetch timetable sessions.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSessions();
    }, [filters.academicYear, filters.semester]); // Refetch only when year/semester changes

    const handleGenerate = async () => {
        try {
            setGenerating(true);
            await api.post('/scheduling/generate', filters);
            fetchSessions();
        } catch (err) {
            setError(err.message || 'Failed to generate schedule. Ensure you have added courses, instructors, and offerings.');
        } finally {
            setGenerating(false);
        }
    };

    const handleReset = async () => {
        if (window.confirm('Are you sure you want to clear the current schedule?')) {
            try {
                alert('Reset logic is integrated into Generate. Existing schedules for the semester are cleared before new ones are created.');
            } catch (err) {
                setError('Failed to reset schedule.');
            }
        }
    };

    const getDayName = (dayNum) => {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        return days[dayNum];
    };

    const handleExportPDF = () => {
        const doc = jsPDF();
        const title = viewMode === 'STUDENT'
            ? `Timetable - ${programs.find(p => p.id === filters.programId)?.name || 'All Programs'} - ${filters.academicYear}`
            : `Instructor Timetable - ${filters.instructorId !== 'ALL' ? instructors.find(i => i.id === filters.instructorId)?.user.firstName : 'All'} - ${filters.academicYear}`;

        doc.setFontSize(18);
        doc.text(title, 14, 22);
        doc.setFontSize(11);
        doc.setTextColor(100);
        doc.text(`Generated on: ${new Date().toLocaleDateString()} | Semester: ${filters.semester}`, 14, 30);

        const tableData = sessions
            .filter(session => {
                if (viewMode === 'STUDENT') {
                    const progMatch = filters.programId === 'ALL' || session.class.programId === filters.programId;
                    const levelMatch = filters.yearLevel === 'ALL' || session.class.yearLevel === filters.yearLevel;
                    return progMatch && levelMatch;
                } else {
                    return filters.instructorId === 'ALL' || session.class.instructorId === filters.instructorId;
                }
            })
            .sort((a, b) => (a.slot.dayOfWeek - b.slot.dayOfWeek) || a.slot.startTime.localeCompare(b.slot.startTime))
            .map(session => [
                getDayName(session.slot.dayOfWeek),
                `${session.slot.startTime} - ${session.slot.endTime}`,
                `${session.class.course.code}: ${session.class.course.name}`,
                `${session.class.instructor.user.firstName} ${session.class.instructor.user.lastName}`,
                session.room?.number || 'TBA',
                session.class.program?.name || 'N/A'
            ]);

        autoTable(doc, {
            head: [['Day', 'Time', 'Course', 'Instructor', 'Room', 'Program']],
            body: tableData,
            startY: 40,
            theme: 'striped',
            headStyles: { fillColor: [99, 102, 241] }
        });

        doc.save(`timetable_${viewMode.toLowerCase()}_${new Date().getTime()}.pdf`);
        handleExportClose();
    };

    const handleExportCSV = () => {
        const headers = ['Day', 'Start Time', 'End Time', 'Course Code', 'Course Name', 'Instructor', 'Room', 'Program', 'Level'];
        const rows = sessions
            .filter(session => {
                if (viewMode === 'STUDENT') {
                    const progMatch = filters.programId === 'ALL' || session.class.programId === filters.programId;
                    const levelMatch = filters.yearLevel === 'ALL' || session.class.yearLevel === filters.yearLevel;
                    return progMatch && levelMatch;
                } else {
                    return filters.instructorId === 'ALL' || session.class.instructorId === filters.instructorId;
                }
            })
            .sort((a, b) => (a.slot.dayOfWeek - b.slot.dayOfWeek) || a.slot.startTime.localeCompare(b.slot.startTime))
            .map(session => [
                getDayName(session.slot.dayOfWeek),
                session.slot.startTime,
                session.slot.endTime,
                session.class.course.code,
                session.class.course.name,
                `${session.class.instructor.user.firstName} ${session.class.instructor.user.lastName}`,
                session.room?.number || 'TBA',
                session.class.program?.name || 'N/A',
                session.class.yearLevel
            ]);

        const csvContent = [headers, ...rows]
            .map(row => row.map(cell => `"${cell || ''}"`).join(','))
            .join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `timetable_${viewMode.toLowerCase()}_${new Date().getTime()}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        handleExportClose();
    };

    // Helper to map DB sessions to FullCalendar events
    const mapSessionsToEvents = () => {
        return sessions
            .filter(session => {
                if (viewMode === 'STUDENT') {
                    const progMatch = filters.programId === 'ALL' || session.class.programId === filters.programId;
                    const levelMatch = filters.yearLevel === 'ALL' || session.class.yearLevel === filters.yearLevel;
                    return progMatch && levelMatch;
                } else {
                    // Instructor View
                    return filters.instructorId === 'ALL' || session.class.instructorId === filters.instructorId;
                }
            })
            .map(session => {
                const today = new Date();
                const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay())); // Sunday
                const eventDate = new Date(startOfWeek);
                eventDate.setDate(startOfWeek.getDate() + session.slot.dayOfWeek);

                const [startH, startM] = session.slot.startTime.split(':');
                const [endH, endM] = session.slot.endTime.split(':');

                const start = new Date(eventDate);
                start.setHours(parseInt(startH), parseInt(startM), 0);

                const end = new Date(eventDate);
                end.setHours(parseInt(endH), parseInt(endM), 0);

                return {
                    title: `${session.class.course.code} - ${session.class.course.name}`,
                    start: start.toISOString(),
                    end: end.toISOString(),
                    extendedProps: {
                        room: session.room?.number || 'N/A',
                        instructor: session.class?.instructor?.user ? `${session.class.instructor.user.firstName} ${session.class.instructor.user.lastName}` : 'N/A',
                        cohort: `${session.class?.program?.name || 'N/A'} - ${session.class?.yearLevel || ''}`
                    },
                    backgroundColor: '#6366f1',
                    borderColor: 'transparent'
                };
            });
    };

    if (loading && !generating) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box>;

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Box>
                    <Typography variant="h4" fontWeight={700}>Timetable Generator</Typography>
                    <Typography variant="body2" color="text.secondary">Generate and optimize conflict-free schedules</Typography>
                </Box>
                <Stack direction="row" spacing={2} alignItems="center">

                    {/* View Switcher */}
                    <Box sx={{ display: 'flex', bgcolor: '#f1f5f9', borderRadius: 2, p: 0.5 }}>
                        <Button
                            size="small"
                            variant={viewMode === 'STUDENT' ? 'contained' : 'text'}
                            onClick={() => setViewMode('STUDENT')}
                            sx={{ borderRadius: 1.5, textTransform: 'none', boxShadow: viewMode === 'STUDENT' ? 2 : 0 }}
                        >
                            Student View
                        </Button>
                        <Button
                            size="small"
                            variant={viewMode === 'INSTRUCTOR' ? 'contained' : 'text'}
                            onClick={() => setViewMode('INSTRUCTOR')}
                            sx={{ borderRadius: 1.5, textTransform: 'none', boxShadow: viewMode === 'INSTRUCTOR' ? 2 : 0 }}
                        >
                            Instructor View
                        </Button>
                    </Box>

                    {viewMode === 'STUDENT' ? (
                        <>
                            <TextField
                                select
                                size="small"
                                label="Program"
                                value={filters.programId}
                                onChange={(e) => setFilters({ ...filters, programId: e.target.value })}
                                sx={{ width: 180 }}
                            >
                                <MenuItem value="ALL">All Programs</MenuItem>
                                {programs.map((prog) => (
                                    <MenuItem key={prog.id} value={prog.id}>{prog.name}</MenuItem>
                                ))}
                            </TextField>
                            <TextField
                                select
                                size="small"
                                label="Level"
                                value={filters.yearLevel}
                                onChange={(e) => setFilters({ ...filters, yearLevel: e.target.value })}
                                sx={{ width: 140 }}
                            >
                                <MenuItem value="ALL">All Levels</MenuItem>
                                {yearLevels.map((level) => (
                                    <MenuItem key={level} value={level}>{level}</MenuItem>
                                ))}
                            </TextField>
                        </>
                    ) : (
                        <TextField
                            select
                            size="small"
                            label="Instructor"
                            value={filters.instructorId}
                            onChange={(e) => setFilters({ ...filters, instructorId: e.target.value })}
                            sx={{ width: 200 }}
                        >
                            <MenuItem value="ALL">All Instructors</MenuItem>
                            {instructors.map((inst) => (
                                <MenuItem key={inst.id} value={inst.id}>
                                    {inst.user.firstName} {inst.user.lastName}
                                </MenuItem>
                            ))}
                        </TextField>
                    )}

                    <TextField
                        select
                        size="small"
                        label="Semester"
                        value={filters.semester}
                        onChange={(e) => setFilters({ ...filters, semester: e.target.value })}
                        sx={{ width: 120 }}
                    >
                        <MenuItem value="SEM1">Sem 1</MenuItem>
                        <MenuItem value="SEM2">Sem 2</MenuItem>
                    </TextField>
                    <Button
                        variant="outlined"
                        startIcon={<RotateCcw size={18} />}
                        onClick={handleReset}
                    >
                        Reset
                    </Button>
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={generating ? <CircularProgress size={18} color="inherit" /> : <Sparkles size={18} />}
                        sx={{ boxShadow: '0 4px 14px 0 rgba(99, 102, 241, 0.39)' }}
                        onClick={handleGenerate}
                        disabled={generating}
                    >
                        {generating ? 'Generating...' : 'Generate Schedule'}
                    </Button>
                </Stack>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

            <Grid container spacing={3}>
                <Grid item xs={12} lg={9}>
                    <Paper sx={{ p: 2, borderRadius: 3, overflow: 'hidden' }}>
                        <FullCalendar
                            plugins={[timeGridPlugin]}
                            initialView="timeGridWeek"
                            headerToolbar={false}
                            events={mapSessionsToEvents()}
                            slotMinTime="07:30:00"
                            slotMaxTime="18:00:00"
                            allDaySlot={false}
                            height="650px"
                            themeSystem="standard"
                            slotEventOverlap={false}
                            eventContent={(eventInfo) => (
                                <Box sx={{ p: 0.5, overflow: 'hidden' }}>
                                    <Typography variant="caption" sx={{ fontWeight: 700, display: 'block', color: '#fff', fontSize: '0.7rem' }}>
                                        {eventInfo.event.title}
                                    </Typography>
                                    <Typography variant="caption" sx={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.8)' }}>
                                        {eventInfo.event.extendedProps.room} | {eventInfo.event.extendedProps.cohort}
                                    </Typography>
                                </Box>
                            )}
                        />
                    </Paper>
                </Grid>

                <Grid item xs={12} lg={3}>
                    <Stack spacing={3}>
                        <Card sx={{ borderRadius: 3 }}>
                            <CardContent>
                                <Typography variant="h6" fontWeight={700} gutterBottom>Status</Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                    <Chip
                                        label={sessions.length > 0 ? "Generated" : "Empty"}
                                        color={sessions.length > 0 ? "success" : "warning"}
                                        size="small"
                                        variant="outlined"
                                    />
                                    <Typography variant="caption" color="text.secondary">
                                        {sessions.length} sessions
                                    </Typography>
                                </Box>
                                <Divider sx={{ mb: 2 }} />
                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                    {sessions.length > 0
                                        ? "Current schedule is optimized and conflict-free."
                                        : "Detecting zero data. Please ensure offerings are created first."}
                                </Typography>
                                <Button
                                    fullWidth
                                    variant="contained"
                                    sx={{ mt: 2 }}
                                    disabled={sessions.length === 0}
                                    startIcon={<Download size={18} />}
                                    onClick={handleExportClick}
                                >
                                    Export Timetable
                                </Button>
                                <Menu
                                    anchorEl={exportAnchorEl}
                                    open={openExport}
                                    onClose={handleExportClose}
                                >
                                    <MenuItem onClick={handleExportPDF} sx={{ gap: 1.5 }}>
                                        <FileText size={18} /> Export as PDF
                                    </MenuItem>
                                    <MenuItem onClick={handleExportCSV} sx={{ gap: 1.5 }}>
                                        <FileSpreadsheet size={18} /> Export as CSV
                                    </MenuItem>
                                </Menu>
                            </CardContent>
                        </Card>

                        <Card sx={{ borderRadius: 3 }}>
                            <CardContent>
                                <Typography variant="h6" fontWeight={700} gutterBottom>Insights</Typography>
                                <Typography variant="body2" color="text.secondary">
                                    The AI-powered scheduling engine ensures every student and instructor has a valid, conflict-free slot.
                                </Typography>
                            </CardContent>
                        </Card>
                    </Stack>
                </Grid>
            </Grid>
        </Box>
    );
};

export default TimetableGenerator;

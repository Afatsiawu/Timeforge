import React from 'react';
import { ThemeProvider, CssBaseline, Box, Typography, Button } from '@mui/material';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import theme from './theme';
import MainLayout from './components/layout/MainLayout';
import Dashboard from './pages/Dashboard';
import CourseManagement from './pages/CourseManagement';
import InstructorManagement from './pages/InstructorManagement';
import RoomManagement from './pages/RoomManagement';
import TimetableGenerator from './pages/TimetableGenerator';
import ClassManagement from './pages/ClassManagement';
import Settings from './pages/Settings';
import Login from './pages/Login';
import AnimatedPage from './components/common/AnimatedPage';
import { AuthProvider, useAuth } from './context/AuthContext';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <Box sx={{ p: 5, textAlign: 'center' }}>
          <Typography variant="h5" color="error" gutterBottom>Something went wrong.</Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>{this.state.error?.toString()}</Typography>
          <Button variant="contained" onClick={() => window.location.reload()}>Reload Page</Button>
        </Box>
      );
    }
    return this.props.children;
  }
}

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  console.log('ProtectedRoute:', { user: !!user, loading });

  if (loading) return null; // Or a loading spinner

  if (!user) {
    console.log('No user, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  return <MainLayout>{children}</MainLayout>;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/courses" element={<ProtectedRoute><CourseManagement /></ProtectedRoute>} />
      <Route path="/instructors" element={<ProtectedRoute><InstructorManagement /></ProtectedRoute>} />
      <Route path="/rooms" element={<ProtectedRoute><RoomManagement /></ProtectedRoute>} />
      <Route path="/classes" element={<ProtectedRoute><ClassManagement /></ProtectedRoute>} />
      <Route path="/timetable" element={<ProtectedRoute><TimetableGenerator /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <ErrorBoundary>
            <AppRoutes />
          </ErrorBoundary>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;

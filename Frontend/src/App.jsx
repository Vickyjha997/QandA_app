import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Navbar } from './components/Navbar';
import { Login } from './pages/common/Login';
import { Register } from './pages/common/Register';
import { StudentDashboard } from './pages/student/StudentDashboard';
import { AskAI } from './pages/student/AskAI';
import { TutorsList } from './pages/student/TutorsList';
import { BookMeeting } from './pages/student/BookMeeting';
import { StudentMeetings } from './pages/student/StudentMeetings';
import { TutorDashboard } from './pages/tutor/TutorDashboard';
import { TutorAvailability } from './pages/tutor/TutorAvailability';
import { TutorMeetings } from './pages/tutor/TutorMeetings';
import { config } from './config';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1
    }
  }
});

function App() {
  return (
    <GoogleOAuthProvider clientId={config.GOOGLE_CLIENT_ID}>
      <QueryClientProvider client={queryClient}>
        <Router>
          <AuthProvider>
            <SocketProvider>
              <div className="min-h-screen bg-gray-50">
                <Navbar />
                <Routes>
                  {/* Public Routes */}
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  
                  {/* Student Routes */}
                  <Route path="/student/dashboard" element={<ProtectedRoute requiredRole="student"><StudentDashboard /></ProtectedRoute>} />
                  <Route path="/student/ask-ai" element={<ProtectedRoute requiredRole="student"><AskAI /></ProtectedRoute>} />
                  <Route path="/student/tutors" element={<ProtectedRoute requiredRole="student"><TutorsList /></ProtectedRoute>} />
                  <Route path="/student/book-meeting/:subject" element={<ProtectedRoute requiredRole="student"><BookMeeting /></ProtectedRoute>} />
                  <Route path="/student/meetings" element={<ProtectedRoute requiredRole="student"><StudentMeetings /></ProtectedRoute>} />
                  
                  {/* Tutor Routes */}
                  <Route path="/tutor/dashboard" element={<ProtectedRoute requiredRole="tutor"><TutorDashboard /></ProtectedRoute>} />
                  <Route path="/tutor/availability" element={<ProtectedRoute requiredRole="tutor"><TutorAvailability /></ProtectedRoute>} />
                  <Route path="/tutor/meetings" element={<ProtectedRoute requiredRole="tutor"><TutorMeetings /></ProtectedRoute>} />

                  {/* Default Routes */}
                  <Route path="/" element={<Navigate to="/login" replace />} />
                  <Route path="*" element={<Navigate to="/login" replace />} />
                </Routes>
                
                <Toaster
                  position="top-right"
                  toastOptions={{
                    duration: 3000,
                    style: {
                      background: '#fff',
                      color: '#333',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      borderRadius: '8px',
                      padding: '16px'
                    },
                    success: {
                      iconTheme: {
                        primary: '#10B981',
                        secondary: '#fff'
                      }
                    },
                    error: {
                      iconTheme: {
                        primary: '#EF4444',
                        secondary: '#fff'
                      }
                    }
                  }}
                />
              </div>
            </SocketProvider>
          </AuthProvider>
        </Router>
      </QueryClientProvider>
    </GoogleOAuthProvider>
  );
}

export default App;

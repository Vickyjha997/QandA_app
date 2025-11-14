import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BookOpen, LogOut, User, Home, HelpCircle, Calendar, Users } from 'lucide-react';

export const Navbar = () => {
  const { user, logout, isAuthenticated, isStudent, isTutor } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            {isTutor && <Link to="/tutor/Dashboard" className="flex items-center space-x-2">
              <BookOpen className="h-8 w-8 text-primary-600" />
              <span className="text-xl font-bold text-gray-900">Student-Tutor</span>
            </Link>
            }
            {isStudent && <Link to="/student/Dashboard" className="flex items-center space-x-2">
              <BookOpen className="h-8 w-8 text-primary-600" />
              <span className="text-xl font-bold text-gray-900">Student-Tutor</span>
            </Link>
            }
          </div>

          {isAuthenticated && (
            <div className="flex items-center space-x-4">
              <Link to={`/${user.role}/dashboard`} className="flex items-center space-x-2 text-gray-700 hover:text-primary-600 transition-colors">
                <Home className="h-5 w-5" />
                <span className="hidden sm:block">Dashboard</span>
              </Link>

              {isStudent && (
                <>
                  <Link to="/student/ask-ai" className="flex items-center space-x-2 text-gray-700 hover:text-primary-600 transition-colors">
                    <HelpCircle className="h-5 w-5" />
                    <span className="hidden sm:block">Ask AI</span>
                  </Link>
                  <Link to="/student/meetings" className="flex items-center space-x-2 text-gray-700 hover:text-primary-600 transition-colors">
                    <Calendar className="h-5 w-5" />
                    <span className="hidden sm:block">Meetings</span>
                  </Link>
                  <Link to="/student/tutors" className="flex items-center space-x-2 text-gray-700 hover:text-primary-600 transition-colors">
                    <Users className="h-5 w-5" />
                    <span className="hidden sm:block">Tutors</span>
                  </Link>
                </>
              )}

              {isTutor && (
                <>
                  <Link to="/tutor/availability" className="flex items-center space-x-2 text-gray-700 hover:text-primary-600 transition-colors">
                    <Calendar className="h-5 w-5" />
                    <span className="hidden sm:block">Availability</span>
                  </Link>
                  <Link to="/tutor/meetings" className="flex items-center space-x-2 text-gray-700 hover:text-primary-600 transition-colors">
                    <Users className="h-5 w-5" />
                    <span className="hidden sm:block">Meetings</span>
                  </Link>
                </>
              )}

              <div className="flex items-center space-x-2 text-gray-700">
                <User className="h-5 w-5" />
                <span className="hidden sm:block">{user.name}</span>
              </div>

              <button onClick={handleLogout} className="flex items-center space-x-2 text-gray-700 hover:text-red-600 transition-colors">
                <LogOut className="h-5 w-5" />
                <span className="hidden sm:block">Logout</span>
              </button>
            </div>
          )}

          {!isAuthenticated && (
            <div className="flex items-center space-x-4">
              <Link to="/login" className="text-gray-700 hover:text-primary-600 transition-colors">Login</Link>
              <Link to="/register" className="btn-primary">Register</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

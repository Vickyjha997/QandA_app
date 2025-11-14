import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';
import { BookOpen, Mail, Lock, User } from 'lucide-react';
import { config } from '../../config';

export const Login = () => {
  const navigate = useNavigate();
  const { login, loginWithGoogle } = useAuth();
  const [role, setRole] = useState('student');
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(formData, role);
      navigate(`/${role}/dashboard`);
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      await loginWithGoogle(credentialResponse.credential, role);
      navigate(`/${role}/dashboard`);
    } catch (error) {
      console.error('Google login error:', error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-purple-50 py-12 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <BookOpen className="h-16 w-16 text-primary-600 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-gray-900">Welcome Back</h2>
          <p className="mt-2 text-gray-600">Sign in to your account</p>
        </div>

        <div className="card">
          <div className="flex rounded-lg bg-gray-100 p-1 mb-6">
            <button onClick={() => setRole('student')} className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${role === 'student' ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-600'}`}>
              <User className="h-4 w-4 inline-block mr-2" />Student
            </button>
            <button onClick={() => setRole('tutor')} className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${role === 'tutor' ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-600'}`}>
              <User className="h-4 w-4 inline-block mr-2" />Tutor
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label"><Mail className="h-4 w-4 inline-block mr-2" />Email</label>
              <input type="email" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="input" placeholder="Enter your email" />
            </div>
            <div>
              <label className="label"><Lock className="h-4 w-4 inline-block mr-2" />Password</label>
              <input type="password" required value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} className="input" placeholder="Enter your password" />
            </div>
            <button type="submit" disabled={loading} className="w-full btn-primary">{loading ? 'Signing in...' : 'Sign In'}</button>
          </form>

          <div className="mt-6">
            <div className="relative"><div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-300"></div></div><div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-gray-500">Or continue with</span></div></div>
            <div className="mt-4 flex justify-center">
              <GoogleLogin onSuccess={handleGoogleSuccess} onError={() => console.log('Login Failed')} />
            </div>
          </div>

          <div className="mt-6 text-center text-sm">
            <span className="text-gray-600">Don't have an account? </span>
            <Link to="/register" className="text-primary-600 hover:text-primary-700 font-medium">Register now</Link>
          </div>
        </div>
      </div>
    </div>
  );
};
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { BookOpen, Mail, Lock, User, GraduationCap, Building, Phone } from 'lucide-react';

const SUBJECTS = ['Maths', 'Computer Science', 'DSA', 'Development', 'MERN', 'Spring Boot'];

export const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [role, setRole] = useState('student');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNumber: '',    // 📌 NEW FIELD
    password: '',
    college: '',
    class: '',
    subject: ''
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const dataToSubmit = { ...formData };

    if (role === 'student') delete dataToSubmit.subject;
    else delete dataToSubmit.class;

    try {
      await register(dataToSubmit, role);
      navigate(`/${role}/dashboard`);
    } catch (error) {
      console.error('Registration error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-purple-50 py-12 px-4">
      <div className="max-w-md w-full">

        <div className="text-center mb-8">
          <BookOpen className="h-16 w-16 text-primary-600 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-gray-900">Create Account</h2>
          <p className="mt-2 text-gray-600">Join our learning platform</p>
        </div>

        <div className="card">
          
          {/* Role Switch */}
          <div className="flex rounded-lg bg-gray-100 p-1 mb-6">
            <button
              onClick={() => setRole('student')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                role === 'student'
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-gray-600'
              }`}
            >
              <User className="h-4 w-4 inline-block mr-2" />Student
            </button>

            <button
              onClick={() => setRole('tutor')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                role === 'tutor'
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-gray-600'
              }`}
            >
              <GraduationCap className="h-4 w-4 inline-block mr-2" />Tutor
            </button>
          </div>

          {/* FORM */}
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* FULL NAME */}
            <div>
              <label className="label">
                <User className="h-4 w-4 inline-block mr-2" />Full Name
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="input"
              />
            </div>

            {/* EMAIL */}
            <div>
              <label className="label">
                <Mail className="h-4 w-4 inline-block mr-2" />Email
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="input"
              />
            </div>

            {/* PHONE NUMBER (E.164) */}
            <div>
              <label className="label">
                <Phone className="h-4 w-4 inline-block mr-2" />Phone Number
              </label>
              <input
                type="text"
                required
                placeholder="+91XXXXXXXXXX"
                value={formData.phoneNumber}
                onChange={(e) =>
                  setFormData({ ...formData, phoneNumber: e.target.value })
                }
                className="input"
              />
            </div>

            {/* PASSWORD */}
            <div>
              <label className="label">
                <Lock className="h-4 w-4 inline-block mr-2" />Password
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="input"
              />
            </div>

            {/* COLLEGE */}
            <div>
              <label className="label">
                <Building className="h-4 w-4 inline-block mr-2" />College
              </label>
              <input
                type="text"
                value={formData.college}
                onChange={(e) =>
                  setFormData({ ...formData, college: e.target.value })
                }
                className="input"
              />
            </div>

            {/* CLASS/YEAR — Student Only */}
            {role === 'student' && (
              <div>
                <label className="label">
                  <GraduationCap className="h-4 w-4 inline-block mr-2" />Class/Year
                </label>
                <input
                  type="text"
                  value={formData.class}
                  onChange={(e) =>
                    setFormData({ ...formData, class: e.target.value })
                  }
                  className="input"
                />
              </div>
            )}

            {/* SUBJECT — Tutor Only */}
            {role === 'tutor' && (
              <div>
                <label className="label">
                  <GraduationCap className="h-4 w-4 inline-block mr-2" />Subject
                </label>
                <select
                  required
                  value={formData.subject}
                  onChange={(e) =>
                    setFormData({ ...formData, subject: e.target.value })
                  }
                  className="input"
                >
                  <option value="">Select subject</option>
                  {SUBJECTS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* SUBMIT BUTTON */}
            <button type="submit" disabled={loading} className="w-full btn-primary">
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          {/* LOGIN LINK */}
          <div className="mt-6 text-center text-sm">
            <span className="text-gray-600">Already have an account? </span>
            <Link
              to="/login"
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              Sign in
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HeartPulse } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'patient'
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { register, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate(`/${user.role}/dashboard`, { replace: true });
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validate = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.name.trim()) return 'Full name is required.';
    if (formData.name.trim().length < 2) return 'Name must be at least 2 characters.';
    if (!formData.email.trim()) return 'Email is required.';
    if (!emailRegex.test(formData.email)) return 'Please enter a valid email address.';
    if (!formData.password) return 'Password is required.';
    if (formData.password.length < 6) return 'Password must be at least 6 characters.';
    if (!['patient', 'doctor', 'staff'].includes(formData.role)) return 'Please select a valid role.';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError('');
    setIsLoading(true);

    try {
      const data = await register(formData);
      navigate(`/${data.data.user.role}/dashboard`);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (user) return null;

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 antialiased font-sans">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-sm border border-slate-200">

        <div className="flex flex-col items-center mb-8">
          <div className="bg-slate-100 border border-slate-200 p-3 rounded-xl mb-4 text-slate-800">
            <HeartPulse className="h-8 w-8" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Create Account</h2>
          <p className="text-sm text-slate-500 mt-2">Join MedFlow today</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl text-sm font-medium border border-red-100 flex items-center">
             <div className="w-2 h-2 rounded-full bg-red-500 mr-2 flex-shrink-0"></div>
             {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <div>
            <label htmlFor="reg-name" className="block text-sm font-semibold text-slate-900 mb-1.5 ml-1">Full Name</label>
            <input
              id="reg-name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-4 focus:ring-slate-900/5 focus:border-slate-800 transition-all duration-200"
              placeholder="John Doe"
              autoComplete="name"
            />
          </div>

          <div>
            <label htmlFor="reg-email" className="block text-sm font-semibold text-slate-900 mb-1.5 ml-1">Email</label>
            <input
              id="reg-email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-4 focus:ring-slate-900/5 focus:border-slate-800 transition-all duration-200"
              placeholder="name@hospital.org"
              autoComplete="email"
            />
          </div>

          <div>
            <label htmlFor="reg-password" className="block text-sm font-semibold text-slate-900 mb-1.5 ml-1">Password</label>
            <input
              id="reg-password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-4 focus:ring-slate-900/5 focus:border-slate-800 transition-all duration-200"
              placeholder="Min. 6 characters"
              autoComplete="new-password"
            />
          </div>

          <div>
            <label htmlFor="reg-role" className="block text-sm font-semibold text-slate-900 mb-1.5 ml-1">Role</label>
            <select
              id="reg-role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-4 focus:ring-slate-900/5 focus:border-slate-800 transition-all duration-200 appearance-none cursor-pointer"
            >
              <option value="patient">Patient</option>
              <option value="doctor">Doctor</option>
              <option value="staff">Staff</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-slate-800 hover:bg-slate-900 text-white font-medium py-3 rounded-xl transition-colors shadow-sm flex justify-center items-center mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/20 border-t-white"></div>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <p className="text-center text-sm mt-8 text-slate-500">
          Already have an account? <Link to="/login" className="font-semibold text-sky-600 hover:text-sky-700 hover:underline">Sign In</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;

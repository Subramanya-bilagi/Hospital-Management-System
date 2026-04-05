import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HeartPulse } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate(`/${user.role}/dashboard`, { replace: true });
    }
  }, [user, navigate]);

  const validate = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) return 'Email is required.';
    if (!emailRegex.test(email)) return 'Please enter a valid email address.';
    if (!password) return 'Password is required.';
    if (password.length < 6) return 'Password must be at least 6 characters.';
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
      const data = await login(email, password);
      navigate(`/${data.data.user.role}/dashboard`);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  if (user) return null;

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 antialiased font-sans">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-sm border border-slate-200">

        <div className="flex flex-col items-center mb-10">
          <div className="bg-slate-100 border border-slate-200 p-3 rounded-xl mb-4 text-slate-800">
            <HeartPulse className="h-8 w-8" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Welcome to MedFlow</h2>
          <p className="text-sm text-slate-500 mt-2">Sign in to your account</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl text-sm font-medium border border-red-100 flex items-center">
             <div className="w-2 h-2 rounded-full bg-red-500 mr-2 flex-shrink-0"></div>
             {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          <div>
            <label htmlFor="login-email" className="block text-sm font-semibold text-slate-900 mb-1.5 ml-1">Email</label>
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-4 focus:ring-slate-900/5 focus:border-slate-800 transition-all duration-200"
              placeholder="name@hospital.org"
              autoComplete="email"
            />
          </div>

          <div>
            <label htmlFor="login-password" className="block text-sm font-semibold text-slate-900 mb-1.5 ml-1">Password</label>
            <input
              id="login-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-4 focus:ring-slate-900/5 focus:border-slate-800 transition-all duration-200"
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-slate-800 hover:bg-slate-900 text-white font-medium py-3 rounded-xl transition-colors shadow-sm flex justify-center items-center disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/20 border-t-white"></div>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <p className="text-center text-sm mt-8 text-slate-500">
          Don't have an account? <Link to="/register" className="font-semibold text-sky-600 hover:text-sky-700 hover:underline">Register</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;

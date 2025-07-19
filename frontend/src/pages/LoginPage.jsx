import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { Edit3, Leaf, Mail, Lock, Eye, EyeOff, ArrowRight, LogIn } from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login, loginWithGoogle } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
 
    try {
      await login(email, password);
      showToast('Login successful!', 'success');
      navigate('/dashboard');
    } catch (err) {
      showToast('Failed to login. Please check your credentials.', 'error');
      setError('Failed to login. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      await loginWithGoogle();
      showToast('Login successful!', 'success');
      navigate('/dashboard');
    } catch (err) {
      showToast('Google login failed.', 'error');
      setError('Google login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12 bg-gradient-to-br from-cream-light to-slate dark:from-charcoal-light dark:to-charcoal">
      <div className="w-full max-w-4xl flex shadow-lg rounded-lg overflow-hidden bg-white dark:bg-gray-800">
        {/* Left Side - Illustration or Info */}
        <div className="hidden md:flex flex-col justify-center items-center w-1/2 bg-slate-light dark:bg-charcoal-light p-8">
          <div className="mb-8">
            <div className="w-16 h-16 bg-slate rounded-lg flex items-center justify-center mx-auto mb-4">
              <Edit3 className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl pl-13 font-bold text-slate-dark dark:text-white mb-2">Welcome Back!</h2>
            <p className="pl-10 text-gray-700 dark:text-gray-300">Sign in to continue</p>
          </div>
        </div>
        {/* Right Side - Login Form */}
        <div className="w-full md:w-1/2 p-8 relative">
          <div className="absolute top-4 right-4 opacity-20">
            <Leaf className="w-16 h-16 text-slate transform rotate-12" />
          </div>
          <div className="relative z-10">
            <h1 className="text-2xl font-bold text-slate mb-2">LOGIN</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">Sign in to your account to continue</p>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  EMAIL ID
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email Address"
                    className="input-field pl-10"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  PASSWORD
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Secret Shhhh"
                    className="input-field pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="text-right">
                <Link 
                  to="/forgot-password"
                  className="text-sm text-slate hover:text-slate-dark transition-colors"
                >
                  Forgot Password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary py-4 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Signing in...' : 'LOGIN'}
              </button>
            </form>
            <div className="mt-4">
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg py-3 font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <LogIn className="w-5 h-5" />
                Continue with Google
              </button>
            </div>
            <div className="mt-6 text-center">
              <span className="text-gray-600 dark:text-gray-400">Do you have an account? </span>
              <Link 
                to="/signup"
                className="text-slate font-medium hover:text-slate-dark transition-colors"
              >
                Register
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
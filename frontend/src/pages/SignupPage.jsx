import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { Highlighter, Leaf, User, Mail, Lock, Eye, EyeOff } from 'lucide-react';

const SignupPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { signup } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (name.length < 4 || name.length > 20) {
      showToast('Username must be between 4 and 20 characters', 'error');
      setError('Username must be between 4 and 20 characters');
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      showToast('Passwords do not match', 'error');
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      showToast('Password must be at least 6 characters long', 'error');
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    try {
      await signup(name, email, password);
      showToast('Account created successfully!', 'success');
      navigate('/dashboard');
    } catch (err) {
      showToast('Failed to create account. Please try again.', 'error');
      setError('Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12 bg-gradient-to-br from-cream-light to-slate dark:from-charcoal-dark dark:to-charcoal">
      <div className="w-full max-w-4xl flex shadow-lg rounded-lg overflow-hidden bg-white dark:bg-gray-800">
        {/* Left Side  */}
        <div className="hidden md:flex flex-col justify-center items-center w-1/2 bg-slate-light dark:bg-charcoal-light p-8">
          <div className="mb-8">
            <div className="w-16 h-16 bg-slate rounded-lg flex items-center justify-center mx-auto mb-4">
              <Highlighter className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl pl-13 font-bold text-slate-dark dark:text-white mb-2">Create Account</h2>
            <p className="pl-10 text-gray-700 dark:text-gray-300">Register to get started</p>
          </div>
        </div>
        {/* Right Side */}
        <div className="w-full md:w-1/2 p-8 relative">
          <div className="absolute top-4 right-4 opacity-20">
            <Leaf className="w-16 h-16 text-slate transform -rotate-12" />
          </div>
          <div className="relative z-10">
            <h1 className="text-2xl font-bold text-slate mb-2">REGISTER</h1>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  NAME
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="What should I call you?"
                    className="input-field pl-10"
                    required
                  />
                </div>
              </div>

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

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  CONFIRM PASSWORD
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Again Secret Shhhh"
                    className="input-field pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary py-4 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating account...' : 'REGISTER'}
              </button>
            </form>
            <div className="mt-6 text-center">
              <span className="text-gray-600 dark:text-gray-400">Do you have an account? </span>
              <Link 
                to="/login"
                className="text-slate font-medium hover:text-slate-dark transition-colors"
              >
                Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
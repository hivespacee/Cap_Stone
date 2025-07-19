import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Edit3, Leaf, Mail, ArrowLeft } from 'lucide-react';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  
  const { resetPassword } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      await resetPassword(email);
      setMessage('Check your email for password reset instructions');
    } catch (err) {
      setError('Failed to reset password. Please check your email address.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12 bg-gradient-to-br from-cream-light to-slate dark:from-charcoal-dark dark:to-charcoal">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-8 h-8 bg-slate rounded-lg flex items-center justify-center">
              <Edit3 className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">Chotaa Notion</span>
          </Link>
        </div>

        {/* Reset Password Card */}
        <div className="card p-8 relative overflow-hidden">
          {/* Decorative leaf */}
          <div className="absolute top-4 right-4 opacity-20">
            <Leaf className="w-16 h-16 text-slate transform rotate-45" />
          </div>
          
          <div className="relative z-10">
            <Link 
              to="/login"
              className="inline-flex items-center gap-2 text-slate hover:text-slate-dark transition-colors mb-6"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to login
            </Link>

            <h1 className="text-2xl font-bold text-slate mb-2">Reset Password</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Enter your email address and we'll send you instructions to reset your password.
            </p>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg mb-4">
                {error}
              </div>
            )}

            {message && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400 px-4 py-3 rounded-lg mb-4">
                {message}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  EMAIL ADDRESS
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

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary py-4 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Sending...' : 'Send Reset Instructions'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <span className="text-gray-600 dark:text-gray-400">Remember your password? </span>
              <Link 
                to="/login"
                className="text-slate font-medium hover:text-slate-dark transition-colors"
              >
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { useTheme } from './contexts/ThemeContext';
import { ToastProvider } from './contexts/ToastContext';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import Dashboard from './pages/Dashboard';
import DocumentEditor from './pages/DocumentEditor';
import ProfilePage from './pages/ProfilePage';
import Loading from './components/LoadingSymbol';

function App() {
  const { user, loading } = useAuth();
  const { isDark } = useTheme();

  if (loading) {
    return <Loading />;
  }

  return (
    <ToastProvider>
      <div className={isDark ? 'dark' : ''}>
        <div className="min-h-screen bg-cream dark:bg-charcoal transition-colors duration-300 animate-fade-in">
          <Routes>
            <Route 
              path="/" 
              element={user ? <Navigate to="/dashboard" /> : <LandingPage />} 
            />
            <Route 
              path="/login" 
              element={user ? <Navigate to="/dashboard" /> : <LoginPage />} 
            />
            <Route 
              path="/signup" 
              element={user ? <Navigate to="/dashboard" /> : <SignupPage />} 
            />
            <Route 
              path="/forgot-password" 
              element={user ? <Navigate to="/dashboard" /> : <ForgotPasswordPage />} 
            />
            <Route 
              path="/dashboard" 
              element={user ? <Dashboard /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/document/:id" 
              element={user ? <DocumentEditor /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/profile" 
              element={user ? <ProfilePage /> : <Navigate to="/login" />} 
            />
            <Route 
              path="*" 
              element={user ? <Navigate to="/dashboard"/> : <Navigate to="/" />} 
            />
          </Routes>
        </div>
      </div>
    </ToastProvider>
  );
}

export default App;
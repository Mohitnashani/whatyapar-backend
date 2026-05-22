import { BrowserRouter as Router, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { useContext } from 'react';
import { Toaster } from 'react-hot-toast';
import CustomerForm from './pages/CustomerForm';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import Landing from './pages/Landing';
import { AuthProvider, AuthContext } from './context/AuthContext';
import './App.css';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Redirect based on auth status
const HomeRoute = () => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return null;
  // If logged in go to dashboard, else show landing page
  return user ? <Navigate to="/dashboard" replace /> : <Landing />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
          <Toaster 
            position="top-right" 
            toastOptions={{
              className: 'font-medium text-sm',
              duration: 3000,
              style: {
                borderRadius: '12px',
                background: '#333',
                color: '#fff',
              },
            }} 
          />
          <Routes>
            <Route path="/" element={<HomeRoute />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            {/* The dynamic store link (e.g. whatyapar.com/my-store) */}
            <Route path="/:storeSlug" element={<CustomerForm />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;

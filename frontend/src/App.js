import '@/App.css';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import Landing from '@/pages/Landing';
import Login from '@/pages/Login';
import Signup from '@/pages/Signup';
import AuthCallback from '@/pages/AuthCallback';
import Dashboard from '@/pages/Dashboard';
import CreatePortfolio from '@/pages/CreatePortfolio';
import EditPortfolio from '@/pages/EditPortfolio';
import Pricing from '@/pages/Pricing';
import Settings from '@/pages/Settings';
import PublicPortfolio from '@/pages/PublicPortfolio';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Toaster } from '@/components/ui/sonner';
import VerifyEmail from "@/pages/VerifyEmail";


function AppRouter() {
  const location = useLocation();
  
  // Check URL fragment for session_id synchronously (prevents race conditions)
  if (location.hash?.includes('session_id=')) {
    return <AuthCallback />;
  }
  
  return (
    <>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/p/:slug" element={<PublicPortfolio />} />
        <Route path="/verify" element={<VerifyEmail />} />

        
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/portfolio/create" element={
          <ProtectedRoute>
            <CreatePortfolio />
          </ProtectedRoute>
        } />
        <Route path="/portfolio/edit/:id" element={
          <ProtectedRoute>
            <EditPortfolio />
          </ProtectedRoute>
        } />
        <Route path="/settings" element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        } />
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster position="top-right" />
    </>
  );
}

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <AuthProvider>
          <AppRouter />
        </AuthProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
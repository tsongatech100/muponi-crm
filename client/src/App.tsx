import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Contacts from './pages/Contacts';
import Opportunities from './pages/Opportunities';
import Activities from './pages/Activities';
import NCR from './pages/NCR';
import Documents from './pages/Documents';
import Suppliers from './pages/Suppliers';
import Compliance from './pages/Compliance';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return user ? <>{children}</> : <Navigate to="/login" />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/contacts"
        element={
          <PrivateRoute>
            <Layout>
              <Contacts />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/opportunities"
        element={
          <PrivateRoute>
            <Layout>
              <Opportunities />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/activities"
        element={
          <PrivateRoute>
            <Layout>
              <Activities />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/ncr"
        element={
          <PrivateRoute>
            <Layout>
              <NCR />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/documents"
        element={
          <PrivateRoute>
            <Layout>
              <Documents />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/suppliers"
        element={
          <PrivateRoute>
            <Layout>
              <Suppliers />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/compliance"
        element={
          <PrivateRoute>
            <Layout>
              <Compliance />
            </Layout>
          </PrivateRoute>
        }
      />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

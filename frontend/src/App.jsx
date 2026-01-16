import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Tables from './pages/Tables.jsx';
import Menu from './pages/Menu.jsx';
import Orders from './pages/Orders.jsx';
import Kitchen from './pages/Kitchen.jsx';
import Cashier from './pages/Cashier.jsx';
import Admin from './pages/Admin.jsx';
import Navbar from './components/Navbar.jsx';
import Loading from './components/Loading.jsx';

function App() {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return <Loading />;
  }

  const ProtectedRoute = ({ children, allowedRoles }) => {
    if (!isAuthenticated) {
      return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
      return <Navigate to="/dashboard" replace />;
    }

    return children;
  };

  const RoleBasedRedirect = () => {
    if (!isAuthenticated) {
      return <Navigate to="/login" replace />;
    }

    switch (user.role) {
      case 'admin':
        return <Navigate to="/admin" replace />;
      case 'manager':
        return <Navigate to="/dashboard" replace />;
      case 'waiter':
        return <Navigate to="/tables" replace />;
      case 'kitchen':
        return <Navigate to="/kitchen" replace />;
      case 'cashier':
        return <Navigate to="/cashier" replace />;
      default:
        return <Navigate to="/dashboard" replace />;
    }
  };

  return (
    <Router>
      <div className="min-h-screen bg-base-200">
        {isAuthenticated && <Navbar />}
        <main className={isAuthenticated ? 'container mx-auto px-4 py-8' : ''}>
          <Routes>
            <Route path="/login" element={
              isAuthenticated ? <RoleBasedRedirect /> : <Login />
            } />
            
            <Route path="/" element={<RoleBasedRedirect />} />
            
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            
            <Route path="/tables" element={
              <ProtectedRoute allowedRoles={['waiter', 'admin', 'manager']}>
                <Tables />
              </ProtectedRoute>
            } />
            
            <Route path="/menu" element={
              <ProtectedRoute allowedRoles={['admin', 'manager']}>
                <Menu />
              </ProtectedRoute>
            } />
            
            <Route path="/orders" element={
              <ProtectedRoute allowedRoles={['waiter', 'admin', 'manager']}>
                <Orders />
              </ProtectedRoute>
            } />
            
            <Route path="/kitchen" element={
              <ProtectedRoute allowedRoles={['kitchen', 'admin']}>
                <Kitchen />
              </ProtectedRoute>
            } />
            
            <Route path="/cashier" element={
              <ProtectedRoute allowedRoles={['cashier', 'admin']}>
                <Cashier />
              </ProtectedRoute>
            } />
            
            <Route path="/admin" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Admin />
              </ProtectedRoute>
            } />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
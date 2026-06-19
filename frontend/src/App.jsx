import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Catalog from './pages/Catalog';
import Login from './pages/Login';
import Register from './pages/Register';
import Cart from './pages/Cart';
import Orders from './pages/Orders';

// Route protector for Authenticated users
const ProtectedRoute = ({ children }) => {
  const { token } = useAuth();
  return token ? children : <Navigate to="/login" replace />;
};

// Route protector for Customer role only
const CustomerRoute = ({ children }) => {
  const { token, isCustomer } = useAuth();
  if (!token) return <Navigate to="/login" replace />;
  return isCustomer() ? children : <Navigate to="/" replace />;
};

const AppContent = () => {
  return (
    <Router>
      <Navbar />
      <Routes>
        {/* Public Catalog page */}
        <Route path="/" element={<Catalog />} />

        {/* Auth routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Customer Only Cart */}
        <Route 
          path="/cart" 
          element={
            <CustomerRoute>
              <Cart />
            </CustomerRoute>
          } 
        />

        {/* Authenticated Customer/Admin Orders */}
        <Route 
          path="/orders" 
          element={
            <ProtectedRoute>
              <Orders />
            </ProtectedRoute>
          } 
        />

        {/* Fallback to catalog */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;

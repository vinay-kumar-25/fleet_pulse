import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import Vehicles from './pages/Vehicles';
import VehicleDetails from './pages/VehicleDetails';
import ServiceRecords from './pages/ServiceRecords';
import MyAssignments from './pages/MyAssignments';
import Alerts from './pages/Alerts';  

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useApp();

  if (!user) return <Navigate to="/login" replace />;

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={user.role === 'fleet_manager' ? '/dashboard' : '/my-assignments'} replace />;
  }

  return children;
};

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <Navbar />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={['fleet_manager']}>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/vehicles"
            element={
              <ProtectedRoute allowedRoles={['fleet_manager']}>
                <Vehicles />
              </ProtectedRoute>
            }
          />
          <Route
            path="/vehicles/:id"
            element={
              <ProtectedRoute allowedRoles={['fleet_manager']}>
                <VehicleDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/service-records"
            element={
              <ProtectedRoute allowedRoles={['fleet_manager', 'technician']}>
                <ServiceRecords />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-assignments"
            element={
              <ProtectedRoute allowedRoles={['technician']}>
                <MyAssignments />
              </ProtectedRoute>
            }
          />
          <Route
            path="/alerts"
            element={
              <ProtectedRoute allowedRoles={['fleet_manager']}>
                <Alerts />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AppProvider>
    </BrowserRouter>
  );
}


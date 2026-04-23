import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Register from './pages/Register';
import Profile from './pages/Profile';
import TaskDetails from './pages/TaskDetails';
import ProtectedLayout from './components/ProtectedLayout';
import NotFoundPage from './components/NotFoundPage';

/**
 * AppRoutes — route configuration.
 *
 * Fix: Added the wildcard "*" fallback route so unknown paths show a
 * proper 404 page instead of a blank/broken render.
 */
const AppRoutes: React.FC = () => (
  <Routes>
    {/* Public routes */}
    <Route path="/" element={<Login />} />
    <Route path="/register" element={<Register />} />

    {/* Protected routes — ProtectedLayout handles session restoration */}
    <Route element={<ProtectedLayout />}>
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/task/:id" element={<TaskDetails />} />
    </Route>

    {/* Catch-all: show 404 for any unmatched path */}
    <Route path="*" element={<NotFoundPage />} />
  </Routes>
);

class App extends React.Component {
  render(): React.ReactNode {
    return (
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    );
  }
}

export default App;

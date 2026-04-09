// import { BrowserRouter, Routes, Route } from "react-router-dom";
// import Login from "./pages/Login";
// import Dashboard from "./pages/Dashboard";
// // Assuming this is where the 404 error logic lives
// import NotFoundPage from "./components/NotFoundPage.tsx";
// import ProtectedLayout from "./components/ProtectedLayout.tsx"; // NEW: Wrapper component

// function App() {
//   return (
//     <BrowserRouter>
//       <Routes>
//         {/* Public Routes */}
//         <Route path="/" element={<Login />} />

//         {/* Protected Routes Grouping */}
//         {/* By wrapping common paths in a Layout, you can apply shared elements 
//            (like Navigation or Sidebar) to all protected routes. */}
//         <Route element={<ProtectedLayout />}> 
//           <Route path="/dashboard" element={<Dashboard />} />
//           {/* Future Protected Routes go here:
//              <Route path="/profile" element={<ProfilePage />} />
//              <Route path="/settings" element={<SettingsPage />} />
//           */}
//         </Route>

//         {/* Fallback Route (Crucial for UX) */}
//         <Route path="*" element={<NotFoundPage />} /> 
//       </Routes>
//     </BrowserRouter>
//   );
// }

// export default App;

// import { BrowserRouter, Routes, Route } from "react-router-dom";
// import Login from "./pages/Login";
// import Dashboard from "./pages/Dashboard";
// import Register from "./pages/Register";


// function App() {
//   return (
//     <BrowserRouter>
//       <Routes>
//         <Route path="/register" element={<Register />} />
//         <Route path="/" element={<Login />} />
//         <Route path="/dashboard" element={<Dashboard />} />
//       </Routes>
//     </BrowserRouter>
//   );
// }

// export default App;


// <----------------------------------------------------------------------------->---------------------->


import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Register from './pages/Register';
import Profile from './pages/Profile';
import TaskDetails from './pages/TaskDetails';
import ProtectedLayout from './components/ProtectedLayout';

/**
 * AppRoutes: Handles the route configuration.
 * Separated to ensure Fast Refresh compatibility (only exports components).
 */
const AppRoutes: React.FC = () => (
  <Routes>
    <Route path="/register" element={<Register />} />
    <Route path="/" element={<Login />} />
    <Route element={<ProtectedLayout />}>
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/task/:id" element={<TaskDetails />} />
    </Route>
  </Routes>
);

/**
 * App: Class-based component for application root.
 * Manages the BrowserRouter and route structure.
 */
class App extends React.Component {
  /**
   * Renders the application with routing configuration.
   */
  render(): React.ReactNode {
    return (
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    );
  }
}

export default App;

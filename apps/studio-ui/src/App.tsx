import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { Home } from './pages/Home';
import { Apps } from './pages/Apps';
import { Discover } from './pages/Discover';
import { TemplatesPage } from './pages/TemplatesPage';
import { Agents } from './pages/Agents';
import { Workflows } from './pages/Workflows';
import { WorkflowEditor } from './pages/WorkflowEditor';
import { Deployments } from './pages/Deployments';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import './App.css';

interface User {
  email: string;
  first_name: string;
  last_name: string;
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (token && storedUser) {
      setIsAuthenticated(true);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const handleLogin = (token: string, userData: User) => {
    setIsAuthenticated(true);
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUser(null);
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: 'var(--bg-primary)',
        color: 'var(--text-secondary)'
      }}>
        Loading...
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route
          path="/login"
          element={
            isAuthenticated ?
              <Navigate to="/" replace /> :
              <Login onLogin={handleLogin} />
          }
        />
        <Route
          path="/register"
          element={
            isAuthenticated ?
              <Navigate to="/" replace /> :
              <Register onLogin={handleLogin} />
          }
        />

        {/* Protected routes */}
        <Route
          path="/*"
          element={
            isAuthenticated ? (
              <div className="app-main">
                <Sidebar user={user} onLogout={handleLogout} />
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/apps" element={<Apps />} />
                  <Route path="/agents" element={<Agents />} />
                  <Route path="/workflows" element={<Workflows />} />
                  <Route path="/workflows/editor" element={<WorkflowEditor user={user} />} />
                  <Route path="/workflows/editor/:id" element={<WorkflowEditor user={user} />} />
                  <Route path="/deployments" element={<Deployments />} />
                  <Route path="/discover" element={<Discover />} />
                  <Route path="/templates" element={<TemplatesPage />} />
                </Routes>
              </div>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>
    </Router>
  );
}

export default App;

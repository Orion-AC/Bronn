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
import { WorkspaceEditor } from './pages/WorkspaceEditor';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { ActivepiecesSSO } from './pages/ActivepiecesSSO';
import { LandingPage } from './pages/LandingPage';
import { onAuthStateChange, getIdToken, verifyTokenWithBackend, logout as firebaseLogout } from './lib/firebase';
import './App.css';

interface User {
  id?: string;
  email: string;
  first_name?: string | null;
  last_name?: string | null;
  display_name?: string | null;
  avatar_url?: string | null;
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check for existing session on mount and listen for auth state changes
  useEffect(() => {
    // First, check localStorage for existing session
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
        setIsAuthenticated(true);
      } catch (e) {
        // Invalid stored data, clear it
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }

    // Subscribe to Firebase auth state changes
    const unsubscribe = onAuthStateChange(async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // User is signed in, get fresh token
          const idToken = await getIdToken(true);
          if (idToken) {
            // Verify with backend and sync user data
            const data = await verifyTokenWithBackend(idToken);

            // Update stored data
            localStorage.setItem('token', idToken);
            localStorage.setItem('user', JSON.stringify(data.user));

            setUser(data.user);
            setIsAuthenticated(true);
          }
        } catch (error) {
          console.error('Auth state change error:', error);
          // Token verification failed, clear auth state
          handleLogout();
        }
      } else {
        // User is signed out
        setIsAuthenticated(false);
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('activepieces_token');
      }
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const handleLogin = (_token: string, userData: User) => {
    setIsAuthenticated(true);
    setUser(userData);
  };

  const handleLogout = async () => {
    try {
      // Sign out from Firebase
      await firebaseLogout();
    } catch (error) {
      console.error('Logout error:', error);
    }

    // Clear local state
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('activepieces_token');
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
        <div style={{ textAlign: 'center' }}>
          <div className="loading-spinner" style={{
            width: 40,
            height: 40,
            border: '3px solid rgba(255,255,255,0.1)',
            borderTop: '3px solid var(--accent-primary)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          Loading...
        </div>
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
              <Navigate to="/home" replace /> :
              <Login onLogin={handleLogin} />
          }
        />
        <Route
          path="/register"
          element={
            isAuthenticated ?
              <Navigate to="/home" replace /> :
              <Register onLogin={handleLogin} />
          }
        />

        {/* Public Landing Page */}
        <Route
          path="/"
          element={
            isAuthenticated ? <Navigate to="/home" replace /> : <LandingPage />
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
                  <Route path="/home" element={<Home />} />
                  <Route path="/workspaces" element={<Apps />} />
                  <Route path="/workspace/:id" element={<WorkspaceEditor />} />
                  <Route path="/agents" element={<Agents />} />
                  <Route path="/workflows" element={<Workflows />} />
                  <Route path="/workflows/sso" element={<ActivepiecesSSO />} />
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

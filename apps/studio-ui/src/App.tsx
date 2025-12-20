import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { Home } from './pages/Home';
import { Apps } from './pages/Apps';
import { Discover } from './pages/Discover';
import { TemplatesPage } from './pages/TemplatesPage';
import { Agents } from './pages/Agents';
import { Workflows } from './pages/Workflows';
import { WorkflowEditor } from './pages/WorkflowEditor';
import { Deployments } from './pages/Deployments';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app-main">
        <Sidebar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/apps" element={<Apps />} />
          <Route path="/agents" element={<Agents />} />
          <Route path="/workflows" element={<Workflows />} />
          <Route path="/workflows/editor" element={<WorkflowEditor />} />
          <Route path="/workflows/editor/:id" element={<WorkflowEditor />} />
          <Route path="/deployments" element={<Deployments />} />
          <Route path="/discover" element={<Discover />} />
          <Route path="/templates" element={<TemplatesPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;


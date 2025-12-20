import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Zap } from 'lucide-react';
import './WorkflowEditor.css';

// Activepieces URL - exposed on port 8080
const ACTIVEPIECES_URL = 'http://localhost:8080';

export const WorkflowEditor: React.FC = () => {
    const navigate = useNavigate();

    const handleOpenActivepieces = () => {
        // Open Activepieces in a new tab
        window.open(ACTIVEPIECES_URL, '_blank');
    };

    return (
        <div className="workflow-editor-container">
            <div className="workflow-breadcrumb">
                <a href="#" onClick={(e) => { e.preventDefault(); navigate('/workflows'); }}>
                    Workflows
                </a>
                <span>/</span>
                <span>Activepieces</span>
            </div>

            <div className="workflow-editor-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <button
                        className="workflow-editor-btn secondary"
                        onClick={() => navigate('/workflows')}
                    >
                        <ArrowLeft size={18} />
                        Back
                    </button>
                    <h1>Activepieces Workflow Engine</h1>
                </div>
            </div>

            <div className="workflow-redirect-content">
                <div className="redirect-card">
                    <div className="redirect-icon">
                        <Zap size={48} />
                    </div>
                    <h2>Open Activepieces</h2>
                    <p>
                        Create and manage powerful automation workflows with Activepieces.
                        Click below to open the workflow editor in a new tab.
                    </p>
                    <button
                        className="open-activepieces-btn"
                        onClick={handleOpenActivepieces}
                    >
                        <ExternalLink size={20} />
                        Open Workflow Editor
                    </button>
                    <div className="credentials-info">
                        <strong>Login Credentials:</strong>
                        <p>Use your Bronn account credentials to login.</p>
                        <p className="dev-note">
                            Dev mode: email <code>dev@ap.com</code> / password <code>12345678</code>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WorkflowEditor;

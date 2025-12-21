import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { ActivepiecesEmbed } from '../components/ActivepiecesEmbed';
import './WorkflowEditor.css';

interface WorkflowEditorProps {
    user?: { email: string; first_name: string; last_name: string } | null;
}

export const WorkflowEditor: React.FC<WorkflowEditorProps> = () => {
    const navigate = useNavigate();

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

            <div className="workflow-editor-content">
                <ActivepiecesEmbed />
            </div>
        </div>
    );
};

export default WorkflowEditor;

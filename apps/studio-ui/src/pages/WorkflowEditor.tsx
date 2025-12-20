import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, Save } from 'lucide-react';
import { PageLayout } from '../components/PageLayout';
import { ActivepiecesEmbed } from '../components/ActivepiecesEmbed';
import './WorkflowEditor.css';

export const WorkflowEditor: React.FC = () => {
    const navigate = useNavigate();

    const handleNavigate = (route: string) => {
        console.log('Activepieces navigation:', route);
    };

    return (
        <div className="workflow-editor-container">
            <div className="workflow-breadcrumb">
                <a href="#" onClick={(e) => { e.preventDefault(); navigate('/workflows'); }}>
                    Workflows
                </a>
                <span>/</span>
                <span>Activepieces Editor</span>
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
                    <h1>Workflow Editor</h1>
                </div>

                <div className="workflow-editor-actions">
                    <button className="workflow-editor-btn secondary">
                        <Save size={18} />
                        Save
                    </button>
                    <button className="workflow-editor-btn primary">
                        <Play size={18} />
                        Run
                    </button>
                </div>
            </div>

            <div className="workflow-editor-content">
                <ActivepiecesEmbed onNavigate={handleNavigate} />
            </div>
        </div>
    );
};

export default WorkflowEditor;

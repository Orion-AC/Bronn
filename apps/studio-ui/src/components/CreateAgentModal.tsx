import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import './CreateAgentModal.css';

interface WorkflowOption {
    id: string | number;
    name: string;
}

interface CreateAgentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export const CreateAgentModal: React.FC<CreateAgentModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const [name, setName] = useState('');
    const [role, setRole] = useState('General Assistant');
    const [skills, setSkills] = useState<string[]>([]);
    const [availableWorkflows, setAvailableWorkflows] = useState<WorkflowOption[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    React.useEffect(() => {
        if (isOpen) {
            fetch('/api/workflows')
                .then(res => res.json())
                .then(data => setAvailableWorkflows(data))
                .catch(err => console.error("Failed to fetch workflows", err));
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const res = await fetch('/api/agents', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name,
                    role,
                    status: 'idle',
                    skills
                })
            });

            if (res.ok) {
                onSuccess();
                onClose();
                setName('');
                setRole('General Assistant');
                setSkills([]);
            } else {
                console.error("Failed to create agent");
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
            <div className="modal-content">
                <div className="modal-header">
                    <h2 className="modal-title">Deploy New Agent</h2>
                    <p className="modal-subtitle">Configure your new autonomous worker.</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Agent Name</label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="e.g. Unit-01"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            autoFocus
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Role</label>
                        <select
                            className="form-select"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                        >
                            <option>General Assistant</option>
                            <option>Data Pipelines</option>
                            <option>Security Audit</option>
                            <option>UI Testing</option>
                            <option>Log Analysis</option>
                            <option>Code Reviewer</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Workflow Skills (Activepieces)</label>
                        <div className="skills-selection">
                            {availableWorkflows.length === 0 ? (
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>No workflows available. Create one in the Workflows tab.</p>
                            ) : (
                                <div className="skills-checkbox-group">
                                    {availableWorkflows.map(wf => (
                                        <label key={wf.id} className="skill-checkbox-item">
                                            <input
                                                type="checkbox"
                                                checked={skills.includes(wf.id.toString())}
                                                onChange={(e) => {
                                                    const id = wf.id.toString();
                                                    if (e.target.checked) {
                                                        setSkills([...skills, id]);
                                                    } else {
                                                        setSkills(skills.filter(s => s !== id));
                                                    }
                                                }}
                                            />
                                            <span>{wf.name}</span>
                                        </label>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="modal-actions">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                            {isSubmitting ? (
                                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <Loader2 size={14} className="spin-slow" /> Deploying...
                                </span>
                            ) : (
                                'Deploy Agent'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

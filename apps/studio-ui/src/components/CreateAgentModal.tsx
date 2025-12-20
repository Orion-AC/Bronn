import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import './CreateAgentModal.css';

interface CreateAgentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export const CreateAgentModal: React.FC<CreateAgentModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const [name, setName] = useState('');
    const [role, setRole] = useState('General Assistant');
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // Using query params to match python backend implementation
            const url = `/api/agents?name=${encodeURIComponent(name)}&role=${encodeURIComponent(role)}&status=idle`;

            const res = await fetch(url, { method: 'POST' });

            if (res.ok) {
                onSuccess();
                onClose();
                setName('');
                setRole('General Assistant');
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

import React from 'react';
import { Bot, Plus, Activity, Clock, Zap } from 'lucide-react';
import { PageLayout } from '../components/PageLayout';
import { CreateAgentModal } from '../components/CreateAgentModal';
import './Agents.css';

interface Agent {
    id: number;
    name: string;
    role: string;
    status: string;
    uptime: string;
    tests_run: string;
    skills?: string[];
}

export const Agents: React.FC = () => {
    const [agents, setAgents] = React.useState<Agent[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [isModalOpen, setIsModalOpen] = React.useState(false);

    const fetchAgents = () => {
        fetch('/api/agents')
            .then(res => res.json())
            .then(data => {
                setAgents(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to fetch agents", err);
                setLoading(false);
            });
    };

    React.useEffect(() => {
        fetchAgents();
    }, []);

    if (loading) {
        return (
            <PageLayout title="Agents" subtitle="Manage your AI workforce and autonomous assistants">
                <div style={{ color: 'var(--text-secondary)', padding: 40 }}>Loading Agents...</div>
            </PageLayout>
        );
    }

    return (
        <PageLayout
            title="Agents"
            subtitle="Manage your AI workforce and autonomous assistants"
        >
            <CreateAgentModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={fetchAgents}
            />

            <div className="agents-grid">
                {/* Create Card */}
                <div className="agent-card create-agent" onClick={() => setIsModalOpen(true)}>
                    <div className="agent-avatar" style={{ background: 'transparent', border: '1px solid var(--border-color)' }}>
                        <Plus size={24} />
                    </div>
                    <span className="create-text">Deploy New Agent</span>
                </div>

                {agents.map((agent) => (
                    <div key={agent.id} className="agent-card">
                        <div className="agent-header">
                            <div className="agent-avatar" style={{
                                background: agent.status === 'active' ? 'var(--accent-glow)' : agent.status === 'idle' ? 'var(--status-error-bg)' : 'var(--status-warning-bg)',
                                color: agent.status === 'active' ? 'var(--accent-color)' : agent.status === 'idle' ? 'var(--status-error)' : 'var(--status-warning)'
                            }}>
                                {agent.status === 'active' ? <Bot size={24} /> : agent.status === 'idle' ? <Activity size={24} /> : <Clock size={24} />}
                            </div>
                            <div className="agent-status" style={{
                                color: agent.status === 'active' ? 'var(--status-success)' : agent.status === 'idle' ? 'var(--text-secondary)' : 'var(--status-success)'
                            }}>
                                <div className={`status-dot status-${agent.status}`}></div>
                                {agent.status.charAt(0).toUpperCase() + agent.status.slice(1)}
                            </div>
                        </div>
                        <div className="agent-info">
                            <span className="agent-name">{agent.name}</span>
                            <span className="agent-role">{agent.role}</span>
                        </div>
                        <div className="agent-metrics">
                            <div className="metric">
                                <span className="metric-value">{agent.uptime}</span>
                                <span className="metric-label">Uptime</span>
                            </div>
                            <div className="metric">
                                <span className="metric-value">{agent.tests_run}</span>
                                <span className="metric-label">Tasks</span>
                            </div>
                        </div>
                        {agent.skills && agent.skills.length > 0 && (
                            <div className="agent-skills-display">
                                {agent.skills.map((skillId: string, idx: number) => (
                                    <div key={idx} className="skill-chip">
                                        <Zap size={10} />
                                        <span>Skill {skillId}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </PageLayout >
    );
};

import React from 'react';
import { PageLayout } from '../components/PageLayout';
import { GitCommit, Clock, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import './Deployments.css';

interface Deployment {
    id: string;
    commitMsg: string;
    commitHash: string;
    author: string;
    branch: string;
    status: 'live' | 'building' | 'failed';
    environment: string;
    deployedAt: string;
    duration: string;
}

const deployments: Deployment[] = [
    {
        id: '1',
        commitMsg: 'Update hero animation timings',
        commitHash: '8f2d1a3',
        author: 'Rishi M',
        branch: 'main',
        status: 'live',
        environment: 'Production',
        deployedAt: '2 mins ago',
        duration: '45s'
    },
    {
        id: '2',
        commitMsg: 'Fix sidebar navigation z-index',
        commitHash: '9a3b4c1',
        author: 'Rishi M',
        branch: 'main',
        status: 'live',
        environment: 'Production',
        deployedAt: '1 hour ago',
        duration: '1m 20s'
    },
    {
        id: '3',
        commitMsg: 'Add new analytics integration',
        commitHash: '2c5e8b9',
        author: 'Sarah K',
        branch: 'feat/analytics',
        status: 'building',
        environment: 'Preview',
        deployedAt: 'Running...',
        duration: '--'
    },
    {
        id: '4',
        commitMsg: 'Refactor auth middleware',
        commitHash: '7d4f2e1',
        author: 'Mike R',
        branch: 'dev',
        status: 'failed',
        environment: 'Staging',
        deployedAt: '4 hours ago',
        duration: '2m 10s'
    },
    {
        id: '5',
        commitMsg: 'Initial project setup',
        commitHash: '1a2b3c4',
        author: 'Rishi M',
        branch: 'main',
        status: 'live',
        environment: 'Production',
        deployedAt: '1 day ago',
        duration: '3m 45s'
    }
];

export const Deployments: React.FC = () => {
    return (
        <PageLayout
            title="Deployments"
            subtitle="Track release history and environment status across all apps."
        >
            <div className="deployments-container">
                {/* Stats */}
                <div className="deployments-stats">
                    <div className="stat-card">
                        <span className="stat-value">99.9%</span>
                        <span className="stat-label">Uptime</span>
                    </div>
                    <div className="stat-card">
                        <span className="stat-value">45s</span>
                        <span className="stat-label">Avg. Build Time</span>
                    </div>
                    <div className="stat-card">
                        <span className="stat-value">12</span>
                        <span className="stat-label">Deploys Today</span>
                    </div>
                    <div className="stat-card">
                        <span className="stat-value">3</span>
                        <span className="stat-label">Active Envs</span>
                    </div>
                </div>

                {/* List */}
                <div className="deployments-list">
                    <div className="deployment-header">
                        <span>Commit</span>
                        <span>Environment</span>
                        <span>Status</span>
                        <span>Duration</span>
                        <span>Deployed</span>
                    </div>

                    {deployments.map((deploy) => (
                        <div key={deploy.id} className="deployment-item">
                            <div>
                                <div className="commit-msg">{deploy.commitMsg}</div>
                                <div className="commit-author">
                                    <GitCommit size={12} style={{ marginRight: 4 }} />
                                    <span className="commit-hash">{deploy.commitHash}</span>
                                    <span style={{ margin: '0 6px' }}>•</span>
                                    {deploy.author} on {deploy.branch}
                                </div>
                            </div>

                            <div>
                                <span style={{
                                    border: '1px solid var(--border-subtle)',
                                    padding: '2px 8px',
                                    borderRadius: 4,
                                    fontSize: 12,
                                    color: 'var(--text-secondary)'
                                }}>
                                    {deploy.environment}
                                </span>
                            </div>

                            <div>
                                <div className={`status-badge ${deploy.status}`}>
                                    {deploy.status === 'live' && <CheckCircle2 size={12} />}
                                    {deploy.status === 'building' && <Loader2 size={12} className="spin-slow" />}
                                    {deploy.status === 'failed' && <XCircle size={12} />}
                                    {deploy.status.charAt(0).toUpperCase() + deploy.status.slice(1)}
                                </div>
                            </div>

                            <div className="duration-text">{deploy.duration}</div>

                            <div style={{ color: 'var(--text-secondary)', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
                                <Clock size={12} />
                                {deploy.deployedAt}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </PageLayout>
    );
};

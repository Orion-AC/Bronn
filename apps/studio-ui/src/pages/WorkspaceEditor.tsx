import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
    Zap,
    Bot,
    Code2,
    Play,
    Rocket,
    Terminal,
    Maximize2,
    ChevronRight,
    Search
} from 'lucide-react';
import './WorkspaceEditor.css';
import { ActivepiecesEmbed } from '../components/ActivepiecesEmbed';
import { Agents } from './Agents';

type Tab = 'workflows' | 'agents' | 'code';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || '';

// Convert HTTP URL to WebSocket URL
const getWebSocketUrl = (baseUrl: string, workspaceId: string): string => {
    const wsProtocol = baseUrl.startsWith('https') ? 'wss' : 'ws';
    const urlWithoutProtocol = baseUrl.replace(/^https?:\/\//, '');
    return `${wsProtocol}://${urlWithoutProtocol}/api/ws/logs/${workspaceId}`;
};

export const WorkspaceEditor: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [activeTab, setActiveTab] = useState<Tab>('workflows');
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [logs, setLogs] = useState<Array<{ time: string, type: string, message: string }>>([
        { time: new Date().toLocaleTimeString(), type: 'SYSTEM', message: 'Workspace initialized. Ready.' }
    ]);
    const [wsConnected, setWsConnected] = useState(false);

    // WebSocket for live logs with retry logic
    useEffect(() => {
        let ws: WebSocket | null = null;
        let retryCount = 0;
        const maxRetries = 3;
        const retryDelay = 2000;
        let retryTimeout: ReturnType<typeof setTimeout> | null = null;
        let isMounted = true;

        const connect = () => {
            if (!isMounted || !BACKEND_URL) return;

            const wsUrl = getWebSocketUrl(BACKEND_URL, id || 'default');
            ws = new WebSocket(wsUrl);

            ws.onopen = () => {
                if (isMounted) {
                    setWsConnected(true);
                    retryCount = 0;
                }
            };

            ws.onmessage = (event) => {
                if (isMounted) {
                    try {
                        const data = JSON.parse(event.data);
                        setLogs(prev => [...prev, data]);
                    } catch (e) {
                        // Ignore malformed messages
                    }
                }
            };

            ws.onclose = () => {
                if (isMounted) {
                    setWsConnected(false);
                    // Retry connection if not at max retries
                    if (retryCount < maxRetries) {
                        retryCount++;
                        retryTimeout = setTimeout(connect, retryDelay);
                    }
                }
            };

            ws.onerror = () => {
                // onclose will be called after onerror
            };
        };

        connect();

        return () => {
            isMounted = false;
            if (retryTimeout) clearTimeout(retryTimeout);
            if (ws) ws.close();
        };
    }, [id]);

    const handleRun = () => {
        setLogs(prev => [...prev, {
            time: new Date().toLocaleTimeString(),
            type: 'ACTION',
            message: `Starting execution of ${activeTab}...`
        }]);
        // Here we would call the backend to trigger the actual run
    };

    return (
        <div className="workspace-editor">
            {/* Sidebar - File/Resource Tree */}
            <aside className={`workspace-sidebar ${isSidebarCollapsed ? 'collapsed' : ''}`}>
                <div className="sidebar-header">
                    <span className="workspace-name">{id || 'New Workspace'}</span>
                    <button className="collapse-btn" onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}>
                        <ChevronRight size={14} className={isSidebarCollapsed ? 'rotate' : ''} />
                    </button>
                </div>

                {!isSidebarCollapsed && (
                    <div className="sidebar-content">
                        <div className="search-box">
                            <Search size={14} />
                            <input type="text" placeholder="Search files..." />
                        </div>

                        <div className="resource-groups">
                            <div className="group">
                                <div className="group-title">Workflows</div>
                                <div className={`resource-item ${activeTab === 'workflows' ? 'active' : ''}`} onClick={() => setActiveTab('workflows')}>
                                    <Zap size={14} /> <span>Main Automation</span>
                                </div>
                            </div>

                            <div className="group">
                                <div className="group-title">Agents</div>
                                <div className={`resource-item ${activeTab === 'agents' ? 'active' : ''}`} onClick={() => setActiveTab('agents')}>
                                    <Bot size={14} /> <span>Nexus Assistant</span>
                                </div>
                            </div>

                            <div className="group">
                                <div className="group-title">Code</div>
                                <div className={`resource-item ${activeTab === 'code' ? 'active' : ''}`} onClick={() => setActiveTab('code')}>
                                    <Code2 size={14} /> <span>main.py</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </aside>

            {/* Main Content Area */}
            <main className="workspace-main">
                {/* Header / Tabs */}
                <header className="workspace-header">
                    <div className="tabs">
                        <div className={`tab ${activeTab === 'workflows' ? 'active' : ''}`} onClick={() => setActiveTab('workflows')}>
                            <Zap size={14} /> Workflows
                        </div>
                        <div className={`tab ${activeTab === 'agents' ? 'active' : ''}`} onClick={() => setActiveTab('agents')}>
                            <Bot size={14} /> Agents
                        </div>
                        <div className={`tab ${activeTab === 'code' ? 'active' : ''}`} onClick={() => setActiveTab('code')}>
                            <Code2 size={14} /> Code
                        </div>
                    </div>

                    <div className="actions">
                        <button className="btn-run" onClick={handleRun}>
                            <Play size={14} fill="currentColor" /> Run
                        </button>
                        <button className="btn-deploy">
                            <Rocket size={14} /> Deploy
                        </button>
                    </div>
                </header>

                {/* Content Canvas */}
                <div className="workspace-canvas">
                    {activeTab === 'workflows' && (
                        <div className="canvas-content workflow-canvas" style={{ minHeight: '700px' }}>
                            <ActivepiecesEmbed />
                        </div>
                    )}

                    {activeTab === 'agents' && (
                        <div className="canvas-content agent-canvas">
                            <Agents />
                        </div>
                    )}

                    {activeTab === 'code' && (
                        <div className="canvas-content code-canvas">
                            <div className="code-placeholder">
                                <Code2 size={48} />
                                <p>Monaco Editor Integration Coming Soon</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Bottom Panel (Logs) */}
                <section className="workspace-panel">
                    <div className="panel-header">
                        <div className="panel-tabs">
                            <div className="panel-tab active"><Terminal size={14} /> Console</div>
                            <div className="panel-tab">Runs</div>
                        </div>
                        <button className="icon-btn"><Maximize2 size={14} /></button>
                    </div>
                    <div className="panel-content">
                        {logs.map((log, i) => (
                            <div key={i} className="log-entry">
                                <span className="log-time">[{log.time}]</span>
                                <span className={`log-info type-${log.type.toLowerCase()}`}>{log.type}:</span>
                                <span className="log-msg">{log.message}</span>
                            </div>
                        ))}
                    </div>
                </section>
            </main>
        </div>
    );
};

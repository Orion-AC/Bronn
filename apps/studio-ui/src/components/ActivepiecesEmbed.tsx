import { useEffect, useRef, useState } from 'react';

declare global {
    interface Window {
        activepieces?: {
            configure: (config: ActivepiecesConfig) => void;
        };
    }
}

interface ActivepiecesConfig {
    instanceUrl: string;
    jwtToken: string;
    prefix?: string;
    embedding?: {
        containerId: string;
        builder?: {
            disableNavigation?: boolean;
            hideFlowName?: boolean;
        };
        dashboard?: {
            hideSidebar?: boolean;
        };
        hideFolders?: boolean;
        navigation?: {
            handler?: (params: { route: string }) => void;
        };
    };
}

interface ActivepiecesEmbedProps {
    onNavigate?: (route: string) => void;
}

const ACTIVEPIECES_SDK_URL = 'https://cdn.activepieces.com/sdk/embed/0.8.1.js';

export const ActivepiecesEmbed: React.FC<ActivepiecesEmbedProps> = ({ onNavigate }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const scriptLoadedRef = useRef(false);

    // Fetch JWT token from backend
    useEffect(() => {
        const fetchToken = async () => {
            try {
                const response = await fetch('/api/workflows/engine/token');
                if (!response.ok) {
                    throw new Error('Failed to fetch embed token');
                }
                const data = await response.json();
                setToken(data.token);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load token');
                setLoading(false);
            }
        };

        fetchToken();
    }, []);

    // Load Activepieces SDK and configure
    useEffect(() => {
        if (!token || scriptLoadedRef.current) return;

        const loadScript = () => {
            return new Promise<void>((resolve, reject) => {
                // Check if script already loaded
                if (window.activepieces) {
                    resolve();
                    return;
                }

                const script = document.createElement('script');
                script.src = ACTIVEPIECES_SDK_URL;
                script.async = true;
                script.onload = () => resolve();
                script.onerror = () => reject(new Error('Failed to load Activepieces SDK'));
                document.body.appendChild(script);
            });
        };

        const initActivepieces = async () => {
            try {
                await loadScript();
                scriptLoadedRef.current = true;

                if (window.activepieces) {
                    window.activepieces.configure({
                        instanceUrl: 'http://localhost:8080', // Activepieces internal URL
                        jwtToken: token,
                        prefix: '/workflows/ap',
                        embedding: {
                            containerId: 'activepieces-container',
                            builder: {
                                disableNavigation: true,
                                hideFlowName: false,
                            },
                            dashboard: {
                                hideSidebar: true,
                            },
                            hideFolders: true,
                            navigation: {
                                handler: ({ route }) => {
                                    if (onNavigate) {
                                        onNavigate(route);
                                    }
                                },
                            },
                        },
                    });
                }

                setLoading(false);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to initialize Activepieces');
                setLoading(false);
            }
        };

        initActivepieces();
    }, [token, onNavigate]);

    if (error) {
        return (
            <div className="activepieces-error" style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                color: 'var(--text-secondary)',
                gap: '16px',
            }}>
                <div style={{ fontSize: '48px' }}>⚠️</div>
                <div>Failed to load workflow editor</div>
                <div style={{ fontSize: '12px', opacity: 0.7 }}>{error}</div>
                <button
                    onClick={() => window.location.reload()}
                    style={{
                        padding: '8px 16px',
                        background: 'var(--accent-primary)',
                        border: 'none',
                        borderRadius: '8px',
                        color: 'white',
                        cursor: 'pointer',
                    }}
                >
                    Retry
                </button>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="activepieces-loading" style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                color: 'var(--text-secondary)',
            }}>
                Loading workflow editor...
            </div>
        );
    }

    return (
        <div
            id="activepieces-container"
            ref={containerRef}
            style={{
                width: '100%',
                height: 'calc(100vh - 80px)',
                minHeight: '600px',
                background: 'var(--bg-secondary)',
                borderRadius: '12px',
                overflow: 'hidden',
            }}
        />
    );
};

export default ActivepiecesEmbed;

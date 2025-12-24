/**
 * Activepieces Embed Component
 * 
 * Uses the Activepieces embedding SDK (loaded via CDN in index.html) to embed
 * the workflow builder with proper authentication federation and white-label configuration.
 */

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { getAuth } from 'firebase/auth';

// Declare global activepieces type from CDN script
declare global {
    interface Window {
        activepieces?: {
            configure: (config: ActivepiecesConfig) => void;
            connect: (options: { prefix?: string; containerId?: string }) => void;
            disconnect: () => void;
        };
    }
}

interface ActivepiecesConfig {
    instanceUrl: string;
    jwtToken: string;
    embedding?: {
        builder?: {
            disableNavigation?: boolean;
            hideLogo?: boolean;
        };
        dashboard?: {
            hideSidebar?: boolean;
        };
        hideFolders?: boolean;
        hideLogoInBuilder?: boolean;
        styling?: {
            fontFamily?: string;
            primaryColor?: string;
        };
    };
}

interface ActivepiecesEmbedProps {
    projectId?: string;
    flowId?: string;
    /** Initial view: 'dashboard' shows all flows, 'builder' opens a specific flow */
    initialView?: 'dashboard' | 'builder';
}

export const ActivepiecesEmbed: React.FC<ActivepiecesEmbedProps> = ({
    projectId = "default",
    flowId,
    initialView = 'dashboard'
}) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [connected, setConnected] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const initializeEmbed = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            // Check if SDK is loaded
            if (!window.activepieces) {
                throw new Error('Activepieces SDK not loaded. Please refresh the page.');
            }

            // Get Firebase ID token
            const auth = getAuth();
            const user = auth.currentUser;

            if (!user) {
                throw new Error('User not authenticated. Please login first.');
            }

            const firebaseToken = await user.getIdToken();

            // Exchange Firebase token for Activepieces provisioning JWT
            const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';
            const response = await fetch(`${backendUrl}/api/auth/firebase-to-activepieces`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${firebaseToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ project_id: projectId })
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.detail || 'Failed to authenticate with Activepieces');
            }

            const { token: apToken, instance_url: instanceUrl } = await response.json();

            // For local development, ensure we use the browser-accessible URL
            const clientInstanceUrl = instanceUrl.includes('activepieces:80')
                ? 'http://localhost:8080'
                : instanceUrl;

            // Configure Activepieces SDK with white-label options
            window.activepieces.configure({
                instanceUrl: clientInstanceUrl,
                jwtToken: apToken,
                embedding: {
                    // Builder settings
                    builder: {
                        disableNavigation: false,
                        hideLogo: true,
                    },
                    // Dashboard settings
                    dashboard: {
                        hideSidebar: true,
                    },
                    // Branding settings
                    hideFolders: false,
                    hideLogoInBuilder: true,
                    // Styling to match Bronn theme
                    styling: {
                        fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
                        primaryColor: '#6366f1',
                    }
                }
            });

            // Connect to the appropriate view
            if (initialView === 'builder' && flowId) {
                window.activepieces.connect({
                    prefix: `/flows/${flowId}`,
                    containerId: 'activepieces-container'
                });
            } else {
                window.activepieces.connect({
                    prefix: '/flows',
                    containerId: 'activepieces-container'
                });
            }

            setConnected(true);
        } catch (err) {
            console.error('Activepieces embed error:', err);
            setError(err instanceof Error ? err.message : 'Failed to load workflow builder');
        } finally {
            setLoading(false);
        }
    }, [projectId, flowId, initialView]);

    useEffect(() => {
        initializeEmbed();

        // Cleanup on unmount
        return () => {
            if (connected && window.activepieces) {
                try {
                    window.activepieces.disconnect();
                } catch (e) {
                    // Ignore disconnect errors
                }
            }
        };
    }, [initializeEmbed]);

    const handleRetry = () => {
        setError(null);
        initializeEmbed();
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-12 h-full min-h-[500px] bg-gray-900/50 rounded-xl">
                <Loader2 className="animate-spin mb-4 text-indigo-500" size={40} />
                <p className="text-gray-400 text-lg">Initializing workflow builder...</p>
                <p className="text-gray-500 text-sm mt-2">Authenticating with Bronn Workflows</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8 border border-red-900/30 bg-red-900/10 rounded-xl flex flex-col items-center gap-4">
                <AlertCircle className="text-red-500" size={40} />
                <div className="text-center">
                    <h3 className="font-bold text-lg text-red-400 mb-2">Connection Error</h3>
                    <p className="text-red-300 mb-4">{error}</p>
                    <button
                        onClick={handleRetry}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                    >
                        <RefreshCw size={16} />
                        Retry Connection
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div
            ref={containerRef}
            className="w-full h-full rounded-xl overflow-hidden shadow-2xl border border-gray-700/50"
            style={{ minHeight: '700px' }}
        >
            {/* The SDK renders into this container */}
            <div
                id="activepieces-container"
                className="w-full h-full"
                style={{ minHeight: '700px' }}
            />
        </div>
    );
};

export default ActivepiecesEmbed;

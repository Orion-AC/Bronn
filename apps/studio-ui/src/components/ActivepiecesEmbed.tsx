import React, { useEffect, useState, useRef } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';

interface ActivepiecesEmbedProps {
    projectId?: string;
}

export const ActivepiecesEmbed: React.FC<ActivepiecesEmbedProps> = ({
    projectId = "default"
}) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [embedUrl, setEmbedUrl] = useState<string | null>(null);
    const iframeRef = useRef<HTMLIFrameElement>(null);

    useEffect(() => {
        const initializeEmbed = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error('User not authenticated');
                }

                // Fetch the embed token from our backend
                const response = await fetch(`/api/workflows/engine/token?project_id=${projectId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    const data = await response.json();
                    throw new Error(data.detail || 'Failed to fetch embed token');
                }

                const { token: embedToken, instanceUrl } = await response.json();

                // Construct the embedded URL
                // According to AP docs, we pass the token as a query param or handled via SDK
                // For a simple iframe approach, we can use the /embed path if supported
                // or the standard editor path with the token.

                // Note: The 'instanceUrl' returned by backend is internal,
                // but client needs to access it via public URL.
                // In this setup, port 8080 is mapped to localhost.
                const publicUrl = instanceUrl.includes('activepieces:80')
                    ? 'http://localhost:8080'
                    : instanceUrl;

                const url = `${publicUrl}/embed?jwtToken=${embedToken}`;
                setEmbedUrl(url);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load workflow editor');
            } finally {
                setLoading(false);
            }
        };

        initializeEmbed();
    }, [projectId]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-12 h-full">
                <Loader2 className="animate-spin mb-4" size={32} />
                <p className="text-gray-400">Initializing workflow builder...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8 border border-red-900/30 bg-red-900/10 rounded-lg flex items-center gap-4 text-red-500">
                <AlertCircle size={24} />
                <div>
                    <h3 className="font-bold">Error</h3>
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full h-full min-h-[600px] border border-gray-800 rounded-xl overflow-hidden shadow-2xl">
            {embedUrl && (
                <iframe
                    ref={iframeRef}
                    src={embedUrl}
                    className="w-full h-full border-none"
                    title="Activepieces Workflow Builder"
                    allow="clipboard-read; clipboard-write"
                />
            )}
        </div>
    );
};

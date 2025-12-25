import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import './Login.css';

export const ActivepiecesSSO: React.FC = () => {
    const [status, setStatus] = useState('Connecting to Bronn Workflows...');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const authenticateAndRedirect = async () => {
            try {
                const token = localStorage.getItem('token');

                if (!token) {
                    setError('Not logged in. Please login first.');
                    setTimeout(() => {
                        window.location.href = '/login';
                    }, 2000);
                    return;
                }

                setStatus('Authenticating with Activepieces...');

                // Get Activepieces token from our backend
                const response = await fetch('/api/auth/activepieces-token', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    const data = await response.json();
                    throw new Error(data.detail || 'Failed to authenticate');
                }

                const data = await response.json();

                if (data.token) {
                    setStatus('Opening Bronn Workflows...');

                    // Store the Activepieces token info for reference
                    localStorage.setItem('activepieces_token', data.token);

                    // Redirect to Activepieces
                    // The token is already set on the Activepieces side via our backend sync
                    const activepiecesUrl = import.meta.env.VITE_ACTIVEPIECES_URL || 'http://localhost:8080';
                    window.location.href = activepiecesUrl;
                } else {
                    throw new Error('Could not get authentication token');
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Authentication failed');
            }
        };

        authenticateAndRedirect();
    }, []);

    return (
        <div className="login-container">
            <div className="login-card" style={{ textAlign: 'center' }}>
                {error ? (
                    <>
                        <div className="login-error" style={{ marginBottom: '16px' }}>
                            {error}
                        </div>
                        <p>Redirecting to login...</p>
                    </>
                ) : (
                    <>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'center',
                            marginBottom: '24px'
                        }}>
                            <Loader2
                                size={48}
                                style={{
                                    animation: 'spin 1s linear infinite',
                                    color: 'var(--accent-primary)'
                                }}
                            />
                        </div>
                        <h2 style={{ marginBottom: '8px' }}>{status}</h2>
                        <p style={{ color: 'var(--text-secondary)' }}>
                            Please wait while we connect you to Bronn Workflows
                        </p>
                    </>
                )}
            </div>
            <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
        </div>
    );
};

export default ActivepiecesSSO;

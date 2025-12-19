import React from 'react';
import { PageLayout } from '../components/PageLayout';
import './TemplatesPage.css';

export const TemplatesPage: React.FC = () => {
    return (
        <PageLayout
            title="Templates"
            subtitle="Start building faster with pre-configured project templates"
        >
            <div className="templates-grid">

                {/* Minimal Template */}
                <div className="template-card">
                    <div className="template-preview">
                        <div className="preview-content" style={{ background: '#09090b', padding: 20 }}>
                            <div className="mock-ui">
                                <div className="mock-nav" style={{ borderBottom: '1px solid #27272a' }}></div>
                                <div className="mock-hero">
                                    <div style={{ width: '40%', height: 8, background: '#3f3f46', borderRadius: 4, marginBottom: 8 }}></div>
                                    <div style={{ width: '25%', height: 6, background: '#27272a', borderRadius: 4 }}></div>
                                </div>
                            </div>
                        </div>
                        <div className="overlay-hover">
                            <button className="use-btn">Use template</button>
                        </div>
                    </div>
                    <div className="template-info">
                        <span className="template-name">Minimal</span>
                        <span className="template-desc">Clean, simple foundation for any app</span>
                    </div>
                </div>

                {/* Modern SaaS */}
                <div className="template-card">
                    <div className="template-preview">
                        <div className="preview-content" style={{ background: '#0f172a', padding: 20 }}>
                            <div className="mock-ui">
                                <div className="mock-nav" style={{ display: 'flex', gap: 8 }}>
                                    <div style={{ width: 20, height: 20, borderRadius: 4, background: '#3b82f6' }}></div>
                                </div>
                                <div className="mock-hero" style={{ alignItems: 'flex-start', paddingTop: 20 }}>
                                    <div style={{ width: '70%', height: 12, background: 'linear-gradient(90deg, #60a5fa, #a855f7)', borderRadius: 4, marginBottom: 8 }}></div>
                                    <div style={{ width: '50%', height: 6, background: '#334155', borderRadius: 4 }}></div>
                                </div>
                            </div>
                        </div>
                        <div className="overlay-hover">
                            <button className="use-btn">Use template</button>
                        </div>
                    </div>
                    <div className="template-info">
                        <span className="template-name">Modern SaaS</span>
                        <span className="template-desc">Dashboard, Sidebar, and Auth ready</span>
                    </div>
                </div>

                {/* Documentation */}
                <div className="template-card">
                    <div className="template-preview">
                        <div className="preview-content" style={{ background: '#1c1917', display: 'flex' }}>
                            <div style={{ width: '25%', borderRight: '1px solid #44403c', height: '100%' }}></div>
                            <div style={{ flex: 1, padding: 20 }}>
                                <div style={{ width: '60%', height: 10, background: '#e7e5e4', borderRadius: 4, marginBottom: 12 }}></div>
                                <div style={{ width: '100%', height: 4, background: '#57534e', borderRadius: 2, marginBottom: 6 }}></div>
                                <div style={{ width: '90%', height: 4, background: '#57534e', borderRadius: 2, marginBottom: 6 }}></div>
                            </div>
                        </div>
                        <div className="overlay-hover">
                            <button className="use-btn">Use template</button>
                        </div>
                    </div>
                    <div className="template-info">
                        <span className="template-name">Documentation</span>
                        <span className="template-desc">Content-focused layout with MDX</span>
                    </div>
                </div>

                {/* Portfolio */}
                <div className="template-card">
                    <div className="template-preview">
                        <div className="preview-content" style={{ background: '#000000', padding: 20 }}>
                            <div className="mock-ui" style={{ border: '1px solid #333' }}>
                                <div style={{ width: '100%', height: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
                                    <div style={{ background: '#222' }}></div>
                                    <div style={{ background: '#222' }}></div>
                                    <div style={{ background: '#222' }}></div>
                                    <div style={{ background: '#222' }}></div>
                                </div>
                            </div>
                        </div>
                        <div className="overlay-hover">
                            <button className="use-btn">Use template</button>
                        </div>
                    </div>
                    <div className="template-info">
                        <span className="template-name">Portfolio Grid</span>
                        <span className="template-desc">Showcase your work in style</span>
                    </div>
                </div>

            </div>
        </PageLayout>
    );
};

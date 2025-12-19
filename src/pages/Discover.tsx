import React from 'react';
import { PageLayout } from '../components/PageLayout';
import './Discover.css';

export const Discover: React.FC = () => {
    return (
        <PageLayout
            title="Discover"
            subtitle="Explore apps built by talented creators with Orion Studio"
        >
            <div className="section-title">Featured apps</div>

            <div className="featured-grid">
                {/* Featured Card 1 */}
                <div className="featured-card">
                    <div className="featured-bg" style={{ background: 'linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)' }}>
                        <div style={{ fontSize: '2rem', fontWeight: 800, color: '#3730a3' }}>
                            Event marketing <br /> made <span style={{ color: '#6366f1' }}>simple</span>
                        </div>
                    </div>
                    <div className="featured-content">
                        <div className="app-info">
                            <div className="app-icon" style={{ color: '#4f46e5' }}>AF</div>
                            <div className="app-text">
                                <span className="app-name">Attendflow</span>
                                <span className="app-desc">Event marketing made simple</span>
                            </div>
                        </div>
                        <button className="visit-btn">Visit project</button>
                    </div>
                </div>

                {/* Featured Card 2 */}
                <div className="featured-card">
                    <div className="featured-bg" style={{ background: 'linear-gradient(135deg, #fed7aa 0%, #fdba74 100%)' }}>
                        <div style={{ width: '60%', textAlign: 'center', color: '#9a3412' }}>
                            <h2 style={{ fontSize: '1.5rem', marginBottom: 8 }}>Begin Your Transformation</h2>
                            <div style={{ height: 4, background: '#fff', width: 40, margin: '8px auto' }}></div>
                        </div>
                    </div>
                    <div className="featured-content">
                        <div className="app-info">
                            <div className="app-icon" style={{ background: '#c2410c', color: 'white' }}>P</div>
                            <div className="app-text">
                                <span className="app-name">Pilates Circle</span>
                                <span className="app-desc">Move, full circle.</span>
                            </div>
                        </div>
                        <button className="visit-btn">Visit project</button>
                    </div>
                </div>
            </div>

            <div className="section-title">Apps for builders</div>

            <div className="builders-grid">
                {/* Item 1 */}
                <div className="builder-card">
                    <div className="builder-preview" style={{ background: '#059669' }}>
                        <div style={{ position: 'absolute', bottom: 10, left: 10, color: 'white', fontWeight: 600 }}>
                            IconStack
                        </div>
                    </div>
                    <div className="builder-info">
                        <div className="app-name">Iconstack</div>
                        <div className="app-desc">50,000+ Icons</div>
                        <div className="builder-tags">
                            <span className="tag">Freebie</span>
                            <span className="tag">Design</span>
                        </div>
                    </div>
                </div>

                {/* Item 2 */}
                <div className="builder-card">
                    <div className="builder-preview" style={{ background: '#7c3aed' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'white', fontWeight: 800, fontSize: '1.5rem', opacity: 0.5 }}>
                            OPUX
                        </div>
                    </div>
                    <div className="builder-info">
                        <div className="app-name">Opux</div>
                        <div className="app-desc">Context before code</div>
                        <div className="builder-tags">
                            <span className="tag">DevTool</span>
                        </div>
                    </div>
                </div>

                {/* Item 3 */}
                <div className="builder-card">
                    <div className="builder-preview" style={{ background: '#2563eb' }}>
                        <div style={{ padding: 20, color: 'white' }}>
                            <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>Create Stunning Banners with AI</div>
                        </div>
                    </div>
                    <div className="builder-info">
                        <div className="app-name">Bannerman</div>
                        <div className="app-desc">Generate banner assets</div>
                        <div className="builder-tags">
                            <span className="tag">AI</span>
                            <span className="tag">Marketing</span>
                        </div>
                    </div>
                </div>
            </div>
        </PageLayout>
    );
};

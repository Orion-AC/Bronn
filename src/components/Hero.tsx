import React, { useState } from 'react';
import { Plus, ArrowRight } from 'lucide-react';
import Lightning from './Lightning';
import './Hero.css';

export const Hero: React.FC = () => {
    const [activeMode, setActiveMode] = useState('Build');

    return (
        <div className="hero-container">
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1, pointerEvents: 'none', opacity: 0.6 }}>
                <Lightning
                    hue={240}
                    xOffset={0}
                    speed={0.5}
                    intensity={0.8}
                    size={0.8}
                />
            </div>

            <div className="hero-content">
                <h1 className="hero-headline">Build. Reason. Ship.</h1>

                <div className="input-wrapper">
                    <div className="prompt-box">
                        <textarea
                            className="prompt-input"
                            placeholder="Describe the system you want to create..."
                        />

                        <div className="prompt-footer">
                            <div className="mode-selector">
                                {['Build', 'Analyze', 'Automate'].map((mode) => (
                                    <button
                                        key={mode}
                                        className={`mode-btn ${activeMode === mode ? 'active' : ''}`}
                                        onClick={() => setActiveMode(mode)}
                                    >
                                        {mode}
                                    </button>
                                ))}
                            </div>

                            <div className="primary-actions">
                                <button className="attach-btn" title="Add attachment">
                                    <Plus size={20} />
                                </button>
                                <button className="run-btn">
                                    <ArrowRight size={20} strokeWidth={2.5} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

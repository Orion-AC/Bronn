import React from 'react';
import './Templates.css';

const intents = [
    { title: "AI Agent Architecture", desc: "Multi-agent orchestration system" },
    { title: "DevOps Automation", desc: "CI/CD pipeline visualization" },
    { title: "SaaS Landing (Minimal)", desc: "High-conversion marketing site" },
    { title: "Internal Dashboard", desc: "Data visualization & admin" },
    { title: "Pitch → Product", desc: "Turn slide deck into prototype" },
];

export const Templates: React.FC = () => {
    return (
        <div className="templates-container">
            <div className="templates-label">Start with an intent</div>

            <div className="templates-grid">
                {intents.map((intent, idx) => (
                    <div className="intent-card" key={idx}>
                        <div className="intent-title">{intent.title}</div>
                        <div className="intent-desc">{intent.desc}</div>
                        <div className="intent-arrow">Use Template →</div>
                    </div>
                ))}
            </div>
        </div>
    );
};

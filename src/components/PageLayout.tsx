import React from 'react';
import type { ReactNode } from 'react';
import './PageLayout.css';

interface PageLayoutProps {
    title: string;
    subtitle?: string;
    children: ReactNode;
    actions?: ReactNode; // Optional header actions slot
}

export const PageLayout: React.FC<PageLayoutProps> = ({
    title,
    subtitle,
    children,
    actions
}) => {
    return (
        <div className="page-layout">
            <div className="page-header">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <h1 className="page-title">{title}</h1>
                    {actions && <div className="header-actions">{actions}</div>}
                </div>
                {subtitle && <div className="page-subtitle">{subtitle}</div>}
            </div>
            <div className="page-content">
                {children}
            </div>
        </div>
    );
};

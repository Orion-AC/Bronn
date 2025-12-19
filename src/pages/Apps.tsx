import React from 'react';
import {
    Search,
    ChevronDown,
    LayoutGrid,
    List,
    Plus,
    MoreHorizontal
} from 'lucide-react';
import { PageLayout } from '../components/PageLayout';
import './Apps.css';

export const Apps: React.FC = () => {
    return (
        <PageLayout
            title="Apps"
            actions={
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <div className="title-dots">
                        <MoreHorizontal size={16} />
                    </div>
                </div>
            }
        >
            <div className="controls-row">
                <div className="search-wrapper">
                    <Search className="search-icon" size={16} />
                    <input
                        type="text"
                        className="apps-search"
                        placeholder="Search apps..."
                    />
                </div>

                <div className="filters-group">
                    <button className="filter-pill">
                        Last edited <ChevronDown size={14} />
                    </button>
                    <button className="filter-pill">
                        Any visibility <ChevronDown size={14} />
                    </button>
                    <button className="filter-pill">
                        Any status <ChevronDown size={14} />
                    </button>
                    <button className="filter-pill">
                        All creators <ChevronDown size={14} />
                    </button>

                    <div className="view-toggle">
                        <button className="toggle-btn active">
                            <LayoutGrid size={16} />
                        </button>
                        <button className="toggle-btn">
                            <List size={16} />
                        </button>
                    </div>
                </div>
            </div>

            <div className="apps-grid">
                {/* Create New Card */}
                <div className="app-card create-card">
                    <div className="card-thumbnail">
                        <Plus size={32} color="var(--text-tertiary)" />
                    </div>
                    <div className="card-info">
                        <div className="app-details">
                            <span className="app-name">Create new app</span>
                        </div>
                    </div>
                </div>

                {/* Existing Project Card */}
                <div className="app-card">
                    <div className="card-thumbnail">
                        {/* Folder/Heart icon placeholder */}
                        <div style={{ opacity: 0.2 }}>
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                            </svg>
                        </div>
                    </div>
                    <div className="card-info">
                        <div className="app-avatar" style={{ background: '#db2777' }}>R</div>
                        <div className="app-details">
                            <span className="app-name">Joyful Journey Planner</span>
                            <span className="app-meta">Edited 19 minutes ago</span>
                        </div>
                    </div>
                </div>

                {/* Another Project Card */}
                <div className="app-card">
                    <div className="card-thumbnail">
                        {/* Placeholder */}
                    </div>
                    <div className="card-info">
                        <div className="app-avatar" style={{ background: '#8b5cf6' }}>R</div>
                        <div className="app-details">
                            <span className="app-name">Orion Dashboard v2</span>
                            <span className="app-meta">Edited 2 hours ago</span>
                        </div>
                    </div>
                </div>

            </div>
        </PageLayout>
    );
};

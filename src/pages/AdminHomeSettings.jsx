import React, { useState, useEffect } from 'react';
import { getHomeConfig, saveHomeConfig } from '../services/homeService';
import { Plus, Trash2, Eye, EyeOff, Save } from 'lucide-react';

const AdminHomeSettings = () => {
    const [config, setConfig] = useState(getHomeConfig());
    const [editingEvent, setEditingEvent] = useState(null);

    useEffect(() => {
        setConfig(getHomeConfig());
    }, []);

    const handleToggleEvent = (eventId) => {
        const updatedEvents = config.featuredEventPages.map(event =>
            event.id === eventId ? { ...event, enabled: !event.enabled } : event
        );
        const newConfig = { ...config, featuredEventPages: updatedEvents };
        setConfig(newConfig);
        saveHomeConfig(newConfig);
    };

    const handleDeleteEvent = (eventId) => {
        if (!confirm('Are you sure you want to delete this event?')) return;
        const updatedEvents = config.featuredEventPages.filter(event => event.id !== eventId);
        const newConfig = { ...config, featuredEventPages: updatedEvents };
        setConfig(newConfig);
        saveHomeConfig(newConfig);
    };

    const handleAddEvent = () => {
        const newEvent = {
            id: `event-${Date.now()}`,
            title: 'New Event',
            icon: '🎉',
            path: '/events/new-event',
            description: 'Event description...',
            enabled: true
        };
        const updatedEvents = [...config.featuredEventPages, newEvent];
        const newConfig = { ...config, featuredEventPages: updatedEvents };
        setConfig(newConfig);
        saveHomeConfig(newConfig);
        setEditingEvent(newEvent.id);
    };

    const handleSaveEvent = (eventId, updates) => {
        const updatedEvents = config.featuredEventPages.map(event =>
            event.id === eventId ? { ...event, ...updates } : event
        );
        const newConfig = { ...config, featuredEventPages: updatedEvents };
        setConfig(newConfig);
        saveHomeConfig(newConfig);
        setEditingEvent(null);
    };

    return (
        <div className="admin-wrapper">
            <header className="admin-page-header" style={{
                background: 'rgba(255, 255, 255, 0.4)', // Matching the grey-ish glass look
                backdropFilter: 'blur(12px)',
                padding: '1.5rem',
                borderRadius: '16px',
                border: '1px solid rgba(255, 255, 255, 0.5)',
                marginBottom: '2rem'
            }}>
                <div>
                    <h1 className="admin-page-title" style={{
                        background: 'linear-gradient(to right, #a855f7, #ec4899)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        fontSize: '2rem'
                    }}>Homepage Settings</h1>
                    <p className="admin-page-subtitle" style={{ color: '#94a3b8' }}>Manage which events appear on the homepage</p>
                </div>
                <div className="admin-header-actions">
                    <button onClick={handleAddEvent} className="btn-primary">
                        <Plus size={18} /> Add Event
                    </button>
                </div>
            </header>

            <div className="admin-card">
                <div className="admin-card-header" style={{
                    background: 'rgba(255, 255, 255, 0.2)', // Top Header exact match
                    backdropFilter: 'blur(20px) saturate(180%)',
                    WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.3)',
                    boxShadow: 'inset 0 -1px 0 0 rgba(255, 255, 255, 0.2), 0 4px 20px rgba(0, 0, 0, 0.02)',
                    padding: '1.5rem',
                    borderTopLeftRadius: '16px',
                    borderTopRightRadius: '16px'
                }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>Featured Event Pages</h3>
                    <p style={{ fontSize: '0.9rem', color: '#334155' }}>
                        Toggle events on/off to control which event pages appear on the homepage
                    </p>
                </div>
                <div className="admin-card-content">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {config.featuredEventPages?.map((event) => (
                            <div
                                key={event.id}
                                style={{
                                    padding: '20px',
                                    background: 'white',
                                    borderRadius: '16px',
                                    border: event.enabled ? '2px solid #3b82f6' : '1px solid #e2e8f0',
                                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                    opacity: event.enabled ? 1 : 0.7,
                                    transition: 'all 0.2s'
                                }}
                            >
                                {editingEvent === event.id ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                        <input
                                            type="text"
                                            className="admin-input"
                                            defaultValue={event.title}
                                            placeholder="Event Title"
                                            id={`title-${event.id}`}
                                        />
                                        <input
                                            type="text"
                                            className="admin-input"
                                            defaultValue={event.icon}
                                            placeholder="Icon (emoji)"
                                            id={`icon-${event.id}`}
                                        />
                                        <input
                                            type="text"
                                            className="admin-input"
                                            defaultValue={event.path}
                                            placeholder="Path (e.g., /events/my-event)"
                                            id={`path-${event.id}`}
                                        />
                                        <textarea
                                            className="admin-input"
                                            defaultValue={event.description}
                                            placeholder="Event Description"
                                            rows={3}
                                            id={`description-${event.id}`}
                                        />
                                        <div style={{ display: 'flex', gap: '10px' }}>
                                            <button
                                                onClick={() => {
                                                    const updates = {
                                                        title: document.getElementById(`title-${event.id}`).value,
                                                        icon: document.getElementById(`icon-${event.id}`).value,
                                                        path: document.getElementById(`path-${event.id}`).value,
                                                        description: document.getElementById(`description-${event.id}`).value
                                                    };
                                                    handleSaveEvent(event.id, updates);
                                                }}
                                                className="btn-primary"
                                            >
                                                <Save size={16} /> Save
                                            </button>
                                            <button
                                                onClick={() => setEditingEvent(null)}
                                                className="btn-secondary"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                        <div style={{ flex: 1, display: 'flex', alignItems: 'start', gap: '20px' }}>
                                            <div style={{ fontSize: '3rem', flexShrink: 0 }}>
                                                {event.icon}
                                            </div>
                                            <div>
                                                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '5px', color: '#10b981' }}>
                                                    {event.title}
                                                </h3>
                                                <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '10px' }}>
                                                    {event.path}
                                                </p>
                                                <p style={{ color: '#475569', lineHeight: 1.6 }}>
                                                    {event.description}
                                                </p>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', gap: '10px', marginLeft: '20px' }}>
                                            <button
                                                onClick={() => handleToggleEvent(event.id)}
                                                className="btn-icon"
                                                title={event.enabled ? 'Hide from homepage' : 'Show on homepage'}
                                                style={{ color: event.enabled ? 'var(--accent-success)' : 'var(--text-muted)' }}
                                            >
                                                {event.enabled ? <Eye size={20} /> : <EyeOff size={20} />}
                                            </button>
                                            <button
                                                onClick={() => setEditingEvent(event.id)}
                                                className="btn-icon"
                                                title="Edit event"
                                            >
                                                <span className="material-symbols-outlined">edit</span>
                                            </button>
                                            <button
                                                onClick={() => handleDeleteEvent(event.id)}
                                                className="btn-icon delete"
                                                title="Delete event"
                                            >
                                                <Trash2 size={20} />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminHomeSettings;

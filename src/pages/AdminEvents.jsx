

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getEvents, saveEvent, deleteEvent } from '../services/eventService';
import { FaPlus, FaEdit, FaTrash, FaImage, FaCalendarDay, FaCheckCircle, FaClock, FaTimesCircle } from 'react-icons/fa';
import { useUI } from '../context/UIContext';
import { useAuth } from '../context/AuthContext';

const inputStyle = {
    width: '100%',
    padding: '12px',
    borderRadius: '10px',
    border: '1px solid #e5e7eb',
    fontSize: '1rem',
    fontFamily: 'inherit',
    outline: 'none'
};

const AdminEvents = () => {
    const { showToast, confirmAction } = useUI();
    const { user } = useAuth();
    const [events, setEvents] = useState([]);
    const [activeTab, setActiveTab] = useState('published'); // 'published', 'pending'
    const [isEditing, setIsEditing] = useState(false);
    const [currentEvent, setCurrentEvent] = useState({
        title: '', date: '', time: '', location: '', description: '', category: 'Meeting', image: '', status: 'pending'
    });
    const [lists, setLists] = useState({ event_category: [], event_location: [] });

    const isAdmin = user?.role === 'admin';

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        // Fetch all events
        const data = await getEvents();
        setEvents(data || []);

        // Fetch Lists
        try {
            const res = await fetch('/api/lists');
            const listData = await res.json();
            if (listData.message === 'success') {
                const grouped = listData.data.reduce((acc, item) => {
                    if (!acc[item.type]) acc[item.type] = [];
                    acc[item.type].push(item);
                    return acc;
                }, { event_category: [], event_location: [] });
                setLists(grouped);
            }
        } catch (error) {
            console.error("Failed to fetch lists", error);
        }
    };

    const handleSave = async (statusOverride) => {
        if (!currentEvent.title || !currentEvent.date) return;

        const eventToSave = {
            ...currentEvent,
            status: statusOverride || currentEvent.status
        };

        // If member is creating, force status to pending unless they are just editing a draft?
        // Actually, members can only "Submit".
        if (!isAdmin) {
            eventToSave.status = 'pending';
        }

        await saveEvent(eventToSave);
        setIsEditing(false);
        fetchEvents();
        showToast(statusOverride === 'published' ? 'Event Published!' : 'Event submitted for review', 'success');
    };

    const handleApprove = async (event) => {
        confirmAction(
            'Approve this event for publication?',
            async () => {
                const updated = { ...event, status: 'published' };
                await saveEvent(updated);
                fetchEvents();
                showToast('Event approved and published.', 'success');
            },
            'Approve Event',
            false // not dangerous
        );
    };

    const handleDelete = async (id) => {
        confirmAction(
            'Are you sure you want to delete this event?',
            async () => {
                await deleteEvent(id);
                fetchEvents();
                showToast('Event deleted successfully', 'success');
            },
            'Delete Event',
            true
        );
    };

    const handleEdit = (ev) => {
        setCurrentEvent(ev);
        setIsEditing(true);
    };

    const handleCreate = () => {
        setCurrentEvent({
            title: '', date: '', time: '', location: '', description: '', category: 'Meeting', image: '', status: 'pending'
        });
        setIsEditing(true);
    };

    const fileInputRef = useRef(null);

    const uploadFile = async (file) => {
        if (!file) return;
        const formData = new FormData();
        formData.append('image', file);

        try {
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });
            const data = await response.json();
            if (data.url) {
                setCurrentEvent(prev => ({ ...prev, image: data.url }));
            }
        } catch (error) {
            console.error('Upload failed', error);
            showToast('Upload failed', 'error');
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            uploadFile(file);
        }
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            uploadFile(file);
        }
    };



    // Filter events by tab
    const filteredEvents = events.filter(e => {
        if (activeTab === 'published') return e.status === 'published' || !e.status; // Default backward comp
        if (activeTab === 'pending') return e.status === 'pending';
        return true;
    });

    const pendingCount = events.filter(e => e.status === 'pending').length;

    return (
        <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto', color: '#111827' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 800, background: 'linear-gradient(135deg, #005baa 0%, #00a4d6 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0, lineHeight: 1.2 }}>
                    Manage Events
                </h1>
                <motion.button
                    className="desktop-only-btn"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleCreate}
                    style={{
                        background: 'linear-gradient(135deg, #005baa 0%, #00a4d6 100%)',
                        color: 'white', border: 'none', padding: '12px 24px', borderRadius: '12px',
                        fontSize: '1rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
                        boxShadow: '0 4px 12px rgba(0, 91, 170, 0.3)'
                    }}
                >
                    <FaPlus /> New Event
                </motion.button>
            </div>

            {/* Mobile Floating Action Button (FAB) */}
            <motion.button
                className="mobile-fab"
                whileTap={{ scale: 0.9 }}
                onClick={handleCreate}
                style={{
                    position: 'fixed', bottom: '100px', right: '30px', width: '64px', height: '64px', borderRadius: '50%',
                    background: 'var(--accent-primary)', color: 'white', border: 'none',
                    boxShadow: '0 10px 25px -5px rgba(0, 91, 170, 0.5)', zIndex: 90,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
                }}
            >
                <FaPlus size={24} />
            </motion.button>

            <style>{`
                @media (max-width: 768px) {
                    .desktop-only-btn { display: none !important; }
                }
                @media (min-width: 769px) {
                    .mobile-fab { display: none !important; }
                }
            `}</style>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '20px', marginBottom: '30px', borderBottom: '1px solid #e5e7eb', paddingBottom: '10px' }}>
                <button
                    onClick={() => setActiveTab('published')}
                    style={{
                        background: 'none', border: 'none', padding: '10px', fontSize: '1.1rem', fontWeight: 600,
                        color: activeTab === 'published' ? 'var(--accent-primary)' : '#9ca3af',
                        borderBottom: activeTab === 'published' ? '3px solid var(--accent-primary)' : '3px solid transparent',
                        cursor: 'pointer'
                    }}
                >
                    Published
                </button>
                <button
                    onClick={() => setActiveTab('pending')}
                    style={{
                        background: 'none', border: 'none', padding: '10px', fontSize: '1.1rem', fontWeight: 600,
                        color: activeTab === 'pending' ? 'var(--accent-secondary)' : '#9ca3af',
                        borderBottom: activeTab === 'pending' ? '3px solid var(--accent-secondary)' : '3px solid transparent',
                        cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: '8px'
                    }}
                >
                    Pending Approval
                    {pendingCount > 0 && <span style={{ background: 'var(--accent-secondary)', color: 'white', padding: '2px 8px', borderRadius: '10px', fontSize: '0.8rem' }}>{pendingCount}</span>}
                </button>
            </div>

            {/* Event List */}
            <div style={{ display: 'grid', gap: '20px' }}>
                {filteredEvents.length === 0 && (
                    <p style={{ color: '#9ca3af', fontStyle: 'italic', padding: '20px' }}>No events in this category.</p>
                )}

                {filteredEvents.map((ev) => (
                    <motion.div
                        key={ev.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{
                            background: 'white', padding: '20px', borderRadius: '16px',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                            display: 'grid', gridTemplateColumns: 'min-content 1fr auto', gap: '20px', alignItems: 'center',
                            borderLeft: ev.status === 'pending' ? '4px solid var(--accent-secondary)' : '4px solid var(--accent-primary)'
                        }}
                    >
                        <div style={{
                            width: '80px', height: '80px', borderRadius: '12px', overflow: 'hidden',
                            background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                            {ev.image ? (
                                <img src={ev.image} alt={ev.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                <FaCalendarDay size={24} color="#9ca3af" />
                            )}
                        </div>
                        <div>
                            <h3 style={{ margin: '0 0 5px 0', fontSize: '1.2rem', color: '#1f2937' }}>
                                {ev.title}
                                {ev.status === 'pending' && <span style={{ fontSize: '0.8rem', background: '#fffbeb', color: '#d97706', padding: '4px 8px', borderRadius: '6px', marginLeft: '10px', border: '1px solid #fcd34d' }}>Review Needed</span>}
                            </h3>
                            <div style={{ display: 'flex', gap: '15px', color: '#6b7280', fontSize: '0.9rem' }}>
                                <span>{ev.date} at {ev.time}</span>
                                <span>•</span>
                                <span>{ev.location}</span>
                                <span>•</span>
                                <span style={{ color: '#005baa', fontWeight: 600 }}>{ev.category}</span>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            {/* Admin Approve Button */}
                            {isAdmin && ev.status === 'pending' && (
                                <button
                                    onClick={() => handleApprove(ev)}
                                    title="Approve & Publish"
                                    style={{ padding: '8px', borderRadius: '8px', border: 'none', background: '#ecfccb', color: '#65a30d', cursor: 'pointer' }}
                                >
                                    <FaCheckCircle size={16} />
                                </button>
                            )}

                            <button onClick={() => handleEdit(ev)} style={{ padding: '8px', borderRadius: '8px', border: 'none', background: '#eff6ff', color: '#005baa', cursor: 'pointer' }}>
                                <FaEdit size={16} />
                            </button>

                            {/* Admins can delete anything, Members only if draft? Wait members can't see draft yet. For now allow delete if authorized logically but let's restict delete for members generally in layout? */}
                            {isAdmin && (
                                <button onClick={() => handleDelete(ev.id)} style={{ padding: '8px', borderRadius: '8px', border: 'none', background: '#fef2f2', color: '#ef4444', cursor: 'pointer' }}>
                                    <FaTrash size={16} />
                                </button>
                            )}
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Edit Modal (Simple overlay for now) */}
            <AnimatePresence>
                {isEditing && (
                    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            style={{ background: 'white', width: '100%', maxWidth: '600px', borderRadius: '24px', padding: '30px', maxHeight: '90vh', overflowY: 'auto' }}
                        >
                            <h2 style={{ marginBottom: '20px' }}>{currentEvent.id ? 'Edit Event' : 'New Event'}</h2>

                            <div style={{ display: 'grid', gap: '20px' }}>
                                <input
                                    placeholder="Event Title"
                                    value={currentEvent.title}
                                    onChange={e => setCurrentEvent({ ...currentEvent, title: e.target.value })}
                                    style={inputStyle}
                                />
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                    <input
                                        type="date"
                                        value={currentEvent.date}
                                        onChange={e => setCurrentEvent({ ...currentEvent, date: e.target.value })}
                                        style={inputStyle}
                                    />
                                    <input
                                        type="time"
                                        value={currentEvent.time}
                                        onChange={e => setCurrentEvent({ ...currentEvent, time: e.target.value })}
                                        style={inputStyle}
                                    />
                                </div>
                                {/* Location Dropdown */}
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <select
                                        value={currentEvent.location}
                                        onChange={e => setCurrentEvent({ ...currentEvent, location: e.target.value })}
                                        style={inputStyle}
                                    >
                                        <option value="" disabled>Select Location</option>
                                        {lists.event_location && lists.event_location.map(l => (
                                            <option key={l.id} value={l.value}>{l.value}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Category Dropdown */}
                                <select
                                    value={currentEvent.category}
                                    onChange={e => setCurrentEvent({ ...currentEvent, category: e.target.value })}
                                    style={inputStyle}
                                >
                                    <option value="" disabled>Select Category</option>
                                    {lists.event_category && lists.event_category.map(c => (
                                        <option key={c.id} value={c.value}>{c.value}</option>
                                    ))}
                                    {/* Fallback if list empty */}
                                    {(!lists.event_category || lists.event_category.length === 0) && (
                                        <>
                                            <option value="Meeting">Meeting</option>
                                            <option value="Social">Social</option>
                                        </>
                                    )}
                                </select>
                                <div style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '-15px', marginBottom: '10px' }}>
                                    Need more options? Go to Site Settings {'>'} Lists Config.
                                </div>
                                {/* Drag & Drop Image Zone */}
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    style={{ display: 'none' }}
                                    onChange={handleFileSelect}
                                    accept="image/*"
                                />
                                <div
                                    onDragOver={(e) => e.preventDefault()}
                                    onDrop={handleDrop}
                                    style={{
                                        height: '150px',
                                        background: '#f9fafb',
                                        borderRadius: '10px',
                                        border: '2px dashed #d1d5db',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'pointer',
                                        position: 'relative',
                                        overflow: 'hidden',
                                        backgroundImage: currentEvent.image ? `url(${currentEvent.image})` : 'none',
                                        backgroundSize: 'cover',
                                        backgroundPosition: 'center'
                                    }}
                                    onClick={() => fileInputRef.current.click()}
                                >
                                    {!currentEvent.image && (
                                        <div style={{ textAlign: 'center', color: '#9ca3af' }}>
                                            <FaImage size={24} style={{ marginBottom: '5px' }} />
                                            <p style={{ fontSize: '0.9rem', margin: 0 }}>Drag & Drop Image</p>
                                            <p style={{ fontSize: '0.75rem', margin: 0 }}>or click to add URL</p>
                                        </div>
                                    )}
                                    {currentEvent.image && (
                                        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.2s' }} className="hover-overlay">
                                            <span style={{ color: 'white', fontWeight: 'bold' }}>Change Image</span>
                                        </div>
                                    )}
                                </div>
                                <textarea
                                    placeholder="Event Description..."
                                    value={currentEvent.description}
                                    onChange={e => setCurrentEvent({ ...currentEvent, description: e.target.value })}
                                    style={{ ...inputStyle, minHeight: '120px', resize: 'vertical' }}
                                />

                                <div style={{ display: 'flex', gap: '15px', marginTop: '10px' }}>
                                    {isAdmin ? (
                                        <>
                                            <button onClick={() => handleSave('pending')} style={{ flex: 1, padding: '12px', background: '#fbbf24', color: '#78350f', border: 'none', borderRadius: '10px', fontSize: '1rem', fontWeight: 600, cursor: 'pointer' }}>Save as Pending</button>
                                            <button onClick={() => handleSave('published')} style={{ flex: 1, padding: '12px', background: '#005baa', color: 'white', border: 'none', borderRadius: '10px', fontSize: '1rem', fontWeight: 600, cursor: 'pointer' }}>Publish Now</button>
                                        </>
                                    ) : (
                                        <button onClick={() => handleSave('pending')} style={{ flex: 1, padding: '12px', background: '#005baa', color: 'white', border: 'none', borderRadius: '10px', fontSize: '1rem', fontWeight: 600, cursor: 'pointer' }}>Submit for Review</button>
                                    )}
                                    <button onClick={() => setIsEditing(false)} style={{ width: '80px', padding: '12px', background: '#e5e7eb', color: '#374151', border: 'none', borderRadius: '10px', fontSize: '1rem', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminEvents;

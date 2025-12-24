import React, { useState, useEffect } from 'react';
import { Trash2, Edit2, Plus, Printer, X, User, Calendar, MapPin } from 'lucide-react';

const AdminEventsBreakfast = () => {
    // --- State ---
    const [rosters, setRosters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [members, setMembers] = useState([]);

    const [editingSlot, setEditingSlot] = useState(null); // { rosterId, itemIndex, field: 'who'|'extra' }
    const [showModal, setShowModal] = useState(false);
    const [newMemberName, setNewMemberName] = useState('');
    const [selectedMember, setSelectedMember] = useState('');

    // --- Load Data ---
    useEffect(() => {
        fetchRosters();
        fetchMembers();
    }, []);

    const fetchRosters = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/event-rosters?event_key=breakfast');
            const data = await response.json();

            if (data.length === 0) {
                // Initialize with default if empty
                const defaultRoster = {
                    event_key: 'breakfast',
                    title: 'Breakfast with Father Christmas',
                    location: 'Woldingham Garden Centre (10:00 - 10:30 AM)',
                    slots: JSON.stringify([
                        { date: 'Sunday 23rd Nov', role: 'Carriage (10:30)', who: 'Tony Hamilton', extra: 'Derek Grant' },
                        { date: 'Sunday 30th Nov', role: 'Reindeer (12:30)', who: 'Tony Hamilton', extra: 'Tony Hamilton' },
                        { date: 'Saturday 06/12', role: 'TBA (9:30)', who: 'Annette Hughes' },
                        { date: 'Sunday 07/12', role: 'TBA (10:00)', who: 'Steve Jacques' },
                        { date: 'Saturday 13/12', role: 'Tony Hamilton (9:30)', who: 'Geraint Jenkins' },
                        { date: 'Sunday 14/12', role: 'Tony Hamilton (10:00)', who: 'Geoff Loveday' },
                        { date: 'Saturday 20/12', role: 'Claude Bertin (9:30)', who: 'Peter Lyons' },
                        { date: 'Sunday 21/12', role: 'Tony Hamilton (10:00)', who: 'Andy Maclennan', extra: 'Mary Marsden' },
                    ]),
                    notes: 'Breakfast Roster'
                };
                const res = await fetch('/api/event-rosters', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(defaultRoster)
                });
                const result = await res.json();
                fetchRosters(); // Refresh
            } else {
                setRosters(data.map(r => ({
                    ...r,
                    slots: JSON.parse(r.slots || '[]')
                })));
            }
        } catch (error) {
            console.error('Error fetching rosters:', error);
        }
        setLoading(false);
    };

    const fetchMembers = async () => {
        try {
            const res = await fetch('/api/members');
            if (res.ok) {
                const data = await res.json();
                setMembers(data.data || []);
            }
        } catch (err) {
            console.error(err);
        }
    };

    // --- Handlers ---
    const openEdit = (rosterId, itemIndex, field, currentVal) => {
        setEditingSlot({ rosterId, itemIndex, field });
        setSelectedMember(currentVal || '');
        setShowModal(true);
    };

    const handleSaveAssignment = async () => {
        if (!editingSlot) return;
        const { rosterId, itemIndex, field } = editingSlot;

        const roster = rosters.find(r => r.id === rosterId);
        if (roster) {
            const newSlots = [...roster.slots];
            newSlots[itemIndex][field] = selectedMember;

            await updateRoster(rosterId, { slots: JSON.stringify(newSlots) });
        }
        setShowModal(false);
        setEditingSlot(null);
    };

    const handleClearAssignment = async () => {
        if (!editingSlot) return;
        const { rosterId, itemIndex, field } = editingSlot;

        const roster = rosters.find(r => r.id === rosterId);
        if (roster) {
            const newSlots = [...roster.slots];
            newSlots[itemIndex][field] = '';

            await updateRoster(rosterId, { slots: JSON.stringify(newSlots) });
        }
        setShowModal(false);
        setEditingSlot(null);
    };

    const updateRoster = async (id, updates) => {
        try {
            const roster = rosters.find(r => r.id === id);
            const body = {
                title: updates.title || roster.title,
                location: updates.location || roster.location,
                date: updates.date || roster.date,
                slots: updates.slots || JSON.stringify(roster.slots),
                notes: updates.notes || roster.notes
            };

            await fetch(`/api/event-rosters/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            fetchRosters(); // Refresh
        } catch (err) {
            console.error('Error updating roster:', err);
        }
    };

    const handleAddNewMember = () => {
        if (newMemberName && !members.find(m => (m.name || `${m.firstName} ${m.lastName}`) === newMemberName)) {
            const newMember = { name: newMemberName };
            setMembers(prev => [...prev, newMember].sort((a, b) => (a.name || '').localeCompare(b.name || '')));
            setSelectedMember(newMemberName);
            setNewMemberName('');
            // Optional: Save to backend if there's a member add API
        }
    };

    const handleEditField = (rosterId, field, currentVal) => {
        const val = prompt(`Edit ${field}`, currentVal);
        if (val !== null) {
            updateRoster(rosterId, { [field]: val });
        }
    };

    const handleEditSlotMeta = (rosterId, slotIndex, field, currentVal) => {
        const val = prompt(`Edit ${field}`, currentVal);
        if (val !== null) {
            const roster = rosters.find(r => r.id === rosterId);
            const newSlots = [...roster.slots];
            newSlots[slotIndex][field] = val;
            updateRoster(rosterId, { slots: JSON.stringify(newSlots) });
        }
    };

    if (loading) return <div className="admin-wrapper">Loading...</div>;

    return (
        <div className="admin-wrapper">
            {/* 1. Header */}
            <header className="admin-page-header">
                <div>
                    <h1 className="admin-page-title">Breakfast Events</h1>
                    <p className="admin-page-subtitle">
                        Volunteer roster for Breakfast with Father Christmas.
                    </p>
                </div>
                <div className="admin-header-actions">
                    <button onClick={() => window.print()} className="btn-secondary">
                        <Printer size={18} /> Print Roster
                    </button>
                </div>
            </header>

            {/* 2. Roster Cards */}
            {rosters.map(roster => (
                <div key={roster.id}>
                    <div className="admin-card">
                        <div className="admin-card-content" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h2
                                    className="text-lg font-bold text-gray-800 cursor-pointer hover:text-blue-600 transition-colors"
                                    onClick={() => handleEditField(roster.id, 'title', roster.title)}
                                >
                                    {roster.title} <Edit2 size={14} style={{ display: 'inline', opacity: 0.5 }} />
                                </h2>
                                <div
                                    className="text-sm text-gray-500 mt-1 cursor-pointer hover:text-blue-600 transition-colors flex items-center gap-2"
                                    onClick={() => handleEditField(roster.id, 'location', roster.location)}
                                >
                                    <MapPin size={14} /> {roster.location} <Edit2 size={12} style={{ opacity: 0.5 }} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="admin-card">
                        <div className="admin-card-header">
                            <div className="admin-card-title">Shifts</div>
                            <div className="text-sm text-gray-500 font-medium">{roster.slots.length} Slots</div>
                        </div>

                        <div className="admin-card-content">
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                                gap: '1.5rem'
                            }}>
                                {roster.slots.map((item, idx) => (
                                    <div key={idx} style={{
                                        background: 'white',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '0.75rem',
                                        overflow: 'hidden',
                                        transition: 'transform 0.2s, box-shadow 0.2s',
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                                    }} className="hover:shadow-md hover:-translate-y-1">
                                        {/* Card Header */}
                                        <div style={{
                                            background: 'var(--bg-tertiary)',
                                            padding: '0.75rem 1rem',
                                            borderBottom: '1px solid #e2e8f0',
                                            display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                                        }}>
                                            <div
                                                style={{ fontWeight: '600', fontSize: '0.9rem', color: 'var(--text-primary)', cursor: 'pointer' }}
                                                onClick={() => handleEditSlotMeta(roster.id, idx, 'date', item.date)}
                                            >
                                                {item.date}
                                            </div>
                                            <div
                                                style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', background: 'white', padding: '2px 8px', borderRadius: '12px', cursor: 'pointer' }}
                                                onClick={() => handleEditSlotMeta(roster.id, idx, 'role', item.role)}
                                            >
                                                {item.role}
                                            </div>
                                        </div>

                                        {/* Card Body (Slots) */}
                                        <div style={{ padding: '1rem' }}>
                                            {/* Main Person */}
                                            <div
                                                onClick={() => openEdit(roster.id, idx, 'who', item.who)}
                                                style={{
                                                    marginBottom: '0.75rem', padding: '0.5rem', borderRadius: '0.5rem',
                                                    border: item.who ? '1px solid #e2e8f0' : '1px dashed #cbd5e1',
                                                    background: item.who ? 'white' : '#f8fafc',
                                                    cursor: 'pointer',
                                                    display: 'flex', alignItems: 'center', gap: '0.75rem'
                                                }}
                                                className="hover:border-blue-300 transition-colors"
                                            >
                                                <div style={{
                                                    width: '24px', height: '24px', borderRadius: '50%', background: item.who ? '#dbeafe' : '#e2e8f0',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 'bold', color: item.who ? '#1e40af' : '#94a3b8'
                                                }}>1</div>
                                                <div style={{ flex: 1, fontSize: '0.9rem', color: item.who ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                                                    {item.who || 'Assign Main...'}
                                                </div>
                                            </div>

                                            {/* Extra Person */}
                                            <div
                                                onClick={() => openEdit(roster.id, idx, 'extra', item.extra)}
                                                style={{
                                                    padding: '0.5rem', borderRadius: '0.5rem',
                                                    border: item.extra ? '1px solid #e2e8f0' : '1px dashed #cbd5e1',
                                                    background: item.extra ? 'white' : '#f8fafc',
                                                    cursor: 'pointer',
                                                    display: 'flex', alignItems: 'center', gap: '0.75rem'
                                                }}
                                                className="hover:border-blue-300 transition-colors"
                                            >
                                                <div style={{
                                                    width: '24px', height: '24px', borderRadius: '50%', background: item.extra ? '#dbeafe' : '#e2e8f0',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 'bold', color: item.extra ? '#1e40af' : '#94a3b8'
                                                }}>2</div>
                                                <div style={{ flex: 1, fontSize: '0.9rem', color: item.extra ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                                                    {item.extra || 'Assign 2nd...'}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            ))}

            {/* Modal (Reused Unified Style) */}
            {showModal && (
                <div className="admin-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false) }}>
                    <div className="admin-modal">
                        <div className="admin-card-header">
                            <h3 className="admin-card-title">Assign Volunteer</h3>
                            <button onClick={() => setShowModal(false)} className="btn-icon"><X size={20} /></button>
                        </div>
                        <div className="admin-card-content">
                            <label className="text-sm font-bold text-gray-600 mb-2 block">Select Member</label>
                            <select
                                value={selectedMember}
                                onChange={(e) => setSelectedMember(e.target.value)}
                                className="admin-input mb-4"
                            >
                                <option value="">Select...</option>
                                {members.map((m, i) => (
                                    <option key={i} value={m.name || `${m.firstName} ${m.lastName}`}>{m.name || `${m.firstName} ${m.lastName}`}</option>
                                ))}
                            </select>

                            <div className="flex items-center gap-2 mb-6">
                                <div style={{ height: '1px', background: '#e2e8f0', flex: 1 }}></div>
                                <span className="text-xs text-gray-400">OR NEW MEMBER</span>
                                <div style={{ height: '1px', background: '#e2e8f0', flex: 1 }}></div>
                            </div>

                            <div className="flex gap-2 mb-6">
                                <input
                                    type="text"
                                    placeholder="Enter name..."
                                    value={newMemberName}
                                    onChange={(e) => setNewMemberName(e.target.value)}
                                    className="admin-input"
                                />
                                <button onClick={handleAddNewMember} className="btn-secondary">Add</button>
                            </div>

                            <div className="flex justify-between gap-3 pt-4 border-t border-gray-100">
                                <button onClick={handleClearAssignment} className="btn-icon delete flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded hover:bg-red-100">
                                    <Trash2 size={16} /> Clear Slot
                                </button>
                                <button onClick={handleSaveAssignment} className="btn-primary flex-1 justify-center">
                                    Save Assignment
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminEventsBreakfast;

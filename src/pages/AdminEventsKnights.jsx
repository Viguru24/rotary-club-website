import React, { useState, useEffect } from 'react';
import { Trash2, Edit2, Plus, Printer, X, User, Calendar, MapPin } from 'lucide-react';

const AdminEventsKnights = () => {
    // --- State ---
    const [rosters, setRosters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [members, setMembers] = useState([]);

    const [editingSlot, setEditingSlot] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [newMemberName, setNewMemberName] = useState('');
    const [selectedMember, setSelectedMember] = useState('');

    // --- Effects (Load Data) ---
    useEffect(() => {
        fetchRosters();
        fetchMembers();
    }, []);

    const fetchRosters = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/event-rosters?event_key=knights');
            const data = await response.json();

            if (data.length === 0) {
                // Initialize default setup
                const defaultDays = [
                    { date: 'Saturday 29/11/2025', slots: { '10:30 - 12:30': ['Richard York', 'Geof Loveday'], '12:30 - 2:30': ['Step Barrett', 'David Barrett'], '2:30 - 4:30': ['Colin Vane', 'Peggy & Oscar Vane', 'Merv Aranha'] } },
                    { date: 'Sunday 30/11/2025', slots: { '10:30 - 12:30': ['Roger Easter', 'Claude Bertin'], '12:30 - 2:30': ['Peter Lyons', 'Tricia Lyons'], '2:30 - 4:30': ['Colin Vane', 'Peggy & Oscar Vane', 'Gus Barnett', 'Nicole Barnett'] } },
                    { date: 'Saturday 06/12/2025', slots: { '10:30 - 12:30': ['Richard York', 'Geof Loveday'], '12:30 - 2:30': ['David Barrett', 'Lesley Williams'], '2:30 - 4:30': ['Matthew Baker', 'Louis De Souza', 'David Barrett'] } },
                    { date: 'Sunday 07/12/2025', slots: { '10:30 - 12:30': ['Annette Hughes', 'Sue Cook'], '12:30 - 2:30': ['Peter Freebody', 'Steph Barrett'], '2:30 - 4:30': ['Malcolm Russell', 'Nicola Russell', 'Claude Bertin', 'Andrew Brownless'] } },
                    { date: 'Saturday 13/12/2025', slots: { '10:30 - 12:30': ['Roger Easter', 'William Edwards'], '12:30 - 2:30': ['James Walker', 'William Edwards'], '2:30 - 4:30': ['Merv Aranha', 'Andy MacLellan', 'Anne Brownless', 'Rob Burchett'] } },
                    { date: 'Sunday 14/12/2025', slots: { '10:30 - 12:30': ['Steve Jacques', 'Steve Woplin'], '12:30 - 2:30': ['Peter Lyons', 'Tricia Lyons'], '2:30 - 4:30': ['Colin Vane', 'Peggy & Oscar Vane', 'Susanne Cook', 'Mike Dalton'] } },
                    { date: 'Saturday 20/12/2025', slots: { '10:30 - 12:30': ['Roger Easter', 'Merv Aranha'], '12:30 - 2:30': ['Andrew Brownless', 'Anne Brownless'], '2:30 - 4:30': ['Phil Flower', 'Anji Flower', 'Louis De Souza', 'Roger Easter'] } },
                    { date: 'Sunday 21/12/2025', slots: { '10:30 - 12:30': ['Annette Hughes', 'Steve Jacques'], '12:30 - 2:30': ['Peter Freebody', 'Geraint Jenkins'], '2:30 - 4:30': ['Malcolm Russell', 'Nicola Russell', 'William Edwards', 'Peter Freebody'] } }
                ];

                for (const day of defaultDays) {
                    await fetch('/api/event-rosters', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            event_key: 'knights',
                            title: 'Knights Garden Roster',
                            date: day.date,
                            location: 'Chelsham',
                            slots: JSON.stringify(day.slots),
                            notes: 'Note: If you can only do one hour, contact me. Do not contact Tony to re-arrange collectors.'
                        })
                    });
                }
                fetchRosters();
            } else {
                setRosters(data.map(r => ({
                    ...r,
                    slots: JSON.parse(r.slots || '{}')
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
            fetchRosters();
        } catch (err) {
            console.error('Error updating roster:', err);
        }
    };

    const openEdit = (rosterId, timeSlot, personIndex, currentName) => {
        setEditingSlot({ rosterId, timeSlot, personIndex });
        setSelectedMember(currentName || '');
        setShowModal(true);
    };

    const handleSaveAssignment = async () => {
        if (!editingSlot) return;
        const { rosterId, timeSlot, personIndex } = editingSlot;
        const roster = rosters.find(r => r.id === rosterId);
        if (roster && roster.slots[timeSlot]) {
            const newSlots = { ...roster.slots };
            newSlots[timeSlot][personIndex] = selectedMember;
            await updateRoster(rosterId, { slots: JSON.stringify(newSlots) });
        }
        setShowModal(false);
        setEditingSlot(null);
    };

    const handleClearAssignment = async () => {
        if (!editingSlot) return;
        const { rosterId, timeSlot, personIndex } = editingSlot;
        const roster = rosters.find(r => r.id === rosterId);
        if (roster && roster.slots[timeSlot]) {
            const newSlots = { ...roster.slots };
            newSlots[timeSlot].splice(personIndex, 1);
            await updateRoster(rosterId, { slots: JSON.stringify(newSlots) });
        }
        setShowModal(false);
        setEditingSlot(null);
    };

    const handleAddPersonToSlot = async (rosterId, timeSlot) => {
        const roster = rosters.find(r => r.id === rosterId);
        if (roster) {
            const newSlots = { ...roster.slots };
            if (!newSlots[timeSlot]) newSlots[timeSlot] = [];
            newSlots[timeSlot].push("TBA");
            await updateRoster(rosterId, { slots: JSON.stringify(newSlots) });
            openEdit(rosterId, timeSlot, newSlots[timeSlot].length - 1, "TBA");
        }
    };

    const handleAddNewMember = () => {
        const name = newMemberName.trim();
        if (name && !members.find(m => (m.name || `${m.firstName} ${m.lastName}`) === name)) {
            setMembers(prev => [...prev, { name }].sort((a, b) => (a.name || '').localeCompare(b.name || '')));
            setSelectedMember(name);
            setNewMemberName('');
        }
    };

    const handleEditField = (id, field, val) => {
        const newVal = prompt(`Edit ${field}`, val);
        if (newVal !== null) updateRoster(id, { [field]: newVal });
    };

    const countUnfilled = () => {
        let count = 0;
        rosters.forEach(r => {
            Object.values(r.slots).forEach(people => {
                count += people.filter(p => p === 'TBA').length;
            });
        });
        return count;
    };

    const countVolunteers = () => {
        let count = 0;
        rosters.forEach(r => {
            Object.values(r.slots).forEach(people => {
                count += people.length;
            });
        });
        return count;
    };

    if (loading) return <div className="admin-wrapper">Loading...</div>;

    const meta = rosters[0] || { title: 'Knights Garden Roster', notes: '' };

    return (
        <div className="admin-wrapper">
            <header className="admin-page-header">
                <div>
                    <h1 className="admin-page-title">{meta.title}</h1>
                    <p className="admin-page-subtitle">Manage volunteer shifts for the Christmas tree sales.</p>
                </div>
                <div className="admin-header-actions">
                    <button onClick={() => window.print()} className="btn-secondary"><Printer size={18} /> Print</button>
                    <button onClick={() => {
                        const date = prompt("New Date (e.g. Saturday 27/12/2025)");
                        if (date) {
                            fetch('/api/event-rosters', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    event_key: 'knights',
                                    title: meta.title,
                                    date: date,
                                    location: 'Chelsham',
                                    slots: JSON.stringify({ '10:30 - 12:30': ['TBA'], '12:30 - 2:30': ['TBA'], '2:30 - 4:30': ['TBA'] }),
                                    notes: meta.notes
                                })
                            }).then(() => fetchRosters());
                        }
                    }} className="btn-primary"><Plus size={18} /> Add Day</button>
                </div>
            </header>

            <div className="admin-card">
                <div className="admin-card-content">
                    <h2 className="text-lg font-bold cursor-pointer hover:text-blue-600" onClick={() => handleEditField(meta.id, 'title', meta.title)}>
                        {meta.title} <Edit2 size={14} style={{ display: 'inline', opacity: 0.5 }} />
                    </h2>
                    <p className="text-sm text-gray-500 mt-1 cursor-pointer hover:text-blue-600" onClick={() => handleEditField(meta.id, 'notes', meta.notes)}>
                        {meta.notes}
                    </p>
                </div>
            </div>

            <div className="admin-stats-grid">
                <div className="stat-card"><span className="stat-label">Days</span><span className="stat-value">{rosters.length}</span></div>
                <div className="stat-card"><span className="stat-label">Volunteers</span><span className="stat-value gradient-text">{countVolunteers()}</span></div>
                <div className="stat-card"><span className="stat-label">Unfilled</span><span className="stat-value text-red-500">{countUnfilled()}</span></div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.5rem' }}>
                {rosters.map(day => (
                    <div key={day.id} className="admin-card">
                        <div className="admin-card-header" style={{ background: 'var(--bg-tertiary)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <Calendar size={18} className="text-blue-600" />
                                <div>
                                    <h3 className="font-bold cursor-pointer hover:text-blue-600" onClick={() => handleEditField(day.id, 'date', day.date)}>{day.date}</h3>
                                    <p className="text-xs text-gray-500 uppercase font-bold">{day.location}</p>
                                </div>
                            </div>
                            <button onClick={() => { if (confirm("Delete this day?")) fetch(`/api/event-rosters/${day.id}`, { method: 'DELETE' }).then(() => fetchRosters()) }} className="btn-icon delete"><Trash2 size={16} /></button>
                        </div>
                        <div className="admin-card-content">
                            {Object.entries(day.slots).map(([time, people]) => (
                                <div key={time} style={{ marginBottom: '1rem' }}>
                                    <div className="text-xs font-bold text-gray-400 mb-2">{time}</div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        {people.map((p, idx) => (
                                            <div key={idx} onClick={() => openEdit(day.id, time, idx, p)} className={`flex justify-between items-center p-2 rounded border cursor-pointer hover:border-blue-300 ${p === 'TBA' ? 'bg-red-50 border-red-200 text-red-500' : 'bg-white border-gray-100'}`}>
                                                <div className="flex items-center gap-2"><User size={14} /><span>{p}</span></div>
                                                <Edit2 size={12} opacity={0.3} />
                                            </div>
                                        ))}
                                        <button onClick={() => handleAddPersonToSlot(day.id, time)} className="text-xs text-gray-400 hover:text-blue-600 flex items-center gap-1 mt-1"><Plus size={12} /> Add slot</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {showModal && (
                <div className="admin-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false) }}>
                    <div className="admin-modal">
                        <div className="admin-card-header"><h3 className="admin-card-title">Assign Volunteer</h3><button onClick={() => setShowModal(false)} className="btn-icon"><X size={20} /></button></div>
                        <div className="admin-card-content">
                            <label className="text-sm font-bold text-gray-600 mb-2 block">Select Member</label>
                            <select value={selectedMember} onChange={(e) => setSelectedMember(e.target.value)} className="admin-input mb-4">
                                <option value="">Select...</option>
                                <option value="TBA">TBA</option>
                                {members.map((m, i) => (
                                    <option key={i} value={m.name || `${m.firstName} ${m.lastName}`}>{m.name || `${m.firstName} ${m.lastName}`}</option>
                                ))}
                            </select>
                            <div className="flex items-center gap-2 mb-4"><div className="h-px bg-gray-200 flex-1"></div><span className="text-xs text-gray-400">OR NEW</span><div className="h-px bg-gray-200 flex-1"></div></div>
                            <div className="flex gap-2 mb-6"><input type="text" placeholder="Name..." value={newMemberName} onChange={(e) => setNewMemberName(e.target.value)} className="admin-input" /><button onClick={handleAddNewMember} className="btn-secondary">Add</button></div>
                            <div className="flex justify-between gap-3 pt-4 border-t border-gray-100">
                                <button onClick={handleClearAssignment} className="btn-icon delete flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded"><Trash2 size={16} /> Delete</button>
                                <button onClick={handleSaveAssignment} className="btn-primary flex-1 justify-center">Save</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminEventsKnights;

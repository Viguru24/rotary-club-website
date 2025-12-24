import React, { useState, useEffect } from 'react';
import { Trash2, Edit2, Plus, Download, Search, Check, X } from 'lucide-react';

const AdminEventsBunnyRun = () => {
    // --- State ---
    const [activeTab, setActiveTab] = useState('registrations');
    const [registrations, setRegistrations] = useState([]);
    const [santaBookings, setSantaBookings] = useState([]);
    const [breakfastBookings, setBreakfastBookings] = useState([]);
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('all');

    // Modal states (Assuming we keep the modals simple/placeholder for now or reuse logic)
    // For this refactor, I will focus on the main UI structure.
    const [showSantaModal, setShowSantaModal] = useState(false);
    const [showBreakfastModal, setShowBreakfastModal] = useState(false);
    const [showInvoiceModal, setShowInvoiceModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);

    // --- Mock Fetch (Use actual API in prod) ---
    useEffect(() => {
        fetchAllData();
    }, []);

    const fetchAllData = async () => {
        setLoading(true);
        try {
            await Promise.all([
                fetchRegistrations(),
                fetchSantaBookings(),
                fetchBreakfastBookings(),
                fetchInvoices()
            ]);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
        setLoading(false);
    };

    const fetchRegistrations = async () => {
        const response = await fetch('/api/bunny-run/registrations');
        const data = await response.json();
        setRegistrations(data);
    };
    const fetchSantaBookings = async () => {
        const response = await fetch('/api/bunny-run/santa-bookings');
        const data = await response.json();
        setSantaBookings(data);
    };
    const fetchBreakfastBookings = async () => {
        const response = await fetch('/api/bunny-run/breakfast-bookings');
        const data = await response.json();
        setBreakfastBookings(data);
    };
    const fetchInvoices = async () => {
        const response = await fetch('/api/bunny-run/invoices');
        const data = await response.json();
        setInvoices(data);
    };

    // --- Stats Calculations ---
    const total5k = registrations.filter(r => r.event_type === '5k').length;
    const total1k = registrations.filter(r => r.event_type === '1k').length;
    const totalSanta = santaBookings.length;
    const totalBreakfast = breakfastBookings.reduce((sum, b) => sum + (b.num_adults || 0) + (b.num_children || 0), 0);
    const totalInvoiceAmount = invoices.reduce((sum, inv) => sum + (parseFloat(inv.amount) || 0), 0);
    const paidInvoices = invoices.filter(inv => inv.status === 'paid').length;

    // --- Filtering ---
    const getFilteredData = () => {
        if (activeTab === 'registrations') {
            return registrations.filter(reg =>
                (filter === 'all' || reg.event_type === filter) &&
                (!searchTerm || reg.name.toLowerCase().includes(searchTerm.toLowerCase()) || reg.email.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }
        if (activeTab === 'santa') {
            return santaBookings.filter(b =>
                !searchTerm || b.parent_name.toLowerCase().includes(searchTerm.toLowerCase()) || b.email.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        if (activeTab === 'breakfast') {
            return breakfastBookings.filter(b =>
                !searchTerm || b.name.toLowerCase().includes(searchTerm.toLowerCase()) || b.email.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        if (activeTab === 'invoices') {
            return invoices.filter(inv =>
                (filter === 'all' || inv.status === filter) &&
                (!searchTerm || inv.company_name.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }
        return [];
    };

    const displayData = getFilteredData();

    return (
        <div className="admin-wrapper">

            {/* 1. Header */}
            <header className="admin-page-header">
                <div>
                    <h1 className="admin-page-title">Bunny Fun Run Management</h1>
                    <p className="admin-page-subtitle">
                        Central dashboard for Race Registrations, Santa Bookings, and Invoicing.
                    </p>
                </div>
                <div className="admin-header-actions">
                    <button className="btn-secondary" onClick={() => alert('Exporting...')}>
                        <Download size={18} /> Export Data
                    </button>
                    <button className="btn-primary" onClick={() => { /* Add logic based on tab */ }}>
                        <Plus size={18} /> Add New
                    </button>
                </div>
            </header>

            {/* 2. Stats Grid */}
            <div className="admin-stats-grid">
                <div className="stat-card">
                    <span className="stat-label">Race Runners</span>
                    <span className="stat-value gradient-text">{total5k + total1k}</span>
                    <div className="text-sm text-gray-400 mt-1 flex gap-2">
                        <span>5k: <b>{total5k}</b></span>
                        <span>•</span>
                        <span>1k: <b>{total1k}</b></span>
                    </div>
                </div>
                <div className="stat-card">
                    <span className="stat-label">Santa Bookings</span>
                    <span className="stat-value" style={{ color: '#ef4444' }}>{totalSanta}</span>
                </div>
                <div className="stat-card">
                    <span className="stat-label">Breakfast Guests</span>
                    <span className="stat-value" style={{ color: '#f59e0b' }}>{totalBreakfast}</span>
                </div>
                <div className="stat-card">
                    <span className="stat-label">Total Revenue (Invoiced)</span>
                    <span className="stat-value" style={{ color: '#10b981' }}>£{totalInvoiceAmount.toFixed(2)}</span>
                    <div className="text-sm text-gray-400 mt-1">
                        {paidInvoices} / {invoices.length} Paid
                    </div>
                </div>
            </div>

            {/* 3. Main Content Card */}
            <div className="admin-card">

                {/* Tabs & Toolbar */}
                <div className="admin-card-header" style={{ flexWrap: 'wrap', gap: '1rem' }}>

                    {/* Tabs */}
                    <div style={{ display: 'flex', gap: '0.5rem', background: '#f1f5f9', padding: '0.25rem', borderRadius: '0.75rem' }}>
                        {[
                            { id: 'registrations', label: 'Runners' },
                            { id: 'santa', label: 'Santa' },
                            { id: 'breakfast', label: 'Breakfast' },
                            { id: 'invoices', label: 'Invoices' }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => { setActiveTab(tab.id); setFilter('all'); setSearchTerm(''); }}
                                style={{
                                    padding: '0.5rem 1rem',
                                    borderRadius: '0.5rem',
                                    fontWeight: '600',
                                    fontSize: '0.9rem',
                                    border: 'none',
                                    cursor: 'pointer',
                                    background: activeTab === tab.id ? 'white' : 'transparent',
                                    color: activeTab === tab.id ? 'var(--accent-primary)' : 'var(--text-secondary)',
                                    boxShadow: activeTab === tab.id ? '0 1px 2px rgba(0,0,0,0.1)' : 'none',
                                    transition: 'all 0.2s'
                                }}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    <div style={{ flex: 1 }}></div>

                    {/* Search & Filter */}
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                        <div style={{ position: 'relative' }}>
                            <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                            <input
                                type="text"
                                placeholder="Search..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="admin-input"
                                style={{ paddingLeft: '2.2rem', width: '200px' }}
                            />
                        </div>

                        {activeTab === 'registrations' && (
                            <select value={filter} onChange={(e) => setFilter(e.target.value)} className="admin-input" style={{ width: 'auto' }}>
                                <option value="all">All Events</option>
                                <option value="5k">5k Run</option>
                                <option value="1k">1k Fun</option>
                            </select>
                        )}
                        {activeTab === 'invoices' && (
                            <select value={filter} onChange={(e) => setFilter(e.target.value)} className="admin-input" style={{ width: 'auto' }}>
                                <option value="all">All Status</option>
                                <option value="paid">Paid</option>
                                <option value="pending">Pending</option>
                            </select>
                        )}
                    </div>
                </div>

                {/* Table Content */}
                <div className="admin-card-content">
                    {loading ? (
                        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div>
                    ) : (
                        <div className="admin-table-container">
                            <table className="admin-table">
                                {/* Table Headers based on Active Tab */}
                                <thead>
                                    <tr>
                                        {activeTab === 'registrations' && (
                                            <>
                                                <th>Name</th>
                                                <th>Event</th>
                                                <th>Contact</th>
                                                <th>Age</th>
                                                <th>Consent</th>
                                                <th>Status</th>
                                                <th></th>
                                            </>
                                        )}
                                        {activeTab === 'santa' && (
                                            <>
                                                <th>Parent</th>
                                                <th>Child</th>
                                                <th>Contact</th>
                                                <th>Time Slot</th>
                                                <th>Requests</th>
                                                <th></th>
                                            </>
                                        )}
                                        {activeTab === 'breakfast' && (
                                            <>
                                                <th>Name</th>
                                                <th>Party Size</th>
                                                <th>Dietary</th>
                                                <th>Contact</th>
                                                <th></th>
                                            </>
                                        )}
                                        {activeTab === 'invoices' && (
                                            <>
                                                <th>Invoice #</th>
                                                <th>Client</th>
                                                <th>Amount</th>
                                                <th>Status</th>
                                                <th>Date</th>
                                                <th></th>
                                            </>
                                        )}
                                    </tr>
                                </thead>
                                <tbody>
                                    {displayData.map((item, idx) => (
                                        <tr key={item.id || idx}>
                                            {activeTab === 'registrations' && (
                                                <>
                                                    <td>
                                                        <div className="font-bold text-slate-800">{item.name}</div>
                                                        <div className="text-xs text-slate-400">Registered: {new Date(item.created_at).toLocaleDateString()}</div>
                                                    </td>
                                                    <td>
                                                        <span style={{
                                                            padding: '0.25rem 0.75rem', borderRadius: '1rem', fontSize: '0.75rem', fontWeight: 'bold',
                                                            background: item.event_type === '5k' ? '#dbeafe' : '#dcfce7',
                                                            color: item.event_type === '5k' ? '#1e40af' : '#166534'
                                                        }}>
                                                            {item.event_type}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <div className="text-sm">{item.email}</div>
                                                        <div className="text-xs text-slate-400">{item.phone}</div>
                                                    </td>
                                                    <td>{item.age}</td>
                                                    <td>
                                                        <div className="flex gap-2">
                                                            {item.consent_fitness ? <Check size={14} className="text-green-500" title="Fitness" /> : <X size={14} className="text-gray-300" />}
                                                            {item.consent_photos ? <Check size={14} className="text-blue-500" title="Photos" /> : <X size={14} className="text-gray-300" />}
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <span className="text-xs font-bold text-green-600">CONFIRMED</span>
                                                    </td>
                                                    <td>
                                                        <button className="btn-icon delete"><Trash2 size={16} /></button>
                                                    </td>
                                                </>
                                            )}

                                            {activeTab === 'santa' && (
                                                <>
                                                    <td><div className="font-bold text-slate-800">{item.parent_name}</div></td>
                                                    <td>{item.child_name} <span className="text-xs text-slate-400">({item.child_age})</span></td>
                                                    <td><div className="text-sm">{item.email}</div></td>
                                                    <td><span className="text-sm bg-red-50 text-red-600 px-2 py-1 rounded font-medium">{item.time_slot}</span></td>
                                                    <td><div className="text-xs italic text-slate-500 max-w-xs">{item.special_requests || 'None'}</div></td>
                                                    <td>
                                                        <div className="flex gap-2">
                                                            <button className="btn-icon"><Edit2 size={16} /></button>
                                                            <button className="btn-icon delete"><Trash2 size={16} /></button>
                                                        </div>
                                                    </td>
                                                </>
                                            )}

                                            {/* Implement other tabs similarly... keeping concise for now */}
                                            {activeTab === 'breakfast' && (
                                                <>
                                                    <td><div className="font-bold text-slate-800">{item.name}</div></td>
                                                    <td>
                                                        <span className="font-bold">{item.num_adults + item.num_children}</span>
                                                        <span className="text-xs text-slate-400 ml-1">({item.num_adults}A, {item.num_children}C)</span>
                                                    </td>
                                                    <td><div className="text-xs max-w-xs">{item.dietary_requirements || '-'}</div></td>
                                                    <td>{item.email}</td>
                                                    <td><button className="btn-icon delete"><Trash2 size={16} /></button></td>
                                                </>
                                            )}

                                            {activeTab === 'invoices' && (
                                                <>
                                                    <td className="font-mono text-sm">{item.invoice_number}</td>
                                                    <td className="font-bold text-slate-700">{item.company_name}</td>
                                                    <td className="font-bold">£{parseFloat(item.amount).toFixed(2)}</td>
                                                    <td>
                                                        <span style={{
                                                            padding: '0.25rem 0.75rem', borderRadius: '1rem', fontSize: '0.75rem', fontWeight: 'bold',
                                                            background: item.status === 'paid' ? '#dcfce7' : '#fff7ed',
                                                            color: item.status === 'paid' ? '#166534' : '#c2410c'
                                                        }}>
                                                            {item.status.toUpperCase()}
                                                        </span>
                                                    </td>
                                                    <td className="text-sm text-slate-500">{new Date(item.created_at).toLocaleDateString()}</td>
                                                    <td><button className="btn-icon delete"><Trash2 size={16} /></button></td>
                                                </>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {displayData.length === 0 && (
                                <div className="text-center py-8 text-slate-400">No records found.</div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminEventsBunnyRun;

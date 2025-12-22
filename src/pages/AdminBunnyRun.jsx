import React, { useState, useEffect } from 'react';

const AdminBunnyRun = () => {
    const [registrations, setRegistrations] = useState([]);
    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRegistrations();
    }, []);

    const fetchRegistrations = async () => {
        try {
            const response = await fetch('/api/bunny-run/registrations');
            const data = await response.json();
            setRegistrations(data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching registrations:', error);
            setLoading(false);
        }
    };

    const filteredRegistrations = registrations.filter(reg => {
        const matchesFilter = filter === 'all' || reg.event_type === filter;
        const matchesSearch = !searchTerm ||
            reg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            reg.email.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    const exportToExcel = async () => {
        try {
            const response = await fetch('/api/bunny-run/export');
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `bunny-run-registrations-${new Date().toISOString().split('T')[0]}.xlsx`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Error exporting:', error);
            alert('Failed to export registrations');
        }
    };

    const deleteRegistration = async (id) => {
        if (!window.confirm('Are you sure you want to delete this registration?')) return;

        try {
            await fetch(`/api/bunny-run/registrations/${id}`, { method: 'DELETE' });
            fetchRegistrations();
        } catch (error) {
            console.error('Error deleting:', error);
            alert('Failed to delete registration');
        }
    };

    if (loading) {
        return <div className="admin-loading">Loading registrations...</div>;
    }

    return (
        <div className="admin-section">
            <div className="admin-header">
                <h1>🐰 Bunny Fun Run Registrations</h1>
                <div className="admin-actions">
                    <button onClick={exportToExcel} className="btn-primary">
                        📊 Export to Excel
                    </button>
                    <button onClick={() => window.open('/bunny-run-form.pdf')} className="btn-secondary">
                        📄 Download Blank Form
                    </button>
                </div>
            </div>

            <div className="filter-bar">
                <div className="search-box">
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                </div>
                <div className="filter-buttons">
                    <button
                        className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                        onClick={() => setFilter('all')}
                    >
                        All ({registrations.length})
                    </button>
                    <button
                        className={`filter-btn ${filter === '5k' ? 'active' : ''}`}
                        onClick={() => setFilter('5k')}
                    >
                        5k Only ({registrations.filter(r => r.event_type === '5k').length})
                    </button>
                    <button
                        className={`filter-btn ${filter === '1k' ? 'active' : ''}`}
                        onClick={() => setFilter('1k')}
                    >
                        1k Only ({registrations.filter(r => r.event_type === '1k').length})
                    </button>
                </div>
            </div>

            <div className="table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Name</th>
                            <th>Event</th>
                            <th>Email</th>
                            <th>Phone</th>
                            <th>Age</th>
                            <th>Postcode</th>
                            <th>Fitness Consent</th>
                            <th>Photo Consent</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredRegistrations.length === 0 ? (
                            <tr>
                                <td colSpan="10" style={{ textAlign: 'center', padding: '2rem' }}>
                                    No registrations found
                                </td>
                            </tr>
                        ) : (
                            filteredRegistrations.map((reg) => (
                                <tr key={reg.id}>
                                    <td>{new Date(reg.created_at).toLocaleDateString()}</td>
                                    <td><strong>{reg.name}</strong></td>
                                    <td>
                                        <span className={`event-badge ${reg.event_type}`}>
                                            {reg.event_type}
                                        </span>
                                    </td>
                                    <td>{reg.email}</td>
                                    <td>{reg.phone}</td>
                                    <td>{reg.age || '-'}</td>
                                    <td>{reg.postcode}</td>
                                    <td>{reg.consent_fitness ? '✅' : '❌'}</td>
                                    <td>{reg.consent_photos ? '✅' : '❌'}</td>
                                    <td>
                                        <button
                                            onClick={() => deleteRegistration(reg.id)}
                                            className="btn-delete"
                                            title="Delete registration"
                                        >
                                            🗑️
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <div className="registration-stats">
                <div className="stat-card">
                    <div className="stat-number">{registrations.length}</div>
                    <div className="stat-label">Total Registrations</div>
                </div>
                <div className="stat-card">
                    <div className="stat-number">{registrations.filter(r => r.event_type === '5k').length}</div>
                    <div className="stat-label">5k Runners</div>
                </div>
                <div className="stat-card">
                    <div className="stat-number">{registrations.filter(r => r.event_type === '1k').length}</div>
                    <div className="stat-label">1k Fun Run</div>
                </div>
                <div className="stat-card">
                    <div className="stat-number">
                        £{(registrations.filter(r => r.event_type === '5k').length * 7 +
                            registrations.filter(r => r.event_type === '1k').length * 5).toFixed(2)}
                    </div>
                    <div className="stat-label">Expected Revenue</div>
                </div>
            </div>
        </div>
    );
};

export default AdminBunnyRun;

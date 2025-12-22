import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Admin Layout Component
// Admin Layout Component - Floating Glass Design
const AdminLayout = () => {
    const { user, logout, loading } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
    const [showNotifications, setShowNotifications] = useState(false);

    // Handle Mobile Logic
    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 1024;
            setIsMobile(mobile);
            if (!mobile) setMobileOpen(false); // Reset mobile state on desktop
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const toggleSidebar = () => {
        if (isMobile) {
            setMobileOpen(!mobileOpen);
        } else {
            setCollapsed(!collapsed);
        }
    };

    // Close mobile sidebar on route change
    useEffect(() => {
        if (isMobile) setMobileOpen(false);
    }, [location.pathname, isMobile]);

    // Redirect if not logged in
    useEffect(() => {
        if (!loading && !user) {
            navigate('/login');
        }
    }, [user, loading, navigate]);

    // Add admin-body class to body on mount, remove on unmount
    useEffect(() => {
        document.body.classList.add('admin-body');
        return () => {
            document.body.classList.remove('admin-body');
        };
    }, []);

    const allMenuItems = [
        { path: '/admin', icon: 'dashboard', label: 'Dashboard', access: 'all' },
        { path: '/admin/blog', icon: 'article', label: 'Blog Posts', access: 'all' },
        { path: '/admin/events', icon: 'calendar_month', label: 'Events', access: 'all' },
        { path: '/admin/members', icon: 'group', label: 'Members', access: 'all' },
        { path: '/admin/finance', icon: 'account_balance_wallet', label: 'Finance', access: 'admin' },
        { path: '/admin/documents', icon: 'folder_open', label: 'Files', access: 'admin' },
        { path: '/admin/site-settings', icon: 'settings', label: 'Settings', access: 'admin' },
        { path: '/admin/legals', icon: 'gavel', label: 'Legal', access: 'admin' },
    ];

    const isAdmin = true; // FORCE ADMIN VIEW
    const menuItems = allMenuItems;

    const currentTitle = menuItems.find(i => i.path === location.pathname)?.label || 'Overview';

    if (loading || !user) return null;

    return (
        <div className="admin-container">
            {/* Background Blobs (Optional - can be removed if mesh gradient is sufficient) */}
            <div className="admin-bg-blobs">
                <div className="blob" style={{ top: '-10%', left: '-10%', width: '50vw', height: '50vw', background: 'rgba(96, 165, 250, 0.1)' }}></div>
                <div className="blob" style={{ bottom: '-10%', right: '-10%', width: '40vw', height: '40vw', background: 'rgba(192, 132, 252, 0.1)' }}></div>
            </div>

            {/* Mobile Overlay */}
            {isMobile && mobileOpen && (
                <div
                    className="mobile-overlay"
                    onClick={() => setMobileOpen(false)}
                    style={{
                        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
                        backdropFilter: 'blur(4px)', zIndex: 90
                    }}
                />
            )}

            {/* Sidebar Card */}
            <aside className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', height: '100%' }}>

                    {/* Brand - Toggle Switch (Secondary) */}
                    <div
                        onClick={toggleSidebar}
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '0.5rem',
                            cursor: 'pointer',
                            userSelect: 'none',
                            padding: '1rem 0.5rem 0 0.5rem',
                            textAlign: 'center',
                            width: '100%'
                        }}
                        title="Toggle Sidebar"
                    >
                        {/* Rotary Icon Removed */}

                        <div className="admin-sidebar-text" style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            overflow: 'visible',
                            whiteSpace: 'normal',
                            width: '100%',
                            marginTop: '0.25rem'
                        }}>
                            <h1 style={{ color: '#005baa', fontSize: '1.5rem', fontWeight: 800, lineHeight: 1, letterSpacing: '-0.02em' }}>Rotary</h1>
                            <h2 style={{ color: '#f7a81b', fontSize: '1rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', lineHeight: 1.2 }}>Dashboard</h2>

                            {/* Welcome Message */}
                            <div style={{ marginTop: '0.75rem', borderTop: '1px solid rgba(0,0,0,0.1)', paddingTop: '0.5rem', width: '90%' }}>
                                <p style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 500 }}>Welcome,</p>
                                <p style={{ color: '#0f172a', fontSize: '0.9rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.given_name || user?.name || 'Rotarian'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Nav - Scrollable Area */}
                    <nav style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.5rem',
                        flex: 1,
                        overflowY: 'auto',
                        overflowX: 'hidden',
                        paddingRight: '0.25rem', // Space for scrollbar
                        WebkitOverflowScrolling: 'touch',
                        scrollbarWidth: 'thin' // Firefox
                    }} className="sidebar-nav-scroll">
                        {menuItems.map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
                                title={collapsed ? item.label : ''}
                            >
                                <span className="material-symbols-outlined" style={{ fontSize: '1.25rem', flexShrink: 0 }}>{item.icon}</span>
                                <span className="admin-sidebar-text">{item.label}</span>
                            </Link>
                        ))}
                    </nav>

                    {/* Bottom User Section */}
                    <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem', flexShrink: 0 }}>
                        <div className="admin-sidebar-text" style={{ height: '1px', width: '100%', background: '#cbd5e1' }}></div>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            justifyContent: (collapsed && !isMobile) ? 'center' : 'flex-start'
                        }}>
                            <img
                                src={user?.picture || 'https://ui-avatars.com/api/?name=Admin&background=random'}
                                alt={user?.name || 'User'}
                                style={{
                                    width: '2.5rem', height: '2.5rem', borderRadius: '50%', boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                                    objectFit: 'cover', flexShrink: 0
                                }}
                            />
                            <div className="admin-sidebar-text" style={{ display: 'flex', flexDirection: 'column', whiteSpace: 'nowrap' }}>
                                <p style={{ color: '#0f172a', fontSize: '0.875rem', fontWeight: 600 }}>{user?.name || user?.given_name || 'User'}</p>
                                <p style={{ color: '#64748b', fontSize: '0.75rem' }}>{isAdmin ? 'Admin' : 'Member'}</p>
                            </div>

                            <button
                                className="admin-sidebar-text"
                                onClick={() => { logout(); navigate('/login'); }}
                                style={{ marginLeft: 'auto', color: '#64748b', background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem' }}
                            >
                                <span className="material-symbols-outlined">logout</span>
                            </button>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content Card */}
            <main className="main-content">
                <header className="top-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        {/* Hamburger Menu Toggle */}
                        <button
                            onClick={toggleSidebar}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#64748b',
                                padding: '0.5rem',
                                borderRadius: '0.5rem',
                                transition: 'background 0.2s'
                            }}
                            className="hover:bg-slate-100"
                            title={isMobile ? "Open Menu" : (collapsed ? "Expand Sidebar" : "Collapse Sidebar")}
                        >
                            <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>menu</span>
                        </button>

                        <div>
                            <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0f172a', letterSpacing: '-0.025em', marginBottom: '0.25rem', lineHeight: 1.2 }}>{currentTitle}</h2>
                            {/* Breadcrumbs or subtext could go here */}
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', position: 'relative' }}>
                        <div className="search-bar hidden md-flex" style={{ background: 'rgba(255,255,255,0.5)', padding: '0.5rem 1rem', borderRadius: '99px', border: '1px solid white' }}>
                            <span className="material-symbols-outlined" style={{ color: '#94a3b8', fontSize: '20px' }}>search</span>
                            <input
                                type="text"
                                placeholder="Search..."
                                style={{ background: 'transparent', border: 'none', width: '150px', marginLeft: '0.5rem', outline: 'none', color: '#334155', fontSize: '0.875rem' }}
                            />
                        </div>

                        {/* Notification Button */}
                        <button
                            onClick={() => setShowNotifications(!showNotifications)}
                            style={{ width: '2.75rem', height: '2.75rem', borderRadius: '50%', background: 'white', border: '1px solid white', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', cursor: 'pointer', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', position: 'relative' }}
                        >
                            <span className="material-symbols-outlined">notifications</span>
                            <span style={{ position: 'absolute', top: '0px', right: '0px', width: '12px', height: '12px', background: '#ef4444', borderRadius: '50%', border: '2px solid white' }}></span>
                        </button>

                        {/* Notifications Dropdown */}
                        {showNotifications && (
                            <>
                                <div style={{ position: 'fixed', inset: 0, zIndex: 99 }} onClick={() => setShowNotifications(false)}></div>
                                <div style={{
                                    position: 'absolute', top: '120%', right: 0, width: '320px', background: 'white', borderRadius: '16px',
                                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                                    border: '1px solid #e2e8f0', zIndex: 100, overflow: 'hidden'
                                }}>
                                    <div style={{ padding: '16px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>Notifications</h3>
                                        <span style={{ fontSize: '0.75rem', color: '#005baa', fontWeight: 600, cursor: 'pointer' }}>Mark all read</span>
                                    </div>
                                    <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
                                        {[
                                            { id: 1, title: 'New Member Signup', desc: 'John Doe applied for membership.', time: '2 mins ago', icon: 'person_add', color: '#3b82f6' },
                                            { id: 2, title: 'Expense Approval', desc: 'Catering bill needs review.', time: '1 hour ago', icon: 'receipt_long', color: '#f59e0b' },
                                            { id: 3, title: 'Event Reminder', desc: 'Weekly meeting starts in 2 hours.', time: '2 hours ago', icon: 'event', color: '#10b981' },
                                            { id: 4, title: 'System Update', desc: 'Maintenance scheduled for tonight.', time: '5 hours ago', icon: 'settings', color: '#64748b' },
                                            { id: 5, title: 'New Comment', desc: 'Sarah commented on the blog post.', time: '1 day ago', icon: 'chat_bubble', color: '#8b5cf6' },
                                        ].map(n => (
                                            <div key={n.id} style={{ padding: '12px 16px', display: 'flex', gap: '12px', borderBottom: '1px solid #f8fafc', alignItems: 'start', cursor: 'pointer' }} className="hover:bg-slate-50">
                                                <div style={{ padding: '8px', borderRadius: '50%', background: `${n.color}15`, color: n.color, display: 'flex' }}>
                                                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>{n.icon}</span>
                                                </div>
                                                <div>
                                                    <p style={{ fontSize: '0.9rem', fontWeight: 600, color: '#334155', margin: '0 0 2px 0' }}>{n.title}</p>
                                                    <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0, lineHeight: 1.3 }}>{n.desc}</p>
                                                    <p style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '4px' }}>{n.time}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div style={{ padding: '12px', textAlign: 'center', borderTop: '1px solid #f1f5f9', background: '#f8fafc' }}>
                                        <Link to="/admin" style={{ fontSize: '0.85rem', color: '#005baa', fontWeight: 600, textDecoration: 'none' }}>View All Activity</Link>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </header>

                <div className="content-scroll">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;

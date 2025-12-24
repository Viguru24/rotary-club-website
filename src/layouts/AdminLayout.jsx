import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

import { AdminThemeProvider, useAdminTheme } from '../context/AdminThemeContext';

// Admin Layout Component
// Admin Layout Component - Floating Glass Design
const AdminLayoutContent = () => {
    const { user, logout, loading } = useAuth();
    const { currentTheme, changeTheme } = useAdminTheme();
    const [themeMenuOpen, setThemeMenuOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    // Helper to exit admin panel (logout and go home)
    const handleExit = (e) => {
        if (e) e.preventDefault();
        logout();
        navigate('/');
    };

    // Default to expanded (false) for better visibility
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
    const [hoverTimeout, setHoverTimeout] = useState(null);
    const [leaveTimeout, setLeaveTimeout] = useState(null); // Add tracking for leave timeout
    const [scrollY, setScrollY] = useState(0);
    const contentRef = React.useRef(null);

    const [expandedMenus, setExpandedMenus] = useState({});

    // Parallax Scroll Listener
    useEffect(() => {
        const handleScroll = () => {
            if (contentRef.current) {
                setScrollY(contentRef.current.scrollTop);
            }
        };

        const contentElement = contentRef.current;
        if (contentElement) {
            contentElement.addEventListener('scroll', handleScroll);
        }

        return () => {
            if (contentElement) {
                contentElement.removeEventListener('scroll', handleScroll);
            }
        };
    }, []);

    const toggleMenu = (path) => {
        setExpandedMenus(prev => ({
            ...prev,
            [path]: !prev[path]
        }));
    };

    // Auto-expand menu if current path matches a sub-item
    useEffect(() => {
        menuItems.forEach(item => {
            if (item.subItems) {
                const isSubItemActive = item.subItems.some(sub => location.pathname === sub.path);
                if (isSubItemActive && !expandedMenus[item.path]) {
                    setExpandedMenus(prev => ({ ...prev, [item.path]: true }));
                }
            }
        });
    }, [location.pathname]);

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
        {
            path: '/admin/events',
            icon: 'celebration',
            label: 'Events',
            access: 'all',
            subItems: [
                { path: '/admin/events/bunny-run', label: '🐰 Bunny Fun Run' },
                { path: '/admin/events/santa-tour', label: '🎅 Santa Tour' },
                { path: '/santa-tracker', label: '🛷 Santa Tracker (Live)', external: true },
                { path: '/admin/events/knights-garden', label: '🎄 Knights Garden' },
                { path: '/admin/events/breakfast', label: '🥞 Breakfast' },
                { path: '/admin/events/invoice', label: '🧾 General Invoice' },
            ]
        },
        { path: '/admin/documents', icon: 'folder_open', label: 'Files', access: 'admin' },
        { path: '/admin/finance', icon: 'account_balance_wallet', label: 'Finance', access: 'admin' },
        { path: '/admin/members', icon: 'group', label: 'Members', access: 'all' },
        { path: '/admin/calendar', icon: 'calendar_month', label: 'Calendar', access: 'all' },
        { path: '/admin/blog', icon: 'article', label: 'Blog Posts', access: 'all' },
        { path: '/admin/home-settings', icon: 'home', label: 'Home Settings', access: 'admin' },
        { path: '/admin/site-settings', icon: 'settings', label: 'Settings', access: 'admin' },
        { path: '/admin/legals', icon: 'gavel', label: 'Legal', access: 'admin' },
    ];

    const isAdmin = true; // FORCE ADMIN VIEW
    const menuItems = allMenuItems;

    const currentTitle = menuItems.find(i => i.path === location.pathname)?.label || 'Overview';

    if (loading || !user) return null;

    return (
        <div className={`admin-container theme-${currentTheme}`}>
            {/* Star Field Background with Parallax (Only for Glass Theme) */}
            {currentTheme === 'glass' && (
                <div className="star-field" style={{ transform: `translateY(-${scrollY * 0.2}px)` }}>
                    {Array.from({ length: 50 }).map((_, i) => (
                        <div
                            key={i}
                            className="star"
                            style={{
                                top: `${Math.random() * 100}%`,
                                left: `${Math.random() * 100}%`,
                                width: `${Math.random() * 3 + 1}px`,
                                height: `${Math.random() * 3 + 1}px`,
                                '--duration': `${Math.random() * 3 + 2}s`,
                                '--delay': `${Math.random() * 2}s`
                            }}
                        />
                    ))}

                    {/* Constellation 1 (Big Dipper - Top Right) */}
                    <svg className="constellation constellation-1 lazy-float" width="200" height="150" viewBox="0 0 200 150" style={{ top: '10%', right: '5%' }}>
                        <path d="M10,80 L50,60 L90,70 L130,50 L160,30 L180,60 L140,90 Z" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
                        <circle cx="10" cy="80" r="2" fill="white" className="star opacity-80" />
                        <circle cx="50" cy="60" r="2" fill="white" className="star opacity-80" />
                        <circle cx="90" cy="70" r="2" fill="white" className="star opacity-80" />
                        <circle cx="130" cy="50" r="2" fill="white" className="star opacity-80" />
                        <circle cx="160" cy="30" r="2" fill="white" className="star opacity-80" />
                        <circle cx="180" cy="60" r="2" fill="white" className="star opacity-80" />
                        <circle cx="140" cy="90" r="2" fill="white" className="star opacity-80" />
                    </svg>

                    {/* Constellation 2 (Cassiopeia - Bottom Left) */}
                    <svg className="constellation constellation-2 lazy-float-reverse" width="180" height="120" viewBox="0 0 180 120" style={{ bottom: '15%', left: '2%' }}>
                        <path d="M10,30 L40,80 L80,50 L120,70 L160,40" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
                        <circle cx="10" cy="30" r="2" fill="white" className="star opacity-80" />
                        <circle cx="40" cy="80" r="1.5" fill="white" className="star opacity-80" />
                        <circle cx="80" cy="50" r="2" fill="white" className="star opacity-80" />
                        <circle cx="120" cy="70" r="1.5" fill="white" className="star opacity-80" />
                        <circle cx="160" cy="40" r="1.5" fill="white" className="star opacity-80" />
                    </svg>

                    {/* Constellation 3 (Orion Belt - Top Left) */}
                    <svg className="constellation constellation-3 lazy-float" width="120" height="100" viewBox="0 0 120 100" style={{ top: '15%', left: '15%' }}>
                        <path d="M20,20 L50,50 L80,80" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />
                        <circle cx="20" cy="20" r="1.5" fill="white" className="star opacity-60" />
                        <circle cx="50" cy="50" r="1.5" fill="white" className="star opacity-60" />
                        <circle cx="80" cy="80" r="1.5" fill="white" className="star opacity-60" />
                    </svg>
                </div>
            )}

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
            <aside
                className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}
                style={{ height: isMobile ? '100dvh' : '100vh', paddingTop: '0.5rem', paddingBottom: '1rem' }}
            >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', height: '100%', overflow: 'hidden', position: 'relative', zIndex: 2 }}>

                    {/* Brand - Toggle Switch (Secondary) */}
                    {/* Brand & Toggle */}
                    <Link to="/admin" style={{ padding: '0 0.5rem', marginBottom: '0.5rem', position: 'relative', minHeight: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}>

                        {/* Collapse Button (Desktop) - REMOVED for automatic hover behavior */}

                        {!collapsed && (
                            <div className="admin-sidebar-text" style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                width: '100%',
                                opacity: collapsed ? 0 : 1,
                                transition: 'opacity 0.2s'
                            }}>
                                <h1 style={{ color: '#0f172a', fontSize: '1rem', fontWeight: 800, lineHeight: 1, letterSpacing: '-0.02em' }}>Rotary</h1>
                                <p style={{ color: '#d97706', fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Dashboard</p>
                            </div>
                        )}

                        {collapsed && (
                            <div style={{
                                width: '100%',
                                height: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <span className="material-symbols-outlined" style={{
                                    color: '#64748b',
                                    fontSize: '1.5rem',
                                    opacity: 1
                                }}>dashboard</span>
                            </div>
                        )}
                    </Link>

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
                        {menuItems.map((item) => {
                            const isActive = location.pathname === item.path;
                            const isSubItemActive = item.subItems?.some(sub => location.pathname === sub.path);
                            const isExpanded = expandedMenus[item.path];

                            return (
                                <div key={item.path}>
                                    {item.subItems ? (
                                        <>
                                            <div
                                                onClick={() => toggleMenu(item.path)}
                                                className={`nav-link ${isSubItemActive ? 'active' : ''}`}
                                                style={{ cursor: 'pointer', justifyContent: 'space-between' }}
                                                title={collapsed ? item.label : ''}
                                            >
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                    <span className="material-symbols-outlined" style={{ fontSize: '1.25rem', flexShrink: 0 }}>{item.icon}</span>
                                                    <span className="admin-sidebar-text">{item.label}</span>
                                                </div>
                                                <span
                                                    className="material-symbols-outlined admin-sidebar-text"
                                                    style={{
                                                        fontSize: '1.25rem',
                                                        transition: 'transform 0.2s',
                                                        transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)'
                                                    }}
                                                >
                                                    expand_more
                                                </span>
                                            </div>
                                            {isExpanded && (
                                                <div style={{
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    gap: '0.25rem',
                                                    paddingLeft: '2.5rem',
                                                    marginTop: '0.25rem',
                                                    marginBottom: '0.25rem'
                                                }}>
                                                    {item.subItems.map((subItem) => (
                                                        <Link
                                                            key={subItem.path}
                                                            to={subItem.path}
                                                            className={`nav-link ${location.pathname === subItem.path ? 'active' : ''}`}
                                                            style={{
                                                                padding: '0.5rem 0.75rem',
                                                                fontSize: '0.875rem'
                                                            }}
                                                        >
                                                            <span className="admin-sidebar-text">{subItem.label}</span>
                                                        </Link>
                                                    ))}
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <Link
                                            to={item.path}
                                            className={`nav-link ${isActive ? 'active' : ''}`}
                                            title={collapsed ? item.label : ''}
                                        >
                                            <span className="material-symbols-outlined" style={{ fontSize: '1.25rem', flexShrink: 0 }}>{item.icon}</span>
                                            <span className="admin-sidebar-text">{item.label}</span>
                                        </Link>
                                    )}
                                </div>
                            );
                        })}
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
                            {user?.picture ? (
                                <img
                                    src={user.picture}
                                    alt={user.name || 'User'}
                                    style={{
                                        width: '2.5rem', height: '2.5rem', borderRadius: '50%', boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                                        objectFit: 'cover', flexShrink: 0
                                    }}
                                />
                            ) : (
                                <span className="material-symbols-outlined" style={{ fontSize: '2.5rem', color: '#cbd5e1' }}>account_circle</span>
                            )}
                            <div className="admin-sidebar-text" style={{ display: 'flex', flexDirection: 'column', whiteSpace: 'nowrap' }}>
                                <p style={{ color: '#0f172a', fontSize: '0.875rem', fontWeight: 600 }}>{user?.name || user?.given_name || 'User'}</p>
                                <p style={{ color: '#64748b', fontSize: '0.75rem' }}>{isAdmin ? 'Admin' : 'Member'}</p>
                            </div>

                            <button
                                className="admin-sidebar-text"
                                onClick={() => { logout(); navigate('/'); }}
                                style={{ marginLeft: 'auto', color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem' }}
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '0.5rem' : '1rem', flex: 1, minWidth: 0 }}>
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
                                color: '#475569',
                                padding: '0.4rem',
                                borderRadius: '0.5rem',
                                transition: 'background 0.2s',
                                flexShrink: 0
                            }}
                            className="hover:bg-white/10"
                            title={isMobile ? "Open Menu" : (collapsed ? "Expand Sidebar" : "Collapse Sidebar")}
                        >
                            <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>menu</span>
                        </button>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <h2 style={{
                                fontSize: isMobile ? '1rem' : '1.25rem',
                                fontWeight: 700,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                            }}>{currentTitle}</h2>
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '0.5rem' : '1rem', position: 'relative', flexShrink: 0 }}>
                        {/* Theme Switcher */}
                        <div className="profile-wrapper" style={{ marginRight: '0.2rem' }}>
                            <div className="profile-btn" onClick={() => setThemeMenuOpen(!themeMenuOpen)} title="Change Theme">
                                <div style={{
                                    width: '2rem', height: '2rem', borderRadius: '50%', background: 'white', border: '1px solid #e2e8f0',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', cursor: 'pointer',
                                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                                }}>
                                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>palette</span>
                                </div>
                            </div>

                            {/* Theme Dropdown */}
                            {themeMenuOpen && (
                                <div className="profile-dropdown" style={{
                                    position: 'absolute', top: '100%', right: 0, marginTop: '0.5rem',
                                    background: 'white', borderRadius: '0.75rem', padding: '0.5rem',
                                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', minWidth: '160px', zIndex: 100
                                }}>
                                    <div className="dropdown-header" style={{ padding: '0.5rem 0.75rem', fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase' }}>
                                        Select Theme
                                    </div>
                                    <div className="dropdown-divider" style={{ height: '1px', background: '#f1f5f9', margin: '0.25rem 0' }}></div>
                                    <button
                                        onClick={() => { changeTheme('basic'); setThemeMenuOpen(false); }}
                                        style={{
                                            display: 'flex', alignItems: 'center', width: '100%', padding: '0.5rem 0.75rem',
                                            background: 'none', border: 'none', cursor: 'pointer', color: '#334155', fontSize: '0.875rem', textAlign: 'left', borderRadius: '0.5rem'
                                        }}
                                        className="hover:bg-slate-50"
                                    >
                                        <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#cbd5e1', marginRight: 8 }}></div>
                                        Basic
                                    </button>
                                    <button
                                        onClick={() => { changeTheme('vibrant'); setThemeMenuOpen(false); }}
                                        style={{
                                            display: 'flex', alignItems: 'center', width: '100%', padding: '0.5rem 0.75rem',
                                            background: 'none', border: 'none', cursor: 'pointer', color: '#334155', fontSize: '0.875rem', textAlign: 'left', borderRadius: '0.5rem'
                                        }}
                                        className="hover:bg-slate-50"
                                    >
                                        <div style={{ width: 12, height: 12, borderRadius: '50%', background: 'linear-gradient(135deg, #4f46e5, #ec4899)', marginRight: 8 }}></div>
                                        Vibrant
                                    </button>
                                    <button
                                        onClick={() => { changeTheme('glass'); setThemeMenuOpen(false); }}
                                        style={{
                                            display: 'flex', alignItems: 'center', width: '100%', padding: '0.5rem 0.75rem',
                                            background: 'none', border: 'none', cursor: 'pointer', color: '#334155', fontSize: '0.875rem', textAlign: 'left', borderRadius: '0.5rem'
                                        }}
                                        className="hover:bg-slate-50"
                                    >
                                        <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#0f172a', marginRight: 8 }}></div>
                                        Glass (Default)
                                    </button>
                                </div>
                            )}
                        </div>
                        <a
                            href="/"
                            onClick={handleExit}
                            style={{
                                width: '2rem', height: '2rem', borderRadius: '50%', background: 'white', border: '1px solid #e2e8f0',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', textDecoration: 'none',
                                boxShadow: '0 1px 2px rgba(0,0,0,0.05)', flexShrink: 0, cursor: 'pointer'
                            }}
                            title="Logout and Exit to Public Site"
                        >
                            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>public</span>
                        </a>
                    </div>
                </header>

                <div className="content-scroll" ref={contentRef}>
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

const AdminLayout = () => (
    <AdminThemeProvider>
        <AdminLayoutContent />
    </AdminThemeProvider>
);

export default AdminLayout;

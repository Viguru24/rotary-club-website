import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBars, FaTimes, FaChevronDown, FaInfoCircle, FaHandshake, FaQuestionCircle, FaMapMarkerAlt } from 'react-icons/fa';
import { getNavLinks } from '../services/navigationService';

// Standard Rotary Logo URL
const ROTARY_LOGO_URL = "https://www.rotary.org/sites/all/themes/rotary_rotaryorg/images/rotary-logo-color-2019-simplified.svg";

import { useAuth } from '../context/AuthContext';
import { useGoogleLogin } from '@react-oauth/google';

const Navbar = () => {
    const { user, login, logout } = useAuth();
    const [scrolled, setScrolled] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [navLinks, setNavLinks] = useState([]);
    const [hoveredTab, setHoveredTab] = useState(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const location = useLocation();

    // Google Login Hook
    const googleLogin = useGoogleLogin({
        onSuccess: login,
        onError: () => console.log('Login Failed'),
    });

    useEffect(() => {
        setNavLinks(getNavLinks());
        const handleNavUpdate = () => setNavLinks(getNavLinks());
        window.addEventListener('nav-updated', handleNavUpdate);

        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);

        return () => {
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('nav-updated', handleNavUpdate);
        };
    }, []);

    // Filter links based on user order
    const mainLinks = navLinks;

    // Styles objects to replace Tailwind
    const styles = {
        nav: {
            height: 'var(--nav-height)',
            padding: '0 2rem',
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 50,
            pointerEvents: 'auto',
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(16px)',
            boxShadow: scrolled ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
            transition: 'all 0.3s ease',
            borderBottom: '1px solid rgba(0,0,0,0.05)'
        },
        container: {
            maxWidth: '1200px',
            margin: '0 auto',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            pointerEvents: 'auto',
            position: 'relative'
        },
        logoArea: {
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            textDecoration: 'none',
            zIndex: 50
        },
        logoImg: {
            height: '48px',
            width: 'auto',
            transition: 'transform 0.3s'
        },
        logoTextCol: {
            display: 'flex',
            flexDirection: 'column',
            lineHeight: 1
        },
        brandName: {
            fontSize: '1.25rem',
            fontWeight: 700,
            color: 'var(--accent-primary)',
            letterSpacing: '-0.02em'
        },
        brandSub: {
            fontSize: '0.75rem',
            fontWeight: 600,
            color: 'var(--text-secondary)',
            textTransform: 'uppercase',
            letterSpacing: '0.1em'
        },
        centerPill: {
            flex: 1,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
        },
        glassContainer: {
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
        },
        navLink: {
            position: 'relative',
            padding: '8px 20px',
            borderRadius: '9999px',
            fontSize: '0.9rem',
            fontWeight: 500,
            textDecoration: 'none',
            transition: 'color 0.2s',
            display: 'block'
        },
        divider: {
            width: '1px',
            height: '16px',
            backgroundColor: '#d1d5db',
            margin: '0 4px'
        },
        mainSubmenu: {
            position: 'absolute',
            top: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            marginTop: '12px',
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(16px)',
            borderRadius: '12px',
            padding: '8px',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            border: '1px solid white',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            minWidth: '180px',
            zIndex: 100
        },
        actionArea: {
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            zIndex: 50
        },
        loginLink: {
            fontSize: '0.9rem',
            fontWeight: 600,
            color: 'var(--text-secondary)',
            textDecoration: 'none',
            padding: '8px 12px',
            cursor: 'pointer',
            background: 'none',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
        },
        joinBtn: {
            background: 'var(--accent-primary)',
            color: 'white',
            fontSize: '0.9rem',
            fontWeight: 700,
            padding: '10px 24px',
            borderRadius: '9999px',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 4px 6px -1px rgba(0, 59, 170, 0.3)',
            transition: 'transform 0.2s',
            textDecoration: 'none'
        },
        mobileToggle: {
            padding: '8px',
            fontSize: '1.5rem',
            color: 'var(--text-primary)',
            background: 'rgba(255,255,255,0.5)',
            backdropFilter: 'blur(8px)',
            borderRadius: '50%',
            border: 'none',
            cursor: 'pointer',
            display: 'none'
        },
        userMenu: {
            position: 'relative',
            cursor: 'pointer'
        },
        userDropdownWrapper: {
            position: 'absolute',
            top: '100%',
            right: 0,
            paddingTop: '10px', // Invisible bridge area
            display: isDropdownOpen ? 'block' : 'none',
            minWidth: '200px',
            zIndex: 100
        },
        userDropdownContent: {
            background: 'white',
            borderRadius: '12px',
            boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
            padding: '8px',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            border: '1px solid rgba(0,0,0,0.05)'
        }
    };

    return (
        <>
            <motion.nav
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                style={styles.nav}
            >
                <div className="container" style={styles.container}>

                    {/* LEFT: Logo Area */}
                    <Link to="/" style={styles.logoArea}>
                        <img
                            src={ROTARY_LOGO_URL}
                            alt="Rotary Logo"
                            style={styles.logoImg}
                        />
                        <div style={styles.logoTextCol}>
                            <span style={styles.brandName}>Caterham</span>
                            <span style={styles.brandSub}>Rotary</span>
                        </div>
                    </Link>

                    {/* CENTER: Floating Nav Pill (Desktop Only) */}
                    <div className="hidden md-flex" style={styles.centerPill}>
                        <motion.div style={styles.glassContainer}>
                            {mainLinks.map((link) => (
                                <div
                                    key={link.id || link.name}
                                    style={{ position: 'relative' }}
                                    onMouseEnter={() => setHoveredTab(link.id || link.name)}
                                    onMouseLeave={() => setHoveredTab(null)}
                                >
                                    <Link
                                        to={link.path}
                                        className="nav-link-item"
                                        style={{
                                            ...styles.navLink,
                                            color: location.pathname === link.path ? 'var(--accent-primary)' : 'var(--text-primary)'
                                        }}
                                    >
                                        {hoveredTab === (link.id || link.name) && (
                                            <motion.div
                                                layoutId="nav-hover"
                                                style={{
                                                    position: 'absolute',
                                                    inset: 0,
                                                    background: 'rgba(0,0,0,0.05)',
                                                    borderRadius: '9999px',
                                                    zIndex: -1,
                                                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                                                }}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                            />
                                        )}
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            {link.label || link.name}
                                            {link.children && link.children.length > 0 && (
                                                <FaChevronDown style={{ fontSize: '0.6em', opacity: 0.5 }} />
                                            )}
                                        </div>
                                    </Link>

                                    {/* Submenu for Main Link */}
                                    <AnimatePresence>
                                        {link.children && link.children.length > 0 && hoveredTab === (link.id || link.name) && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                transition={{ duration: 0.2 }}
                                                style={styles.mainSubmenu}
                                            >
                                                {link.children.map(child => (
                                                    <Link
                                                        key={child.id}
                                                        to={child.path}
                                                        style={{
                                                            padding: '8px 12px',
                                                            borderRadius: '8px',
                                                            color: 'var(--text-primary)',
                                                            textDecoration: 'none',
                                                            fontSize: '0.9rem',
                                                            fontWeight: 500,
                                                            display: 'block',
                                                            transition: 'background 0.2s',
                                                        }}
                                                        className="hover:bg-blue-50"
                                                    >
                                                        {child.name}
                                                    </Link>
                                                ))}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            ))}
                        </motion.div>
                    </div>

                    <div className="hidden md-flex" style={styles.actionArea}>
                        {user ? (
                            <div
                                style={styles.userMenu}
                                onMouseEnter={() => setIsDropdownOpen(true)}
                                onMouseLeave={() => setIsDropdownOpen(false)}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <img
                                        src={user.picture}
                                        alt="Profile"
                                        style={{ width: '32px', height: '32px', borderRadius: '50%', border: '2px solid var(--accent-primary)' }}
                                    />
                                    <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                                        {user.given_name}
                                    </span>
                                </div>

                                {/* User Dropdown */}
                                <div style={styles.userDropdownWrapper}>
                                    <div style={styles.userDropdownContent}>
                                        <Link to="/members" style={styles.loginLink}>Dashboard</Link>
                                        <button onClick={logout} style={{ ...styles.loginLink, color: '#ef4444' }}>Sign Out</button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <Link
                                to="/login"
                                style={styles.loginLink}
                            >
                                Sign In
                            </Link>
                        )}

                        {/* Join Us Button Removed - moved to Nav Links */}
                    </div>

                    {/* Mobile Toggle */}
                    <button
                        className="mobile-toggle"
                        style={styles.mobileToggle}
                        onClick={() => setIsOpen(true)}
                    >
                        <FaBars />
                    </button>
                </div>
            </motion.nav>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{
                            position: 'fixed',
                            inset: 0,
                            height: '100dvh', // Use dynamic viewport height
                            zIndex: 60,
                            background: 'rgba(255, 255, 255, 0.98)',
                            backdropFilter: 'blur(20px)',
                            display: 'flex',
                            flexDirection: 'column'
                        }}
                    >
                        <div style={{ padding: '24px', display: 'flex', justifyContent: 'flex-end', flexShrink: 0 }}>
                            <button
                                onClick={() => setIsOpen(false)}
                                style={{ background: 'none', border: 'none', fontSize: '2rem', color: 'var(--text-primary)', cursor: 'pointer' }}
                            >
                                <FaTimes />
                            </button>
                        </div>

                        <div style={{
                            flex: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'flex-start',
                            gap: '24px',
                            padding: '0 32px 80px 32px',
                            overflowY: 'auto',
                            WebkitOverflowScrolling: 'touch'
                        }}>
                            {/* Primary Actions at the TOP for Mobile */}
                            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', marginBottom: '10px' }}>
                                {user ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <img src={user.picture} style={{ width: '48px', height: '48px', borderRadius: '50%', border: '2px solid var(--accent-primary)' }} />
                                            <div style={{ textAlign: 'center' }}>
                                                <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Welcome back,</p>
                                                <p style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700 }}>{user.given_name || user.name}</p>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', gap: '15px' }}>
                                            <Link to="/members" onClick={() => setIsOpen(false)} style={{ color: 'var(--accent-primary)', fontWeight: 700, padding: '10px 20px', background: 'rgba(0, 91, 170, 0.1)', borderRadius: '12px', textDecoration: 'none' }}>Dashboard</Link>
                                            <button onClick={() => { logout(); setIsOpen(false); }} style={{ background: 'none', border: '1px solid #ef4444', color: '#ef4444', fontWeight: 600, padding: '10px 20px', borderRadius: '12px' }}>Sign Out</button>
                                        </div>
                                    </div>
                                ) : (
                                    <Link to="/login" onClick={() => setIsOpen(false)} style={{ fontSize: '1.25rem', fontWeight: 700, color: 'white', background: 'var(--accent-primary)', width: '100%', textAlign: 'center', padding: '15px', borderRadius: '15px', textDecoration: 'none', boxShadow: '0 10px 20px -5px rgba(0, 91, 170, 0.3)' }}>
                                        Sign In / Members Login
                                    </Link>
                                )}

                                <Link
                                    to="/join-us"
                                    onClick={() => setIsOpen(false)}
                                    style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--accent-secondary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', padding: '10px', background: 'rgba(247, 168, 27, 0.05)', borderRadius: '12px', width: '100%', justifyContent: 'center' }}
                                >
                                    <FaHandshake /> Become a Member
                                </Link>
                            </div>

                            <div style={{ width: '100%', height: '1px', background: 'rgba(0,0,0,0.05)', borderRadius: '4px' }}></div>

                            {/* Standard Nav Links Below */}
                            {navLinks.map((link) => (
                                <React.Fragment key={link.id || link.name}>
                                    <Link
                                        to={link.path}
                                        onClick={() => setIsOpen(false)}
                                        style={{ fontSize: '1.4rem', fontWeight: 600, textDecoration: 'none', color: 'var(--text-primary)' }}
                                    >
                                        {link.label || link.name}
                                    </Link>
                                    {/* Mobile Nested Children */}
                                    {link.children && link.children.map(child => (
                                        <Link
                                            key={child.id}
                                            to={child.path}
                                            onClick={() => setIsOpen(false)}
                                            style={{
                                                fontSize: '1.1rem',
                                                fontWeight: 500,
                                                textDecoration: 'none',
                                                color: 'var(--text-secondary)',
                                                marginTop: '-15px'
                                            }}
                                        >
                                            ↳ {child.name}
                                        </Link>
                                    ))}
                                </React.Fragment>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

// Helper for icons in dropdown
const getJsxIcon = (name) => {
    const n = name?.toLowerCase() || '';
    if (n.includes('business')) return <FaHandshake />;
    if (n.includes('meet')) return <FaMapMarkerAlt />;
    if (n.includes('faq')) return <FaQuestionCircle />;
    return <FaInfoCircle />;
};

export default Navbar;

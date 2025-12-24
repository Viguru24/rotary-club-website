import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaHandshake, FaMapMarkerAlt, FaCalendarAlt, FaNewspaper, FaUsers } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import { getHomeConfig } from '../services/homeService';

const QuickLinks = () => {
    const links = [
        { title: "Club Blog", icon: <FaNewspaper />, path: "/blog", desc: "Latest news & updates" },
        { title: "Business Partners", icon: <FaHandshake />, path: "/business-partners", desc: "Our community partners" },
        { title: "Where We Meet", icon: <FaMapMarkerAlt />, path: "/where-we-meet", desc: "Join our meetings" },
        { title: "Events", icon: <FaCalendarAlt />, path: "/calendar", desc: "Upcoming activities" },
        { title: "Join Us", icon: <FaUsers />, path: "/join-us", desc: "Become a member" }
    ];

    return (
        <section className="container home-cards-container mx-auto" style={{ position: 'relative', zIndex: 10, marginBottom: '80px', marginLeft: 'auto', marginRight: 'auto' }}>
            <div className="home-cards-grid" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '20px',
            }}>
                {links.map((link, index) => (
                    <Link to={link.path} key={index} className="glass-card" style={{
                        padding: '30px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        textAlign: 'center',
                        textDecoration: 'none',
                        color: 'var(--text-primary)',
                        background: 'rgba(255, 255, 255, 0.9)',
                        backdropFilter: 'blur(20px)',
                        borderRadius: '20px',
                        border: '1px solid rgba(255,255,255,0.8)',
                        boxShadow: '0 15px 35px rgba(0,0,0,0.05)',
                        transition: 'transform 0.3s ease, box-shadow 0.3s ease'
                    }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-10px)';
                            e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 91, 170, 0.15)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 15px 35px rgba(0,0,0,0.05)';
                        }}
                    >
                        <div style={{
                            fontSize: '2rem',
                            color: 'var(--accent-primary)',
                            marginBottom: '15px',
                            background: 'rgba(0, 91, 170, 0.05)',
                            padding: '15px',
                            borderRadius: '50%'
                        }}>
                            {link.icon}
                        </div>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '8px' }}>{link.title}</h3>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{link.desc}</p>
                    </Link>
                ))}
            </div>
        </section>
    );
};

const Hero = () => {
    const navigate = useNavigate();
    const [config, setConfig] = useState(getHomeConfig());
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    useEffect(() => {
        const handleConfigUpdate = () => setConfig(getHomeConfig());
        window.addEventListener('home-config-updated', handleConfigUpdate);

        // Carousel Timer
        if (config.heroImages && config.heroImages.length > 1) {
            const interval = setInterval(() => {
                setCurrentImageIndex(prev => (prev + 1) % config.heroImages.length);
            }, 5000);
            return () => {
                clearInterval(interval);
                window.removeEventListener('home-config-updated', handleConfigUpdate);
            };
        }
        return () => window.removeEventListener('home-config-updated', handleConfigUpdate);
    }, [config.heroImages]);

    return (
        <section className="hero-section" style={{
            minHeight: '90vh',
            display: 'flex',
            alignItems: 'center',
            position: 'relative',
            overflow: 'hidden',
            paddingTop: 'calc(var(--nav-height) + 40px)'
        }}>
            {/* BACKGROUND: Image Carousel or Default Ambience */}
            {config.heroImages && config.heroImages.length > 0 ? (
                <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
                    <AnimatePresence mode='wait'>
                        <motion.div
                            key={currentImageIndex}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 1 }}
                            style={{
                                position: 'absolute', inset: 0,
                                backgroundImage: `url(${config.heroImages[currentImageIndex]})`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                            }}
                        />
                    </AnimatePresence>
                    {/* Overlay for readability */}
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(255,255,255,0.95), rgba(255,255,255,0.7) 50%, rgba(255,255,255,0.2))' }}></div>
                </div>
            ) : (
                <>
                    {/* Background Ambience - Light Mode (Default) */}
                    <div style={{
                        position: 'absolute', top: '-10%', right: '-10%',
                        width: '600px', height: '600px',
                        background: 'linear-gradient(135deg, #e0f2ff 0%, #fff8e1 100%)',
                        borderRadius: '50%',
                        filter: 'blur(80px)',
                        zIndex: 0
                    }} />
                    <div style={{
                        position: 'absolute', bottom: '10%', left: '5%',
                        width: '300px', height: '300px',
                        background: 'rgba(247, 168, 27, 0.1)',
                        borderRadius: '50%',
                        filter: 'blur(100px)',
                        zIndex: 0
                    }} />
                </>
            )}

            <div className="container hero-container mx-auto" style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: '50px', marginLeft: 'auto', marginRight: 'auto' }}>
                <div className="hero-content" style={{ flex: 1 }}>
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <span style={{
                            display: 'inline-block',
                            padding: '8px 16px',
                            background: 'rgba(0, 91, 170, 0.1)',
                            color: 'var(--accent-primary)',
                            borderRadius: '30px',
                            fontWeight: 600,
                            marginBottom: '20px',
                            fontSize: '0.9rem'
                        }}>
                            Service Above Self
                        </span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        style={{
                            fontSize: 'clamp(2.5rem, 5vw, 4.5rem)', // Adjusted min size for mobile
                            lineHeight: 1.1,
                            fontWeight: 800,
                            marginBottom: '20px',
                            color: 'var(--text-primary)',
                            wordWrap: 'break-word', // Ensure long words don't overflow
                        }}
                        dangerouslySetInnerHTML={{ __html: config.heroTitle }}
                    />

                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        style={{
                            fontSize: '1.2rem',
                            color: 'var(--text-secondary)',
                            marginBottom: '40px',
                            maxWidth: '550px'
                        }}
                        dangerouslySetInnerHTML={{ __html: config.heroSubtitle }}
                    />

                    {/* CTA Buttons Removed - Now in QuickLinks Bar */}
                </div>

                {/* Floating/Abstract Visual Representation */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1 }}
                    style={{ flex: 1, display: 'flex', justifyContent: 'center', position: 'relative' }}
                    className="hidden md-flex"
                >
                    <motion.div
                        animate={{ y: [0, -30, 0] }}
                        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                        className="glass-card"
                        style={{
                            width: '400px', height: '500px',
                            position: 'relative',
                            zIndex: 2,
                            background: 'rgba(255,255,255,0.4)',
                            border: '1px solid rgba(255,255,255,0.9)',
                            display: 'flex', flexDirection: 'column', padding: '40px',
                            cursor: 'pointer'
                        }}
                        onClick={() => navigate('/join-us')}
                    >
                        <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'var(--accent-secondary)', marginBottom: '30px' }} />
                        <h3 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '10px' }}>Join Us</h3>
                        <p style={{ color: 'var(--text-secondary)' }}>Become part of a global network of 1.4 million neighbours, friends, leaders, and problem-solvers.</p>

                        <div style={{ marginTop: 'auto' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '20px' }}>
                                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#eee' }} />
                                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#ddd', marginLeft: '-15px' }} />
                                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#ccc', marginLeft: '-15px' }} />
                                <span style={{ marginLeft: '10px', fontWeight: 600 }}>{config.statsText || '50+ Active Members'}</span>
                            </div>
                        </div>
                    </motion.div>

                    {/* Decorative Orbitals */}
                    <div style={{ position: 'absolute', width: '600px', height: '600px', border: '1px solid rgba(0, 91, 170, 0.1)', borderRadius: '50%', zIndex: 0 }} />
                    <div style={{ position: 'absolute', width: '450px', height: '450px', border: '1px solid rgba(247, 168, 27, 0.2)', borderRadius: '50%', zIndex: 0 }} />
                </motion.div>
            </div>
        </section>
    );
};

const NewsCard = ({ title, category, content, date }) => (
    <motion.div
        whileHover={{ y: -10 }}
        className="glass-card"
        style={{ padding: '30px', display: 'flex', flexDirection: 'column', height: '100%' }}
    >
        <span style={{
            fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-secondary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px'
        }}>
            {category}
        </span>
        <h3 style={{ fontSize: '1.5rem', marginBottom: '15px', lineHeight: 1.3 }}>{title}</h3>
        <p style={{ color: 'var(--text-secondary)', flex: 1, marginBottom: '20px' }}>
            {content}
        </p>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(0,0,0,0.05)', paddingTop: '20px' }}>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{date}</span>
            <a href="#" style={{ fontWeight: 600, color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                Read Story <span>→</span>
            </a>
        </div>
    </motion.div>
)

import SEO from '../components/SEO';

const Home = () => {
    const config = getHomeConfig();
    const enabledEvents = config.featuredEventPages?.filter(event => event.enabled) || [];

    // Strategy 1: LocalBusiness/NGO Schema
    const localBusinessSchema = {
        "@context": "https://schema.org",
        "@type": "NGO",
        "name": "Rotary Club of Caterham",
        "url": "https://caterham-rotary-lz5e6kxamq-nw.a.run.app",
        "logo": "https://www.rotary.org/sites/all/themes/rotary_rotaryorg/images/rotary-logo-color-2019-simplified.svg",
        "sameAs": [
            "https://www.facebook.com/CaterhamRotary",
            "https://twitter.com/CaterhamRotary"
        ],
        "address": {
            "@type": "PostalAddress",
            "addressLocality": "Caterham",
            "addressRegion": "Surrey",
            "addressCountry": "UK"
        },
        "description": "Caterham Rotary International is a nonprofit organisation dedicated to serving our community through friendship and action."
    };

    return (
        <div>
            <SEO
                title="Home"
                schema={localBusinessSchema}
                description="Join Caterham Rotary Club. We are neighbors, community leaders, and global citizens uniting for the common good in Caterham, Surrey."
            />
            <Hero />
            <QuickLinks />

            {enabledEvents.length > 0 && (
                <section id="featured-events" className="section-padding container mx-auto" style={{ marginLeft: 'auto', marginRight: 'auto' }}>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        style={{ marginBottom: '60px', textAlign: 'center' }}
                    >
                        <span style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>Our Events</span>
                        <h2 style={{ fontSize: '3rem', marginTop: '10px' }}>Get Involved</h2>
                    </motion.div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px' }}>
                        {enabledEvents.map((event) => (
                            <Link
                                key={event.id}
                                to={event.path}
                                style={{ textDecoration: 'none' }}
                            >
                                <motion.div
                                    whileHover={{ y: -10 }}
                                    className="glass-card"
                                    style={{
                                        padding: '40px 30px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        textAlign: 'center',
                                        height: '100%',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s ease'
                                    }}
                                >
                                    <div style={{
                                        fontSize: '4rem',
                                        marginBottom: '20px',
                                        filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))'
                                    }}>
                                        {event.icon}
                                    </div>
                                    <h3 style={{
                                        fontSize: '1.5rem',
                                        fontWeight: 700,
                                        marginBottom: '15px',
                                        color: 'var(--text-primary)'
                                    }}>
                                        {event.title}
                                    </h3>
                                    <p style={{
                                        color: 'var(--text-secondary)',
                                        lineHeight: 1.6,
                                        fontSize: '1rem'
                                    }}>
                                        {event.description}
                                    </p>
                                </motion.div>
                            </Link>
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
};

export default Home;

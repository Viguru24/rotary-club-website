import React from 'react';
import { motion } from 'framer-motion';
import { FaCalendarAlt, FaMapMarkerAlt, FaClock } from 'react-icons/fa';
import SEO from '../components/SEO';

const WhereWeMeet = () => {
    return (
        <>
            <SEO
                title="Where We Meet - Surrey National Golf Club"
                description="Join Caterham Rotary at our weekly meetings. Thursday lunchtimes at Surrey National Golf Club, or select Saturday mornings at The Harrow, Chaldon."
                canonical="/where-we-meet"
            />
            <div className="container section-padding">
                <div style={{ textAlign: 'center', marginBottom: '60px' }}>
                    <motion.h1
                        className="text-gradient"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{ fontSize: '3.5rem', marginBottom: '20px' }}
                    >
                        Where We Meet
                    </motion.h1>
                </div>

                <motion.div
                    className="glass-panel"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    style={{
                        overflow: 'hidden',
                        borderRadius: '24px',
                        padding: '0',
                        background: 'white',
                        maxWidth: '1000px',
                        margin: '0 auto'
                    }}
                >
                    {/* Hero Image */}
                    <div style={{ position: 'relative', height: '400px', width: '100%' }}>
                        <img
                            src="https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=1440,h=377,fit=crop/A85wDMJxW0U0RxO0/surrey-golf-m7VK8JZDWGTlp9xx.jpg"
                            alt="Surrey National Golf Club"
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                        <div style={{
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)',
                            padding: '40px',
                            color: 'white'
                        }}>
                            <h2 style={{ fontSize: '2rem', marginBottom: '10px' }}>Surrey National Golf Club</h2>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><FaMapMarkerAlt /> Caterham, Surrey</span>
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div style={{ padding: '60px' }}>
                        <div style={{ marginBottom: '50px' }}>
                            <h3 style={{ fontSize: '1.8rem', color: 'var(--accent-primary)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                                <FaCalendarAlt /> Weekly Meetings
                            </h3>
                            <p style={{ fontSize: '1.1rem', lineHeight: '1.8', color: 'var(--text-secondary)', marginBottom: '20px' }}>
                                Welcome to our club! We meet weekly at <strong>12.30pm on a Thursday lunchtime</strong> at The Surrey National Golf Club.
                            </p>
                            <p style={{ fontSize: '1.1rem', lineHeight: '1.8', color: 'var(--text-secondary)', marginBottom: '20px' }}>
                                In addition to a two course lunch, the meetings include interesting talks from a wide range of speakers from local organisations and national companies. Once a month we hold a business session to discuss our activities and local projects, as well as giving us the opportunity to forge meaningful connections with fellow members.
                            </p>
                        </div>

                        <div style={{
                            background: '#f0f9ff',
                            padding: '40px',
                            borderRadius: '16px',
                            borderLeft: '5px solid var(--accent-primary)'
                        }}>
                            <h3 style={{ fontSize: '1.5rem', color: '#0369a1', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                                <FaClock /> Alternative Meeting Time
                            </h3>
                            <p style={{ fontSize: '1.05rem', lineHeight: '1.7', color: '#334155' }}>
                                We understand that not everyone can attend our Thursday lunchtime meetings. So, we have recently introduced an alternative group meeting on the <strong>first and third Saturday of every month!</strong>
                            </p>
                            <p style={{ fontSize: '1.05rem', lineHeight: '1.7', color: '#334155', marginTop: '15px' }}>
                                You are welcome at <strong>The Harrow in Chaldon</strong> from <strong>10:15 AM to 11:30 AM</strong>. Mark your calendars for the first and third Saturday of each month.
                            </p>
                        </div>

                        <div style={{ marginTop: '50px', textAlign: 'center' }}>
                            <a href="https://surreynational.co.uk/" target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ padding: '12px 30px', fontSize: '1.1rem' }}>
                                Visit Surrey National Website
                            </a>
                        </div>
                    </div>
                </motion.div>
            </div>
        </>
    );
};

export default WhereWeMeet;

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getEvents } from '../services/eventService';
import { FaChevronLeft, FaChevronRight, FaMapMarkerAlt, FaClock, FaCalendarDay, FaTimes, FaExternalLinkAlt } from 'react-icons/fa';
import SEO from '../components/SEO';

const Calendar = () => {
    const [events, setEvents] = useState([]);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedEvent, setSelectedEvent] = useState(null);

    useEffect(() => {
        const fetchEvents = async () => {
            const data = await getEvents();
            setEvents(data);
        };
        fetchEvents();
    }, []);

    // Calendar Logic
    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
    // Adjust for Monday start: Sunday (0) becomes 6, Monday (1) becomes 0, etc.
    const startDayOffset = (firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1);

    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    const changeMonth = (offset) => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1));
    };

    const getEventsForDay = (day) => {
        return events.filter(e => {
            if (!e.date) return false;
            // Parse YYYY-MM-DD manually to prevent timezone shifts
            const [y, m, d] = e.date.split('-').map(num => parseInt(num, 10));
            // Note: m is 1-based from split, but month in Date is 0-based.
            // However, we compare with currentDate components.
            return d === day && (m - 1) === currentDate.getMonth() && y === currentDate.getFullYear();
        });
    };

    const getCategoryColor = (cat) => {
        switch (cat) {
            case 'Meeting': return '#005baa'; // Rotary Blue
            case 'Fundraiser': return '#f7a81b'; // Rotary Gold
            case 'Social': return '#e91e63'; // Pink
            default: return '#9c27b0';
        }
    };

    return (
        <>
            <SEO
                title="Calendar of Events - Caterham Rotary"
                description="View upcoming Rotary events, fundraisers, and meetings in Caterham. Join us to support the community."
                canonical="/events"
            />
            <div className="container section-padding" style={{ paddingTop: 'calc(var(--nav-height) + 40px)' }}>
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <h1 className="text-gradient" style={{ fontSize: '3rem' }}>Club Calendar</h1>
                </motion.div>

                {/* Main Layout Grid */}
                <div style={{
                    display: 'flex',
                    gap: '40px',
                    alignItems: 'start',
                    flexWrap: 'wrap'
                }}>
                    {/* Left Column: Calendar */}
                    <div style={{ flex: '1 1 600px', minWidth: '0' }}> {/* minWidth 0 prevents flex child from overflowing */}
                        <div className="glass-panel" style={{ padding: '30px', borderRadius: '25px', background: 'rgba(255,255,255,0.7)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', padding: '0 10px' }}>
                                <button onClick={() => changeMonth(-1)} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: 'var(--text-primary)', padding: '10px', borderRadius: '50%', background: 'rgba(0,0,0,0.05)' }}><FaChevronLeft /></button>
                                <h2 style={{ fontSize: '1.8rem', margin: 0, textAlign: 'center', fontWeight: 700 }}>
                                    {monthNames[currentDate.getMonth()]} <span style={{ color: 'var(--accent-primary)' }}>{currentDate.getFullYear()}</span>
                                </h2>
                                <button onClick={() => changeMonth(1)} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: 'var(--text-primary)', padding: '10px', borderRadius: '50%', background: 'rgba(0,0,0,0.05)' }}><FaChevronRight /></button>
                            </div>

                            {/* Days Header */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', textAlign: 'center', fontWeight: 'bold', marginBottom: '15px', color: 'var(--text-muted)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => <div key={d} style={{ padding: '10px' }}>{d}</div>)}
                            </div>

                            {/* Days Grid */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '12px' }}>
                                {Array.from({ length: startDayOffset }).map((_, i) => <div key={`empty-${i}`} />)}

                                {Array.from({ length: daysInMonth }).map((_, i) => {
                                    const day = i + 1;
                                    const dayEvents = getEventsForDay(day);
                                    const isToday = new Date().toDateString() === new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString();

                                    return (
                                        <div key={day} style={{
                                            minHeight: '110px',
                                            background: isToday ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.5)',
                                            borderRadius: '16px',
                                            padding: '12px',
                                            border: isToday ? '2px solid var(--accent-primary)' : '1px solid rgba(255,255,255,0.6)',
                                            boxShadow: isToday ? '0 8px 20px rgba(0, 91, 170, 0.15)' : 'none',
                                            position: 'relative',
                                            display: 'flex', flexDirection: 'column', gap: '6px',
                                            transition: 'transform 0.2s',
                                        }}>
                                            <div style={{ fontWeight: 'bold', marginBottom: '4px', opacity: isToday ? 1 : 0.6, fontSize: '0.95rem', color: isToday ? 'var(--accent-primary)' : 'var(--text-primary)' }}>{day}</div>

                                            {dayEvents.map(ev => (
                                                <motion.div
                                                    key={ev.id}
                                                    layoutId={`event-pill-${ev.id}`}
                                                    onClick={() => setSelectedEvent(ev)}
                                                    whileHover={{ scale: 1.02, x: 2 }}
                                                    style={{
                                                        background: getCategoryColor(ev.category),
                                                        color: 'white',
                                                        fontSize: '0.7rem',
                                                        padding: '4px 8px',
                                                        borderRadius: '6px',
                                                        cursor: 'pointer',
                                                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                                        fontWeight: 600,
                                                        whiteSpace: 'nowrap',
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis'
                                                    }}
                                                >
                                                    {ev.time} {ev.title}
                                                </motion.div>
                                            ))}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Sidebar Widget */}
                    <div style={{ minWidth: '350px' }}>
                        <div className="glass-panel" style={{ padding: '25px', borderRadius: '25px', background: 'white' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                                <h3 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0 }}>Upcoming Events</h3>
                                <button style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem' }}>View All</button>
                            </div>

                            {events
                                .filter(e => new Date(e.date) >= new Date().setHours(0, 0, 0, 0))
                                .sort((a, b) => new Date(a.date) - new Date(b.date))
                                .slice(0, 3)
                                .map((ev, index) => {
                                    // Manual Parse
                                    const [y, m, d] = ev.date.split('-').map(num => parseInt(num, 10));
                                    const dateObj = new Date(y, m - 1, d);

                                    const month = dateObj.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
                                    const day = d;

                                    if (index === 0) {
                                        // Featured Card
                                        return (
                                            <motion.div
                                                key={ev.id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="featured-event-card"
                                                style={{
                                                    background: 'white',
                                                    borderRadius: '20px',
                                                    boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
                                                    border: '1px solid rgba(0,0,0,0.04)',
                                                    overflow: 'hidden',
                                                    marginBottom: '30px',
                                                    paddingBottom: '20px'
                                                }}
                                            >
                                                <div style={{ height: '180px', background: `linear-gradient(135deg, ${getCategoryColor(ev.category)}, var(--accent-primary))`, position: 'relative' }}>
                                                    {ev.image && <img src={ev.image} alt={ev.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                                                    <div style={{
                                                        position: 'absolute', top: '15px', left: '15px',
                                                        background: 'rgba(255,255,255,0.95)', padding: '6px 12px', borderRadius: '8px',
                                                        fontWeight: 800, fontSize: '0.8rem', color: 'var(--accent-primary)',
                                                        boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                                                    }}>
                                                        {month} {day}
                                                    </div>
                                                </div>
                                                <div style={{ padding: '20px' }}>
                                                    <h4 style={{ fontSize: '1.2rem', marginBottom: '10px', fontWeight: 700 }}>{ev.title}</h4>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '6px' }}>
                                                        <FaClock style={{ color: 'var(--text-muted)' }} /> {ev.time}
                                                    </div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '20px' }}>
                                                        <FaMapMarkerAlt style={{ color: 'var(--text-muted)' }} /> {ev.location}
                                                    </div>
                                                    <button
                                                        onClick={() => setSelectedEvent(ev)}
                                                        style={{
                                                            width: '100%',
                                                            padding: '12px',
                                                            borderRadius: '12px',
                                                            border: 'none',
                                                            background: 'var(--accent-primary)',
                                                            color: 'white',
                                                            fontWeight: 700,
                                                            fontSize: '0.95rem',
                                                            cursor: 'pointer',
                                                            boxShadow: '0 4px 15px rgba(0, 91, 170, 0.3)',
                                                            transition: 'transform 0.2s'
                                                        }}
                                                        onMouseEnter={e => e.target.style.transform = 'translateY(-2px)'}
                                                        onMouseLeave={e => e.target.style.transform = 'translateY(0)'}
                                                    >
                                                        Register Now
                                                    </button>
                                                </div>
                                            </motion.div>
                                        );
                                    } else {
                                        // List Item
                                        return (
                                            <motion.div
                                                key={ev.id}
                                                initial={{ opacity: 0, x: 10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: index * 0.1 }}
                                                onClick={() => setSelectedEvent(ev)}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '15px',
                                                    padding: '15px',
                                                    background: 'white',
                                                    borderRadius: '16px',
                                                    marginBottom: '10px',
                                                    border: '1px solid rgba(0,0,0,0.03)',
                                                    cursor: 'pointer',
                                                    transition: 'background 0.2s'
                                                }}
                                                className="hover:bg-blue-50"
                                            >
                                                <div style={{
                                                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                                    minWidth: '50px', height: '50px',
                                                    background: 'rgba(0, 91, 170, 0.06)', borderRadius: '12px',
                                                    color: 'var(--accent-primary)', fontWeight: 800, lineHeight: 1.1
                                                }}>
                                                    <span style={{ fontSize: '0.7rem' }}>{month}</span>
                                                    <span style={{ fontSize: '1.2rem' }}>{day}</span>
                                                </div>
                                                <div>
                                                    <h5 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>{ev.title}</h5>
                                                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{ev.time} • {ev.category}</span>
                                                </div>
                                            </motion.div>
                                        );
                                    }
                                })}

                            {events.length === 0 && (
                                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                                    No upcoming events found.
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Detailed Event Modal */}
                <AnimatePresence>
                    {selectedEvent && (
                        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
                            {/* Backdrop */}
                            <motion.div
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                onClick={() => setSelectedEvent(null)}
                                style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)' }}
                            />

                            {/* Modal Card */}
                            <motion.div
                                layoutId={`event-pill-${selectedEvent.id}`}
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                                className="glass-card"
                                style={{ width: '100%', maxWidth: '550px', background: 'var(--bg-secondary)', position: 'relative', overflow: 'hidden', padding: 0 }}
                            >
                                <div style={{ height: '200px', background: `linear-gradient(135deg, ${getCategoryColor(selectedEvent.category)}, var(--accent-primary))`, padding: '0', position: 'relative', overflow: 'hidden' }}>
                                    {selectedEvent.image ? (
                                        <img src={selectedEvent.image} alt={selectedEvent.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <div style={{ width: '100%', height: '100%', background: `linear-gradient(135deg, ${getCategoryColor(selectedEvent.category)}, var(--accent-primary))` }} />
                                    )}

                                    <div style={{ position: 'absolute', top: 20, left: 20 }}>
                                        <span style={{
                                            background: 'white', color: getCategoryColor(selectedEvent.category),
                                            padding: '6px 16px', borderRadius: '20px', fontWeight: 'bold', fontSize: '0.85rem',
                                            boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
                                        }}>
                                            {selectedEvent.category}
                                        </span>
                                    </div>
                                    <button onClick={() => setSelectedEvent(null)} style={{
                                        position: 'absolute', top: '20px', right: '20px',
                                        background: 'rgba(0,0,0,0.4)', border: 'none', color: 'white',
                                        borderRadius: '50%', width: '36px', height: '36px',
                                        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '1.2rem', backdropFilter: 'blur(4px)'
                                    }}>
                                        <FaTimes />
                                    </button>
                                </div>

                                <div style={{ padding: '35px' }}>
                                    <h2 style={{ fontSize: '2.2rem', marginBottom: '25px', lineHeight: 1.2, color: 'var(--text-primary)' }}>{selectedEvent.title}</h2>

                                    <div style={{ display: 'grid', gridTemplateColumns: 'min-content 1fr', gap: '20px', marginBottom: '30px' }}>
                                        <FaCalendarDay size={22} style={{ color: 'var(--accent-primary)', marginTop: '3px' }} />
                                        <div>
                                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Date</div>
                                            <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>{new Date(selectedEvent.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
                                        </div>

                                        <FaClock size={22} style={{ color: 'var(--accent-primary)', marginTop: '3px' }} />
                                        <div>
                                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Time</div>
                                            <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>{selectedEvent.time}</div>
                                        </div>

                                        <FaMapMarkerAlt size={22} style={{ color: 'var(--accent-primary)', marginTop: '3px' }} />
                                        <div>
                                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Location</div>
                                            <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>{selectedEvent.location}</div>
                                        </div>
                                    </div>

                                    <div style={{ background: 'rgba(0,0,0,0.03)', padding: '20px', borderRadius: '12px' }}>
                                        <h4 style={{ margin: '0 0 10px 0', fontSize: '1rem' }}>Description</h4>
                                        <p style={{ lineHeight: 1.6, color: 'var(--text-secondary)', fontSize: '1.05rem', margin: 0 }}>
                                            {selectedEvent.description}
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </>
    );
};

export default Calendar;

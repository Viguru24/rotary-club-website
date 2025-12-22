import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getBlogPosts } from '../services/blogService';
import { getEvents } from '../services/eventService';
import { getMembers } from '../services/memberService';
import { FaUsers, FaCalendarAlt, FaNewspaper, FaWallet, FaArrowRight, FaChartPie } from 'react-icons/fa';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';

const AdminDashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        members: 0,
        events: 0,
        balance: 0
    });
    const [latestPost, setLatestPost] = useState(null);
    const [upcomingEvents, setUpcomingEvents] = useState([]);
    const [newMembers, setNewMembers] = useState([]);
    const [financeData, setFinanceData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadDashboard = async () => {
            try {
                // Fetch all data in parallel
                const [posts, events, members, incRes, expRes] = await Promise.all([
                    getBlogPosts('published'),
                    getEvents(),
                    getMembers(),
                    fetch('/api/income').then(r => r.json()),
                    fetch('/api/expenses').then(r => r.json())
                ]);

                // 1. Process Blog (Latest Post)
                // API likely returns newest first, but ensure
                const safePosts = Array.isArray(posts) ? posts : [];
                setLatestPost(safePosts[0] || null);

                // 2. Process Events (Next 2 Upcoming)
                const now = new Date();
                const safeEvents = Array.isArray(events) ? events : [];
                const futureEvents = safeEvents
                    .filter(e => new Date(e.date) >= now)
                    .sort((a, b) => new Date(a.date) - new Date(b.date));
                setUpcomingEvents(futureEvents.slice(0, 2));

                // 3. Process Members (Newest 2 - assuming appended array or existing order)
                // If native API doesn't sort, we'll just take the last 2 for "newest" simulation if no date
                const safeMembers = Array.isArray(members) ? members : [];
                // Reverse to get "latest" if array is chronological
                setNewMembers([...safeMembers].reverse().slice(0, 3));

                // 4. Process Finance
                const incomeData = incRes.data || [];
                const expenseData = expRes.data || [];
                const totalIncome = incomeData.reduce((acc, curr) => acc + (parseFloat(curr.amount) || 0), 0);
                const totalExpenses = expenseData.reduce((acc, curr) => acc + (parseFloat(curr.amount) || 0), 0);
                const balance = totalIncome - totalExpenses;

                setStats({
                    members: safeMembers.length,
                    events: futureEvents.length,
                    balance: balance
                });

                setFinanceData([
                    { name: 'Income', amount: totalIncome, color: '#10b981' }, // Green-500
                    { name: 'Expenses', amount: totalExpenses, color: '#ef4444' } // Red-500
                ]);

            } catch (err) {
                console.error("Dashboard load failed", err);
            } finally {
                setLoading(false);
            }
        };

        loadDashboard();
    }, []);

    // Custom Tooltip for Chart
    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            return (
                <div style={{ background: 'rgba(255, 255, 255, 0.95)', padding: '10px 15px', borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                    <p style={{ fontWeight: 600, color: payload[0].payload.color }}>{payload[0].name}</p>
                    <p style={{ margin: 0 }}>£{payload[0].value.toLocaleString()}</p>
                </div>
            );
        }
        return null;
    };

    if (loading) {
        return (
            <div style={{ padding: '40px', display: 'flex', justifyContent: 'center' }}>
                <div style={{ width: '40px', height: '40px', border: '3px solid #f3f3f3', borderTop: '3px solid #005baa', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', color: '#1f2937' }}>

            {/* Header / Welcome */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ marginBottom: '30px' }}
            >
                <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#111827', marginBottom: '5px' }}>
                    Welcome back, {user?.given_name || 'Rotarian'}!
                </h1>
                <p style={{ color: '#6b7280', fontSize: '1.1rem' }}>Here's what's happening in your club today.</p>
            </motion.div>

            {/* Quick Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '40px' }}>
                <StatsCard
                    title="Active Members"
                    value={stats.members}
                    icon={<FaUsers />}
                    color="bg-blue-100 text-blue-700"
                    link="/admin/members"
                />
                <StatsCard
                    title="Upcoming Events"
                    value={stats.events}
                    icon={<FaCalendarAlt />}
                    color="bg-amber-100 text-amber-700"
                    link="/admin/events"
                />
                <StatsCard
                    title="Club Balance"
                    value={`£${stats.balance.toLocaleString()}`}
                    icon={<FaWallet />}
                    color="bg-emerald-100 text-emerald-700"
                    link="/admin/finance"
                />
            </div>

            {/* Main Content Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '30px' }}>

                {/* 1. Latest Blog Post */}
                <DashboardCard title="Latest News" icon={<FaNewspaper />} link="/admin/blog">
                    {latestPost ? (
                        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                            {latestPost.image && (
                                <div style={{ height: '160px', borderRadius: '12px', marginBottom: '15px', overflow: 'hidden', backgroundImage: `url(${latestPost.image})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                            )}
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '10px', lineHeight: 1.3 }}>{latestPost.title}</h3>
                            <p style={{ color: '#6b7280', fontSize: '0.9rem', flex: 1, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>
                                {latestPost.content || latestPost.excerpt}
                            </p>
                            <Link to="/admin/blog" style={{ marginTop: '15px', color: 'var(--accent-primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '5px', textDecoration: 'none' }}>
                                Read More <FaArrowRight size={12} />
                            </Link>
                        </div>
                    ) : (
                        <p style={{ color: '#9ca3af', fontStyle: 'italic' }}>No published posts yet.</p>
                    )}
                </DashboardCard>

                {/* 2. Upcoming Events */}
                <DashboardCard title="Coming Up Next" icon={<FaCalendarAlt />} link="/admin/events">
                    {upcomingEvents.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            {upcomingEvents.map(ev => (
                                <div key={ev.id} style={{ display: 'flex', gap: '15px', padding: '10px', borderRadius: '12px', background: '#f9fafb', border: '1px solid #f3f4f6' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '50px', height: '50px', background: 'white', borderRadius: '10px', border: '1px solid #e5e7eb', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', flexShrink: 0 }}>
                                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#ef4444', textTransform: 'uppercase' }}>{new Date(ev.date).toLocaleString('default', { month: 'short' })}</span>
                                        <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1f2937' }}>{new Date(ev.date).getDate()}</span>
                                    </div>
                                    <div>
                                        <h4 style={{ margin: '0 0 4px 0', fontSize: '1rem', fontWeight: 600, color: '#1f2937' }}>{ev.title}</h4>
                                        <p style={{ margin: 0, fontSize: '0.85rem', color: '#6b7280' }}>{ev.time} • {ev.location}</p>
                                    </div>
                                </div>
                            ))}
                            <Link to="/admin/events" style={{ textAlign: 'center', display: 'block', marginTop: '5px', fontSize: '0.9rem', color: '#6b7280' }}>
                                View Calendar
                            </Link>
                        </div>
                    ) : (
                        <p style={{ color: '#9ca3af', fontStyle: 'italic' }}>No upcoming events.</p>
                    )}
                </DashboardCard>

                {/* 3. Newest Members */}
                <DashboardCard title="Newest Members" icon={<FaUsers />} link="/admin/members">
                    {newMembers.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            {newMembers.map(member => (
                                <div key={member.id} style={{ display: 'flex', alignItems: 'center', gap: '15px', paddingBottom: '15px', borderBottom: '1px solid #f3f4f6' }}>
                                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, #e0f2ff 0%, #bae6fd 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#005baa', fontWeight: 700 }}>
                                        {member.firstName?.[0]}{member.lastName?.[0]}
                                    </div>
                                    <div>
                                        <h4 style={{ margin: '0 0 2px 0', fontSize: '0.95rem', fontWeight: 600 }}>{member.firstName} {member.lastName}</h4>
                                        <p style={{ margin: 0, fontSize: '0.8rem', color: '#6b7280' }}>{member.role || 'Member'}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p style={{ color: '#9ca3af', fontStyle: 'italic' }}>No recent members.</p>
                    )}
                </DashboardCard>

                {/* 4. Financial Snapshot */}
                <DashboardCard title="Financial Overview" icon={<FaChartPie />} link="/admin/finance">
                    <div style={{ width: '100%', height: '200px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={financeData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                <YAxis hide />
                                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
                                <Bar dataKey="amount" radius={[8, 8, 0, 0]} barSize={50}>
                                    {financeData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </DashboardCard>
            </div>
        </div>
    );
};

// Sub-components
const StatsCard = ({ title, value, icon, color, link }) => (
    <Link to={link} className="glass-card" style={{ padding: '25px', display: 'flex', alignItems: 'center', gap: '20px', textDecoration: 'none', color: 'inherit', transition: 'transform 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
        <div style={{ width: '50px', height: '50px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }} className={color}>
            {icon}
        </div>
        <div>
            <p style={{ margin: 0, fontSize: '0.9rem', color: '#6b7280', fontWeight: 600 }}>{title}</p>
            <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>{value}</h3>
        </div>
    </Link>
);

const DashboardCard = ({ title, icon, children, link }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="glass-card"
        style={{ padding: '30px', display: 'flex', flexDirection: 'column', height: '100%' }}
    >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ color: 'var(--accent-primary)' }}>{icon}</span> {title}
            </h3>
            {link && (
                <Link to={link} style={{ color: '#9ca3af', transition: 'color 0.2s' }} className="hover:text-blue-600">
                    <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>open_in_new</span>
                </Link>
            )}
        </div>
        <div style={{ flex: 1 }}>
            {children}
        </div>
    </motion.div>
);

export default AdminDashboard;

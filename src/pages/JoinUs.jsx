import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaHandshake, FaGlobe, FaHeart, FaUsers, FaPaperPlane, FaCheckCircle } from 'react-icons/fa';
import SEO from '../components/SEO';
import { useUI } from '../context/UIContext';

const JoinUs = () => {
    return (
        <>
            <SEO
                title="Join Us - Volunteering Opportunities"
                description="Become a member of Caterham Rotary. Make a difference in your community, build lifelong friendships, and develop professional skills."
                canonical="/join-us"
                type="website"
            />
            <JoinUsContent />
        </>
    );
};

const JoinUsContent = () => {
    const { showToast } = useUI();
    const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' });

    const handleSubmit = (e) => {
        e.preventDefault();
        // Simulate API call
        setTimeout(() => {
            showToast("Thanks for reaching out! We'll be in touch shortly.", 'success');
            setFormData({ name: '', email: '', phone: '', message: '' });
        }, 1000);
    };

    const containerStyle = { maxWidth: '1200px', margin: '0 auto', padding: '0 20px' };
    const sectionStyle = { padding: '80px 0' };

    const benefits = [
        { icon: <FaHeart size={30} />, title: "Community Impact", desc: "Make a tangible difference in Caterham through local projects and charity initiatives." },
        { icon: <FaGlobe size={30} />, title: "Global Reach", desc: "Be part of a network of 1.2 million neighbors, friends, and leaders volunteering worldwide." },
        { icon: <FaUsers size={30} />, title: "Lifelong Friendships", desc: "Connect with like-minded individuals who share your passion for service and fellowship." },
        { icon: <FaHandshake size={30} />, title: "Professional Growth", desc: "Develop leadership skills, public speaking, and project management experience." },
    ];

    return (
        <div style={{ background: '#f9fafb', minHeight: '100vh', paddingBottom: '80px' }}>

            {/* HERO SECTION */}
            <div style={{
                background: 'linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(/rotary-hero.png)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                color: 'white',
                padding: '120px 0',
                textAlign: 'center'
            }}>
                <motion.div
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}
                    style={containerStyle}
                >
                    <h1 style={{ fontSize: '3.5rem', fontWeight: 800, marginBottom: '20px' }}>Join the Movement</h1>
                    <p style={{ fontSize: '1.25rem', maxWidth: '800px', margin: '0 auto', opacity: 0.9, lineHeight: 1.6 }}>
                        Are you looking for ways to make a difference in your community?
                        Or even help people in other parts of the world? Let's do it together.
                    </p>
                </motion.div>
            </div>

            {/* WELCOME / INTRO */}
            <div style={sectionStyle}>
                <div style={containerStyle}>
                    <motion.div
                        initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
                        style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto', marginBottom: '60px' }}
                    >
                        <h2 style={{ fontSize: '2.5rem', fontWeight: 700, color: '#111827', marginBottom: '20px' }}>Why Caterham Rotary?</h2>
                        <p style={{ fontSize: '1.1rem', color: '#4b5563', lineHeight: 1.7 }}>
                            Do you want to meet new friends and have fun while doing it? Or maybe you just have some cool skills
                            or experiences you want to share? If any of this sounds like something you’re interested in,
                            we would love to meet you.
                        </p>
                    </motion.div>

                    {/* BENEFITS GRID */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px' }}>
                        {benefits.map((b, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                viewport={{ once: true }}
                                style={{
                                    background: 'white', padding: '40px', borderRadius: '20px',
                                    boxShadow: '0 10px 30px -10px rgba(0,0,0,0.1)',
                                    textAlign: 'center', border: '1px solid #f3f4f6'
                                }}
                            >
                                <div style={{
                                    width: '70px', height: '70px', borderRadius: '50%', background: '#eff6ff',
                                    color: 'var(--accent-primary)', display: 'flex', alignItems: 'center',
                                    justifyContent: 'center', margin: '0 auto 20px'
                                }}>
                                    {b.icon}
                                </div>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1f2937', marginBottom: '10px' }}>{b.title}</h3>
                                <p style={{ color: '#6b7280', lineHeight: 1.5 }}>{b.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

            {/* CONTACT / APPLICATION FORM */}
            <div style={{ background: '#005baa', padding: '80px 0', color: 'white' }}>
                <div style={containerStyle}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px', alignItems: 'center' }}>

                        {/* Left Side: Text */}
                        <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
                            <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '20px' }}>Ready to get involved?</h2>
                            <p style={{ fontSize: '1.1rem', opacity: 0.9, lineHeight: 1.7, marginBottom: '30px' }}>
                                We usually meet weekly at the Surrey National Golf Club. Reach out to us to schedule a visit as a guest—dinner is on us!
                            </p>
                            <ul style={{ listStyle: 'none', padding: 0, fontSize: '1.1rem', space: '20px' }}>
                                <li style={{ marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}><FaCheckCircle color="#fbbf24" /> No rigorous commitment required</li>
                                <li style={{ marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}><FaCheckCircle color="#fbbf24" /> Open to all professions</li>
                                <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><FaCheckCircle color="#fbbf24" /> Family friendly environment</li>
                            </ul>
                        </motion.div>

                        {/* Right Side: Form */}
                        <motion.div
                            initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
                            style={{ background: 'white', padding: '40px', borderRadius: '24px', color: '#1f2937' }}
                        >
                            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '20px' }}>Send us a Message</h3>
                            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, marginBottom: '5px', color: '#4b5563' }}>Your Name</label>
                                    <input
                                        required
                                        type="text"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none' }}
                                        placeholder="Jane Doe"
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, marginBottom: '5px', color: '#4b5563' }}>Email Address</label>
                                    <input
                                        required
                                        type="email"
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                        style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none' }}
                                        placeholder="jane@example.com"
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, marginBottom: '5px', color: '#4b5563' }}>Phone Number (Optional)</label>
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                        style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none' }}
                                        placeholder="+44 7700 900000"
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, marginBottom: '5px', color: '#4b5563' }}>Message</label>
                                    <textarea
                                        required
                                        rows={4}
                                        value={formData.message}
                                        onChange={e => setFormData({ ...formData, message: e.target.value })}
                                        style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none', resize: 'vertical' }}
                                        placeholder="I'm interested in joining because..."
                                    />
                                </div>
                                <motion.button
                                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                    type="submit"
                                    style={{
                                        marginTop: '10px', padding: '14px', background: '#005baa', color: 'white',
                                        border: 'none', borderRadius: '10px', fontSize: '1rem', fontWeight: 700,
                                        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px'
                                    }}
                                >
                                    <FaPaperPlane /> Send Message
                                </motion.button>
                            </form>
                        </motion.div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default JoinUs;

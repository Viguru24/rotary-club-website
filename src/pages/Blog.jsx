import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getBlogPosts } from '../services/blogService';
import { FaCalendar, FaTag, FaClock, FaArrowRight } from 'react-icons/fa';


const BlogPage = () => {
    const [posts, setPosts] = useState([]);

    useEffect(() => {
        const fetchPosts = async () => {
            const data = await getBlogPosts('published');
            setPosts(data);
        };
        fetchPosts();

        const handleUpdate = () => fetchPosts();
        window.addEventListener('blog-updated', handleUpdate);
        return () => window.removeEventListener('blog-updated', handleUpdate);
    }, []);

    // Helper to strip HTML for summary
    const getSummary = (html) => {
        const tmp = document.createElement("DIV");
        tmp.innerHTML = html;
        let text = tmp.textContent || tmp.innerText || "";
        return text.substring(0, 150) + "...";
    };

    return (
        <div className="container section-padding" style={{ paddingTop: 'calc(var(--nav-height) + 40px)', minHeight: '100vh' }}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ textAlign: 'center', marginBottom: '80px' }}
            >
                <h1 className="text-gradient" style={{ fontSize: '4rem', marginBottom: '20px', letterSpacing: '-0.02em' }}>Our Stories</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.25rem', maxWidth: '600px', margin: '0 auto', lineHeight: 1.6, marginBottom: '30px' }}>
                    Discover the latest news, events, and community impact from Caterham Rotary.
                </p>
                <Link to="/submit-story" className="fancy-button" style={{ display: 'inline-flex', padding: '12px 30px', fontWeight: 600, fontSize: '1.1rem', borderRadius: '50px', textDecoration: 'none' }}>
                    Share Your Story
                </Link>
            </motion.div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '40px' }}>
                {posts.map((post, index) => (
                    <motion.article
                        key={post.id}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.1 }}
                        className="glass-card"
                        style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '100%', padding: 0 }}
                    >
                        {/* Image Cap */}
                        <div style={{ height: '240px', overflow: 'hidden', position: 'relative' }}>
                            <img
                                src={post.image || 'https://images.unsplash.com/photo-1590053707323-2895c112527f'}
                                alt={post.title}
                                style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }}
                                onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                                onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                            />
                            <div style={{ position: 'absolute', top: 20, right: 20, background: 'rgba(255,255,255,0.9)', padding: '6px 14px', borderRadius: '50px', fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-primary)', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
                                {post.category || 'General'}
                            </div>
                        </div>

                        {/* Content */}
                        <div style={{ padding: '30px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                            <div style={{ display: 'flex', gap: '15px', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '15px' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><FaCalendar /> {post.date}</span>
                                {post.readTime && <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><FaClock /> {post.readTime}</span>}
                            </div>

                            <h2 style={{ fontSize: '1.5rem', marginBottom: '15px', color: 'var(--text-primary)', lineHeight: 1.3, fontWeight: 700 }}>
                                {post.title}
                            </h2>

                            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: '1rem', marginBottom: '25px', flex: 1 }}>
                                {getSummary(post.content)}
                            </p>

                            <Link to={`/blog/${post.id}`} style={{
                                background: 'transparent', border: 'none', color: 'var(--accent-primary)',
                                fontSize: '1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: 0, textDecoration: 'none'
                            }}>
                                Read Full Story <FaArrowRight size={14} />
                            </Link>
                        </div>
                    </motion.article>
                ))}
            </div>
        </div>
    );
};

export default BlogPage;

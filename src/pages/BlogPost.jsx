import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getBlogPosts } from '../services/blogService';
import { motion } from 'framer-motion';
import { FaCalendar, FaUser, FaClock, FaTag, FaArrowLeft, FaShareAlt } from 'react-icons/fa';

const BlogPost = () => {
    const { id } = useParams();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPost = async () => {
            const posts = await getBlogPosts();
            // Handle numeric ID from DB vs string param
            const foundPost = posts.find(p => p.id == id);
            setPost(foundPost);
            setLoading(false);
        };
        fetchPost();
    }, [id]);

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: post.title,
                    text: post.title,
                    url: window.location.href,
                });
            } catch (error) {
                console.log('Error sharing', error);
            }
        } else {
            navigator.clipboard.writeText(window.location.href);
            alert('URL copied to clipboard!');
        }
    };

    if (loading) {
        return (
            <div className="container section-padding text-center">
                <div className="glass-panel p-5">
                    <h2>Loading...</h2>
                </div>
            </div>
        );
    }

    if (!post) {
        return (
            <div className="container section-padding text-center">
                <div className="glass-panel p-5">
                    <h2>Blog Post Not Found</h2>
                    <p>The article you are looking for does not exist.</p>
                    <Link to="/blog" className="btn-secondary mt-4">Back to Blog</Link>
                </div>
            </div>
        );
    }

    const siteUrl = 'https://caterham-rotary-vvo7el47tq-uc.a.run.app';
    const postUrl = `${siteUrl}/blog/${post.id}`;

    // Schema Strategy: Breadcrumbs & Speakable Article
    const articleSchema = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "headline": post.title,
        "image": [post.image],
        "datePublished": post.date, // Format should optimally be ISO 8601
        "author": [{
            "@type": "Organization",
            "name": post.author || "Caterham Rotary",
            "url": siteUrl
        }],
        "speakable": {
            "@type": "SpeakableSpecification",
            "cssSelector": [".blog-title", ".blog-summary"]
        }
    };

    const breadcrumbSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [{
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": siteUrl
        }, {
            "@type": "ListItem",
            "position": 2,
            "name": "Blog",
            "item": `${siteUrl}/blog`
        }, {
            "@type": "ListItem",
            "position": 3,
            "name": post.title
        }]
    };

    return (
        <div className="blog-post-page" style={{ paddingTop: '120px', paddingBottom: '80px' }}>
            <SEO
                title={post.title}
                description={`Read about ${post.title}. ${post.content.replace(/<[^>]*>?/gm, '').substring(0, 150)}...`}
                image={post.image}
                type="article"
                canonical={`/blog/${post.id}`}
                schema={[articleSchema, breadcrumbSchema]}
            />
            <div className="container">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <Link to="/blog" className="text-decoration-none d-inline-flex align-items-center mb-4" style={{ color: 'var(--text-primary)' }}>
                        <FaArrowLeft className="me-2" /> Back to Blog
                    </Link>

                    <div className="glass-panel p-0 overflow-hidden">
                        {/* Hero Image */}
                        <div style={{ height: '400px', width: '100%', position: 'relative' }}>
                            <img
                                src={post.image}
                                alt={post.title}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                            {/* Dark Gradient Overlay for Text Readability */}
                            <div className="glass-overlay" style={{
                                position: 'absolute',
                                bottom: 0,
                                left: 0,
                                right: 0,
                                padding: '40px',
                                background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.5) 70%, transparent 100%)'
                            }}>
                                <span className="badge-primary mb-3 d-inline-block" style={{ background: 'var(--accent-primary)', padding: '6px 12px', borderRadius: '6px', color: 'white', fontSize: '0.85rem', fontWeight: '600' }}>
                                    {post.category || 'News'}
                                </span>
                                <h1 className="mb-3 blog-title" style={{ // Added class for speakable schema
                                    textShadow: '0 2px 4px rgba(0,0,0,0.5)',
                                    color: '#ffffff',
                                    fontSize: '2.5rem',
                                    lineHeight: '1.2'
                                }}>{post.title}</h1>

                                <div className="d-flex flex-wrap gap-4 small" style={{ color: 'rgba(255,255,255,0.9)', display: 'flex', gap: '20px', fontSize: '0.95rem' }}>
                                    <span className="d-flex align-items-center" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><FaCalendar /> {post.date}</span>
                                    <span className="d-flex align-items-center" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><FaUser /> {post.author || 'Caterham Rotary'}</span>
                                    <span className="d-flex align-items-center" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><FaClock /> {post.readTime || '3 min read'}</span>
                                </div>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-4 p-md-5" style={{ padding: '40px' }}>

                            {/* Render HTML content safely */}
                            <div className="blog-content blog-summary" // Added class for speakable schema (targeting body as summary)
                                style={{ fontSize: '1.15rem', lineHeight: '1.8', color: 'var(--text-primary)' }}
                                dangerouslySetInnerHTML={{ __html: post.content }}
                            />

                            <hr className="my-5" style={{ borderColor: 'var(--glass-border)', margin: '40px 0', border: '0', borderTop: '1px solid rgba(0,0,0,0.1)' }} />

                            <div className="d-flex justify-content-between align-items-center" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
                                <div className="d-flex gap-2" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                    <span className="fw-bold" style={{ fontWeight: 'bold' }}>Tags:</span>
                                    <span className="badge bg-light text-dark" style={{ background: '#f3f4f6', padding: '6px 12px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem' }}><FaTag className="me-1" /> {post.category || 'General'}</span>
                                </div>
                                <button onClick={handleShare} className="btn-secondary d-flex align-items-center gap-2" style={{
                                    background: 'var(--bg-tertiary)', border: 'none', padding: '12px 24px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)', fontWeight: 600, transition: 'all 0.2s'
                                }}>
                                    <FaShareAlt /> Share Article
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default BlogPost;

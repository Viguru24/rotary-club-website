
import React, { useState, useEffect, useRef } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { motion, AnimatePresence } from 'framer-motion';
import { getBlogPosts, saveBlogPost, deleteBlogPost } from '../services/blogService';
import { FaPlus, FaEdit, FaTrash, FaImage, FaMobileAlt, FaDesktop, FaCheck, FaMagic, FaEye, FaExpand, FaCompress, FaRocket, FaClock, FaTimesCircle, FaCheckCircle } from 'react-icons/fa';
import { useUI } from '../context/UIContext';

const AdminBlog = () => {
    const { showToast, confirmAction } = useUI();
    const [posts, setPosts] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [zenMode, setZenMode] = useState(false);
    const [previewMode, setPreviewMode] = useState('desktop');
    const [activeTab, setActiveTab] = useState('published'); // published, pending, draft

    // Initial Empty State
    const emptyPost = { title: '', category: 'General', content: '', image: '', readTime: '', status: 'draft' };
    const [currentPost, setCurrentPost] = useState(emptyPost);

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        const data = await getBlogPosts(); // Fetch ALL posts (admin view)
        setPosts(data);
    };

    // Filter posts based on active tab
    const filteredPosts = posts.filter(post => {
        if (activeTab === 'published') return post.status === 'published';
        if (activeTab === 'pending') return post.status === 'pending';
        return post.status === 'draft' || !post.status;
    });

    // -- WOAH ITEM 1: SEO & Readability Score --
    const getStats = (text) => {
        const words = text ? text.replace(/<[^>]*>/g, '').split(/\s+/).length : 0;
        const readTime = Math.ceil(words / 200);
        const titleLength = currentPost.title.length;
        const score = Math.min(100, (words > 300 ? 50 : words / 6) + (titleLength > 20 && titleLength < 60 ? 40 : 10) + (currentPost.image ? 10 : 0));

        let color = '#ef4444';
        if (score > 50) color = '#f59e0b';
        if (score > 80) color = '#10b981';

        return { words, readTime, score, color };
    };

    const stats = getStats(currentPost.content);

    // -- Functionality --
    const handleSave = async (statusOverride) => {
        // If statusOverride is provided, use it (e.g. 'published' or 'pending')
        // Otherwise keep existing status, or default to 'draft'
        const newStatus = statusOverride || currentPost.status || 'draft';

        const postToSave = {
            ...currentPost,
            readTime: `${stats.readTime} min read`,
            status: newStatus
        };

        await saveBlogPost(postToSave);
        await fetchPosts();

        setIsModalOpen(false);
        setZenMode(false);
        setCurrentPost(emptyPost);

        const actionLabel = newStatus === 'published' ? 'published' : newStatus === 'pending' ? 'submitted for review' : 'saved as draft';
        showToast(`Story ${actionLabel} successfully!`, 'success');
    };

    const handleDelete = (id) => {
        confirmAction(
            'Are you sure you want to delete this story?',
            async () => {
                await deleteBlogPost(id);
                await fetchPosts();
                showToast('Story deleted successfully', 'success');
            },
            'Delete Story',
            true
        );
    };

    // Admin Approval Action
    const handleApprove = async (post) => {
        confirmAction(
            'Approve and publish this story live?',
            async () => {
                await saveBlogPost({ ...post, status: 'published' });
                await fetchPosts();
                showToast('Story approved and published!', 'success');
            },
            'Approve Story',
            false // not destructive
        );
    };

    // Drag and Drop Image
    const handleDrop = (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = () => setCurrentPost({ ...currentPost, image: reader.result });
            reader.readAsDataURL(file);
        }
    };

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            {/* Header */}
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 700, color: '#111827', lineHeight: 1.2 }}>Blog Management</h1>
                    <p style={{ color: '#6b7280' }}>Create and manage inspiring stories.</p>
                </div>
                <button
                    className="desktop-only-btn"
                    onClick={() => { setCurrentPost(emptyPost); setIsModalOpen(true); }}
                    style={{
                        padding: '12px 25px', background: 'var(--accent-primary)', color: 'white',
                        border: 'none', borderRadius: '12px', fontWeight: 600, cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.01)'
                    }}
                >
                    <FaPlus /> New Story
                </button>
            </div>

            {/* Mobile Floating Action Button (FAB) */}
            <button
                className="mobile-fab"
                onClick={() => { setCurrentPost(emptyPost); setIsModalOpen(true); }}
                style={{
                    position: 'fixed', bottom: '30px', right: '30px', width: '64px', height: '64px', borderRadius: '50%',
                    background: 'var(--accent-primary)', color: 'white', border: 'none',
                    boxShadow: '0 10px 25px -5px rgba(0, 91, 170, 0.5)', zIndex: 90,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
                }}
            >
                <FaPlus size={24} />
            </button>

            <style>{`
                @media (max-width: 768px) {
                    .desktop-only-btn { display: none !important; }
                }
                @media (min-width: 769px) {
                    .mobile-fab { display: none !important; }
                }
            `}</style>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '20px', marginBottom: '30px', borderBottom: '1px solid #e5e7eb' }}>
                <div
                    onClick={() => setActiveTab('published')}
                    style={{ padding: '10px 20px', cursor: 'pointer', borderBottom: activeTab === 'published' ? '2px solid var(--accent-primary)' : '2px solid transparent', color: activeTab === 'published' ? 'var(--accent-primary)' : '#6b7280', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                    <FaCheckCircle /> Published
                </div>
                <div
                    onClick={() => setActiveTab('pending')}
                    style={{ padding: '10px 20px', cursor: 'pointer', borderBottom: activeTab === 'pending' ? '2px solid #f59e0b' : '2px solid transparent', color: activeTab === 'pending' ? '#d97706' : '#6b7280', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                    <FaClock /> Pending Approval
                    {posts.filter(p => p.status === 'pending').length > 0 && (
                        <span style={{ background: '#f59e0b', color: 'white', fontSize: '0.7rem', padding: '2px 6px', borderRadius: '10px' }}>
                            {posts.filter(p => p.status === 'pending').length}
                        </span>
                    )}
                </div>
                <div
                    onClick={() => setActiveTab('draft')}
                    style={{ padding: '10px 20px', cursor: 'pointer', borderBottom: activeTab === 'draft' ? '2px solid #9ca3af' : '2px solid transparent', color: activeTab === 'draft' ? '#4b5563' : '#9ca3af', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                    <FaEdit /> Drafts
                </div>
            </div>

            {/* List View */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                {filteredPosts.map(post => (
                    <motion.div
                        key={post.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{ background: 'white', borderRadius: '16px', border: '1px solid #e5e7eb', overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}
                    >
                        <div style={{ height: '160px', background: '#f3f4f6', backgroundImage: `url(${post.image})`, backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative' }}>
                            {!post.image && <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}><FaImage size={24} /></div>}
                            <div style={{
                                position: 'absolute', top: 10, right: 10, background: 'rgba(255,255,255,0.9)', padding: '4px 10px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 'bold',
                                color: post.status === 'published' ? '#10b981' : post.status === 'pending' ? '#f59e0b' : '#6b7280'
                            }}>
                                {post.status?.toUpperCase() || 'DRAFT'}
                            </div>
                        </div>
                        <div style={{ padding: '20px' }}>
                            <div style={{ fontSize: '0.8rem', color: 'var(--accent-primary)', fontWeight: 600, marginBottom: '5px' }}>{post.category}</div>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#111827', marginBottom: '10px', lineHeight: 1.4 }}>{post.title}</h3>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '15px' }}>
                                <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>{post.date}</span>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    {/* Approve Button for Admins */}
                                    {post.status === 'pending' && (
                                        <button
                                            onClick={() => handleApprove(post)}
                                            title="Approve & Publish"
                                            style={{ padding: '8px', borderRadius: '8px', border: '1px solid #10b981', background: '#ecfdf5', color: '#059669', cursor: 'pointer' }}
                                        >
                                            <FaCheck />
                                        </button>
                                    )}
                                    <button onClick={() => { setCurrentPost(post); setIsModalOpen(true); }} style={{ padding: '8px', borderRadius: '8px', border: '1px solid #e5e7eb', background: 'white', color: '#374151', cursor: 'pointer' }}><FaEdit /></button>
                                    <button onClick={() => handleDelete(post.id)} style={{ padding: '8px', borderRadius: '8px', border: '1px solid #fee2e2', background: '#fef2f2', color: '#ef4444', cursor: 'pointer' }}><FaTrash /></button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
                {filteredPosts.length === 0 && (
                    <div style={{ gridColumn: '1 / -1', padding: '40px', textAlign: 'center', color: '#9ca3af', fontStyle: 'italic' }}>
                        No posts found in this category.
                    </div>
                )}
            </div>

            {/* FULL SCREEN EDITOR MODAL */}
            <AnimatePresence>
                {isModalOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        style={{
                            position: 'fixed', inset: 0, zIndex: 150, background: 'white',
                            display: 'flex', flexDirection: zenMode ? 'row' : 'row'
                        }}
                    >
                        {/* LEFT: Editor Area */}
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>

                            {/* Toolbar */}
                            <div style={{ height: '60px', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 30px', background: 'white' }}>
                                <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', fontSize: '1rem', color: '#6b7280', cursor: 'pointer', fontWeight: 500 }}>Cancel</button>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <button onClick={() => setZenMode(!zenMode)} title="Zen Mode" style={{ padding: '8px', borderRadius: '8px', background: zenMode ? '#e5e7eb' : 'transparent', border: 'none', cursor: 'pointer', color: '#4b5563' }}>
                                        {zenMode ? <FaCompress /> : <FaExpand />}
                                    </button>
                                    <button onClick={() => setPreviewMode(previewMode === 'mobile' ? 'desktop' : 'mobile')} title="Toggle Device" style={{ padding: '8px', borderRadius: '8px', background: 'transparent', border: 'none', cursor: 'pointer', color: '#4b5563' }}>
                                        {previewMode === 'mobile' ? <FaDesktop /> : <FaMobileAlt />}
                                    </button>
                                </div>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <button onClick={() => handleSave('draft')} style={{ padding: '8px 16px', background: 'white', color: '#374151', border: '1px solid #d1d5db', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>
                                        Save Draft
                                    </button>
                                    {/* Main Action Button */}
                                    <button
                                        onClick={() => handleSave('pending')}
                                        style={{ padding: '8px 24px', background: 'var(--accent-primary)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                                    >
                                        <FaRocket /> Submit for Approval
                                    </button>
                                </div>
                            </div>

                            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', justifyContent: 'center', background: '#f9fafb', padding: '40px' }}>
                                <div style={{ width: '100%', maxWidth: '800px', background: 'white', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', minHeight: '100%', padding: '50px', position: 'relative' }}>

                                    <div
                                        onDragOver={(e) => e.preventDefault()}
                                        onDrop={handleDrop}
                                        style={{
                                            height: '250px', background: '#f3f4f6', borderRadius: '12px', marginBottom: '30px',
                                            backgroundImage: `url(${currentPost.image})`, backgroundSize: 'cover', backgroundPosition: 'center',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px dashed #d1d5db', cursor: 'pointer', position: 'relative', overflow: 'hidden'
                                        }}
                                        onClick={() => setCurrentPost({ ...currentPost, image: prompt('Enter image URL', currentPost.image) || currentPost.image })}
                                    >
                                        {!currentPost.image && (
                                            <div style={{ textAlign: 'center', color: '#9ca3af' }}>
                                                <FaImage size={32} style={{ marginBottom: '10px' }} />
                                                <p style={{ fontWeight: 500 }}>Drag & Drop Cover Image</p>
                                                <p style={{ fontSize: '0.8rem' }}>or click to add URL</p>
                                            </div>
                                        )}
                                        {currentPost.image && <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.1)' }}></div>}
                                    </div>

                                    <input
                                        type="text"
                                        placeholder="Story Title..."
                                        value={currentPost.title}
                                        onChange={(e) => setCurrentPost({ ...currentPost, title: e.target.value })}
                                        style={{ width: '100%', fontSize: '2.5rem', fontWeight: 800, border: 'none', outline: 'none', color: '#111827', marginBottom: '20px', fontFamily: "'Inter', sans-serif" }}
                                    />

                                    <ReactQuill
                                        theme="snow"
                                        value={currentPost.content || ''}
                                        onChange={(value) => setCurrentPost({ ...currentPost, content: value })}
                                        style={{ height: '400px', marginBottom: '50px' }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* RIGHT: Stats & Preview Panel */}
                        {!zenMode && (
                            <div style={{ width: '300px', background: 'white', borderLeft: '1px solid #e5e7eb', padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                <div style={{ padding: '20px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                    <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#475569', marginBottom: '15px' }}>Content Health</h4>

                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                                        <span style={{ fontSize: '0.85rem', color: '#64748b' }}>SEO Score</span>
                                        <span style={{ fontSize: '0.9rem', fontWeight: 700, color: stats.color }}>{Math.round(stats.score)}%</span>
                                    </div>
                                    <div style={{ height: '6px', background: '#e2e8f0', borderRadius: '3px', marginBottom: '20px', overflow: 'hidden' }}>
                                        <div style={{ height: '100%', width: `${stats.score}%`, background: stats.color, transition: 'all 0.5s' }}></div>
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                        <div style={{ background: 'white', padding: '10px', borderRadius: '8px', textAlign: 'center', border: '1px solid #e2e8f0' }}>
                                            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1e293b' }}>{stats.readTime}</div>
                                            <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>MIN READ</div>
                                        </div>
                                        <div style={{ background: 'white', padding: '10px', borderRadius: '8px', textAlign: 'center', border: '1px solid #e2e8f0' }}>
                                            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1e293b' }}>{stats.words}</div>
                                            <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>WORDS</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Settings */}
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#4b5563', marginBottom: '8px' }}>Category</label>
                                    <select
                                        value={currentPost.category}
                                        onChange={(e) => setCurrentPost({ ...currentPost, category: e.target.value })}
                                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none' }}
                                    >
                                        <option>General</option>
                                        <option>Community Action</option>
                                        <option>Events</option>
                                        <option>Charity</option>
                                        <option>Rotary Life</option>
                                    </select>
                                </div>
                                <div style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '10px', fontStyle: 'italic' }}>
                                    <p>Note: Approved posts will be visible on the public site immediately.</p>
                                </div>

                                {/* Device Preview */}
                                {previewMode === 'mobile' && (
                                    <div style={{ background: '#111827', borderRadius: '20px', padding: '10px', marginTop: 'auto' }}>
                                        <div style={{ background: 'white', borderRadius: '12px', height: '300px', overflow: 'hidden', fontSize: '0.5rem', padding: '10px' }}>
                                            <h3 style={{ fontWeight: 700, marginBottom: '5px' }}>{currentPost.title || 'Untitled'}</h3>
                                            <div style={{ width: '100%', height: '50px', background: '#eee', marginBottom: '5px', borderRadius: '4px' }}></div>
                                            <div style={{ color: '#666' }} dangerouslySetInnerHTML={{ __html: currentPost.content }} />
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminBlog;

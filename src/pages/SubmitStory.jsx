import React, { useState } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { saveBlogPost } from '../services/blogService';
import { useUI } from '../context/UIContext';
import { useAuth } from '../context/AuthContext';
import { FaImage, FaPaperPlane, FaArrowLeft } from 'react-icons/fa';

const SubmitStory = () => {
    const navigate = useNavigate();
    const { showToast } = useUI();
    const { user } = useAuth();
    const [submitting, setSubmitting] = useState(false);

    // Initial State
    const [post, setPost] = useState({
        title: '',
        category: 'Community Action',
        content: '',
        image: '',
        status: 'pending' // Force pending status for public submissions
    });

    const getStats = (text) => {
        const words = text ? text.replace(/<[^>]*>/g, '').split(/\s+/).length : 0;
        const readTime = Math.ceil(words / 200);
        return { words, readTime };
    };

    const handleSave = async (e) => {
        e.preventDefault();

        if (!post.title || !post.content) {
            showToast('Please provide a title and content.', 'error');
            return;
        }

        setSubmitting(true);

        try {
            const stats = getStats(post.content);
            const postToSave = {
                ...post,
                author: user ? user.name : 'Guest Contributor',
                authorId: user ? user.sub : null, // Google user ID
                readTime: `${stats.readTime} min read`,
                date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
            };

            await saveBlogPost(postToSave);
            showToast('Story submitted for review! It will be live once approved.', 'success');
            setTimeout(() => navigate('/blog'), 2000);
        } catch (error) {
            showToast('Failed to submit story. Please try again.', 'error');
            setSubmitting(false);
        }
    };

    // Drag and Drop Image
    const handleDrop = (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = () => setPost({ ...post, image: reader.result });
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="container section-padding" style={{ paddingTop: 'calc(var(--nav-height) + 40px)', minHeight: '100vh', maxWidth: '800px' }}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <button
                    onClick={() => navigate('/blog')}
                    style={{ background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: '8px', color: '#6b7280', cursor: 'pointer', marginBottom: '20px', fontSize: '1rem' }}
                >
                    <FaArrowLeft /> Back to Stories
                </button>

                <div className="glass-panel" style={{ padding: '40px', borderRadius: '24px' }}>
                    <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#111827', marginBottom: '10px' }}>Submit a Story</h1>
                        <p style={{ color: '#6b7280' }}>Share your Rotary experience with the community. All submissions are reviewed before publishing.</p>
                    </div>

                    {/* Image Upload */}
                    <div
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={handleDrop}
                        style={{
                            height: '200px', background: '#f9fafb', borderRadius: '16px', marginBottom: '30px',
                            backgroundImage: `url(${post.image})`, backgroundSize: 'cover', backgroundPosition: 'center',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px dashed #d1d5db', cursor: 'pointer', position: 'relative', overflow: 'hidden'
                        }}
                        onClick={() => setPost({ ...post, image: prompt('Enter image URL', post.image) || post.image })}
                    >
                        {!post.image && (
                            <div style={{ textAlign: 'center', color: '#9ca3af' }}>
                                <FaImage size={32} style={{ marginBottom: '10px' }} />
                                <p style={{ fontWeight: 500 }}>Drag & Drop Cover Image</p>
                                <p style={{ fontSize: '0.8rem' }}>or click to add URL</p>
                            </div>
                        )}
                        {post.image && <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.1)' }}></div>}
                    </div>

                    {/* Editor Inputs */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div>
                            <label style={{ display: 'block', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>Category</label>
                            <select
                                value={post.category}
                                onChange={(e) => setPost({ ...post, category: e.target.value })}
                                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none', background: 'white' }}
                            >
                                <option>Community Action</option>
                                <option>Events</option>
                                <option>Charity</option>
                                <option>Rotary Life</option>
                                <option>General</option>
                            </select>
                        </div>

                        <input
                            type="text"
                            placeholder="Give your story a title..."
                            value={post.title}
                            onChange={(e) => setPost({ ...post, title: e.target.value })}
                            style={{ width: '100%', fontSize: '1.5rem', fontWeight: 700, padding: '12px 0', border: 'none', borderBottom: '1px solid #e5e7eb', outline: 'none', color: '#111827', background: 'transparent' }}
                        />

                        <div style={{ height: '400px', marginBottom: '50px' }}>
                            <ReactQuill
                                theme="snow"
                                value={post.content}
                                onChange={(value) => setPost({ ...post, content: value })}
                                style={{ height: '350px' }}
                                placeholder="Tell us your story..."
                            />
                        </div>

                        <button
                            onClick={handleSave}
                            disabled={submitting}
                            style={{
                                width: '100%',
                                padding: '16px',
                                background: submitting ? '#9ca3af' : 'var(--accent-primary)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '12px',
                                fontWeight: 700,
                                fontSize: '1.1rem',
                                cursor: submitting ? 'not-allowed' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '10px',
                                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                                marginTop: '10px'
                            }}
                        >
                            {submitting ? 'Submitting...' : <><FaPaperPlane /> Submit for Review</>}
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default SubmitStory;

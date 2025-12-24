import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getBlogPosts, saveBlogPost, deleteBlogPost } from '../services/blogService';
import { FaPlus, FaEdit, FaTrash, FaImage, FaChevronLeft, FaSave, FaRocket, FaClock, FaCheckCircle, FaCalendarAlt, FaUser, FaQuoteRight, FaUpload, FaEye, FaEyeSlash } from 'react-icons/fa';
import { useUI } from '../context/UIContext';
import ImageInsertModal from '../components/ImageInsertModal';
import ImageUploadBox from '../components/ImageUploadBox';
import RichTextEditor from '../components/RichTextEditor';

import '../blog-images.css'; // Import public blog styles

// --- STYLES ---
const styles = {
    container: {
        maxWidth: '100%', // Use full width
        margin: '0 auto',
        padding: '20px',
        height: '100%', // Fill available space respecting parent padding
        display: 'flex',
        flexDirection: 'column',
        position: 'relative', // Context for absolute children
        overflow: 'hidden', // Contain the slide-in editor
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
        flexShrink: 0,
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '20px',
        overflowY: 'auto',
        paddingBottom: '20px',
        flex: 1, // Fill remaining space
    },
    card: {
        background: 'white',
        borderRadius: '16px',
        border: '1px solid #e5e7eb',
        overflow: 'hidden',
        transition: 'transform 0.2s, box-shadow 0.2s',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        minHeight: '380px', // Enforce height to prevent squashing
        height: '100%', // Take full grid row height
    },
    editorWrapper: {
        position: 'absolute', // Absolute within the relative container
        inset: 0,
        zIndex: 50,
        background: 'white', // Match public page background
        display: 'flex',
        flexDirection: 'column',
    },
    editorToolbar: {
        height: '64px',
        background: 'white',
        borderBottom: '1px solid #e2e8f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        flexShrink: 0,
    },


    sectionTitle: {
        fontSize: '0.85rem',
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        color: '#94a3b8',
        marginBottom: '12px',
    },
    formGroup: {
        marginBottom: '16px',
    },
    label: {
        display: 'block',
        fontSize: '0.9rem',
        fontWeight: 600,
        color: '#475569',
        marginBottom: '8px',
    },
    input: {
        width: '100%',
        padding: '10px 12px',
        borderRadius: '8px',
        border: '1px solid #cbd5e1',
        fontSize: '0.95rem',
        color: '#334155',
        outline: 'none',
        transition: 'border-color 0.2s',
    },
    statusBadge: (status) => ({
        padding: '4px 10px',
        borderRadius: '20px',
        fontSize: '0.75rem',
        fontWeight: 700,
        textTransform: 'uppercase',
        background: status === 'published' ? '#dcfce7' : status === 'pending' ? '#fef3c7' : '#f1f5f9',
        color: status === 'published' ? '#166534' : status === 'pending' ? '#b45309' : '#475569',
    }),

};

const AdminBlog = () => {
    const { showToast, confirmAction } = useUI();
    const [posts, setPosts] = useState([]);
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('published');
    const [isImageModalOpen, setIsImageModalOpen] = useState(false);
    const [editorSelectionData, setEditorSelectionData] = useState(null); // Fix for lost focus

    // Editor State
    const emptyPost = {
        title: '',
        category: 'General',
        content: '',
        image: '',
        readTime: '',
        status: 'draft',
        author: 'Rotary Club',
        date: new Date().toISOString().split('T')[0]
    };
    const [currentPost, setCurrentPost] = useState(emptyPost);
    const [quillRef, setQuillRef] = useState(null); // Ref to access Quill instance

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        const data = await getBlogPosts();
        setPosts(data);
    };

    // Auto-resize title
    const titleRef = React.useRef(null);
    useEffect(() => {
        if (titleRef.current) {
            titleRef.current.style.height = 'auto';
            titleRef.current.style.height = titleRef.current.scrollHeight + 'px';
        }
    }, [currentPost.title, isEditorOpen]);

    const filteredPosts = posts.filter(post => {
        if (activeTab === 'published') return post.status === 'published';
        if (activeTab === 'pending') return post.status === 'pending';
        return post.status === 'draft' || !post.status;
    });

    const handleSave = async (statusOverride) => {
        const newStatus = statusOverride || currentPost.status || 'draft';

        // Calculate basic stats
        const text = currentPost.content.replace(/<[^>]*>/g, '');
        const words = text.split(/\s+/).length;
        const readTime = Math.ceil(words / 200) + ' min read';

        const postToSave = {
            ...currentPost,
            readTime,
            status: newStatus
        };

        await saveBlogPost(postToSave);
        await fetchPosts();

        if (statusOverride) {
            setIsEditorOpen(false);
            showToast(`Story ${newStatus === 'published' ? 'published' : 'saved'} successfully!`, 'success');
        } else {
            setCurrentPost(postToSave); // Update local state with saved ID if new
            showToast('Draft saved', 'success');
        }
    };

    const handleDelete = (id, e) => {
        e.stopPropagation();
        confirmAction(
            'Are you sure you want to delete this story?',
            async () => {
                await deleteBlogPost(id);
                await fetchPosts();
                showToast('Story deleted', 'success');
            },
            'Delete Story',
            true
        );
    };

    const handleToggleStatus = async (post, e) => {
        e.stopPropagation();
        const newStatus = post.status === 'published' ? 'draft' : 'published';

        // Optimistic update
        const updatedPost = { ...post, status: newStatus };

        try {
            await saveBlogPost(updatedPost);
            await fetchPosts();
            showToast(newStatus === 'published' ? 'Story is now visible on site' : 'Story hidden from site', 'success');
        } catch (error) {
            showToast('Failed to update status', 'error');
        }
    };

    const handleImageInsert = (html) => {
        if (quillRef) {
            const editor = quillRef.getEditor();
            // Use stored selection or fallback to end of doc
            const index = editorSelectionData ? editorSelectionData : editor.getLength();
            editor.clipboard.dangerouslyPasteHTML(index, html);
            setEditorSelectionData(null); // Reset
        }
    };

    const openImageModal = () => {
        // Save selection before losing focus
        if (quillRef) {
            const selection = quillRef.getEditor().getSelection();
            if (selection) setEditorSelectionData(selection.index);
        }
        setIsImageModalOpen(true);
    };

    // --- RENDER EDITOR ---
    const renderEditor = () => (
        <motion.div
            style={styles.editorWrapper}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
        >
            {/* TOOLBAR */}
            <div style={styles.editorToolbar}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <button
                        onClick={() => setIsEditorOpen(false)}
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', border: 'none', background: 'none', cursor: 'pointer', color: '#64748b', fontWeight: 600 }}
                    >
                        <FaChevronLeft /> Back
                    </button>
                    <div style={{ width: '1px', height: '24px', background: '#e2e8f0' }}></div>
                    <span style={{ fontSize: '0.9rem', color: '#94a3b8' }}>{currentPost.status === 'published' ? 'Published' : 'Draft'}</span>
                </div>

                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    {currentPost.id && (
                        <button
                            onClick={(e) => handleDelete(currentPost.id, e)}
                            style={{ padding: '8px', borderRadius: '8px', border: '1px solid #fee2e2', background: '#fef2f2', color: '#ef4444', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                            title="Delete Story"
                        >
                            <FaTrash />
                        </button>
                    )}

                    <button
                        onClick={openImageModal}
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '8px', color: '#475569', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem' }}
                        title="Insert Image"
                    >
                        <FaImage /> <span className="hidden md-flex">Image</span>
                    </button>

                    <button
                        onClick={() => handleSave()}
                        style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', background: 'white', color: '#475569', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                        <FaSave /> Save
                    </button>

                    {currentPost.status === 'published' ? (
                        <button
                            onClick={() => handleSave('draft')}
                            style={{ padding: '8px 20px', borderRadius: '8px', border: 'none', background: '#f1f5f9', color: '#475569', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                            title="Hide from website"
                        >
                            <FaEyeSlash /> Unpublish
                        </button>
                    ) : (
                        <button
                            onClick={() => handleSave('published')}
                            style={{ padding: '8px 20px', borderRadius: '8px', border: 'none', background: 'var(--accent-primary)', color: 'white', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                        >
                            <FaRocket /> Publish
                        </button>
                    )}
                </div>
            </div>

            {/* MAIN AREA */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', padding: '24px', maxWidth: '1200px', margin: '0 auto', height: '100%', overflowY: 'auto' }}>
                {/* CONTENT COLUMN */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

                    {/* Title */}
                    <div style={{ background: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                        <label style={styles.label}>Title</label>
                        <input
                            type="text"
                            style={{ ...styles.input, fontSize: '1.25rem', fontWeight: 600, padding: '12px' }}
                            placeholder="Enter post title..."
                            value={currentPost.title}
                            onChange={(e) => setCurrentPost({ ...currentPost, title: e.target.value })}
                        />
                    </div>

                    {/* Content Editor */}
                    <div style={{ background: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <label style={styles.label}>Content</label>
                        <RichTextEditor
                            ref={(el) => setQuillRef(el)}
                            value={currentPost.content}
                            onChange={(content) => setCurrentPost({ ...currentPost, content })}
                            placeholder="Write your blog post content here..."
                            className="w-full"
                        />
                    </div>
                </div>

                {/* SIDEBAR COLUMN */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

                    {/* Publishing */}
                    <div style={{ background: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                        <div style={styles.sectionTitle}>Publishing</div>
                        <div style={styles.formGroup}>
                            <label style={styles.label}><FaCalendarAlt style={{ marginRight: '6px' }} /> Publish Date</label>
                            <input
                                type="date"
                                style={styles.input}
                                value={currentPost.date}
                                onChange={(e) => setCurrentPost({ ...currentPost, date: e.target.value })}
                            />
                        </div>
                        <div style={styles.formGroup}>
                            <label style={styles.label}><FaUser style={{ marginRight: '6px' }} /> Author</label>
                            <input
                                type="text"
                                style={styles.input}
                                value={currentPost.author}
                                onChange={(e) => setCurrentPost({ ...currentPost, author: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Organization */}
                    <div style={{ background: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                        <div style={styles.sectionTitle}>Organization</div>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Category</label>
                            <select
                                style={styles.input}
                                value={currentPost.category}
                                onChange={(e) => setCurrentPost({ ...currentPost, category: e.target.value })}
                            >
                                <option>General</option>
                                <option>Community Action</option>
                                <option>Events</option>
                                <option>Charity</option>
                                <option>Rotary Life</option>
                            </select>
                        </div>
                    </div>

                    {/* Cover Image */}
                    <div style={{ background: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                        <div style={styles.sectionTitle}>Cover Image</div>
                        <ImageUploadBox
                            currentImage={currentPost.image}
                            onImageSelect={(url) => setCurrentPost({ ...currentPost, image: url })}
                            style={{ marginBottom: '16px' }}
                        />
                    </div>
                </div>
            </div>

            <ImageInsertModal
                isOpen={isImageModalOpen}
                onClose={() => setIsImageModalOpen(false)}
                onInsert={handleImageInsert}
            />
        </motion.div>
    );

    // --- RENDER DASHBOARD ---
    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <div>
                    <h1 className="admin-page-title">Blog Manager</h1>
                    <p style={{ color: '#64748b', marginTop: '6px' }}>Manage your organization's stories</p>
                </div>
                <button
                    onClick={() => { setCurrentPost(emptyPost); setIsEditorOpen(true); }}
                    style={{ padding: '12px 24px', background: 'var(--accent-primary)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 700, fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 10px 15px -3px rgba(0, 91, 170, 0.2)' }}
                >
                    <FaPlus /> New Story
                </button>
            </div>

            {/* TABS */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', borderBottom: '1px solid #e2e8f0', paddingBottom: '0' }}>
                {[
                    { id: 'published', label: 'Published', icon: FaCheckCircle, color: '#166534' },
                    { id: 'pending', label: 'Pending Review', icon: FaClock, color: '#b45309' },
                    { id: 'draft', label: 'Drafts', icon: FaEdit, color: '#475569' }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        style={{
                            padding: '12px 20px',
                            background: 'none',
                            border: 'none',
                            borderBottom: activeTab === tab.id ? `2px solid ${tab.color}` : '2px solid transparent',
                            color: activeTab === tab.id ? tab.color : '#94a3b8',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            transition: 'all 0.2s'
                        }}
                    >
                        <tab.icon /> {tab.label}
                        <span style={{ background: activeTab === tab.id ? tab.color : '#f1f5f9', color: activeTab === tab.id ? 'white' : '#94a3b8', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem' }}>
                            {posts.filter(p => (tab.id === 'published' ? p.status === 'published' : tab.id === 'pending' ? p.status === 'pending' : (p.status === 'draft' || !p.status))).length}
                        </span>
                    </button>
                ))}
            </div>

            {/* LIST */}
            <div style={styles.grid}>
                <AnimatePresence>
                    {filteredPosts.map(post => (
                        <motion.div
                            key={post.id}
                            layout
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            style={styles.card}
                            onClick={() => { setCurrentPost(post); setIsEditorOpen(true); }}
                            whileHover={{ y: -4, boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                        >
                            <div style={{ height: '200px', background: '#f1f5f9', position: 'relative' }}>
                                {post.image ? (
                                    <img src={post.image} alt={post.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#cbd5e1' }}><FaImage size={48} /></div>
                                )}
                                <div style={{ position: 'absolute', top: '12px', right: '12px', ...styles.statusBadge(post.status) }}>
                                    {post.status?.toUpperCase() || 'DRAFT'}
                                </div>
                            </div>
                            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-primary)', textTransform: 'uppercase', marginBottom: '8px' }}>
                                    {post.category}
                                </div>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1e293b', marginBottom: '12px', lineHeight: 1.3, flex: 1 }}>{post.title || 'Untitled Story'}</h3>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #f1f5f9', gap: '10px' }}>
                                    <span style={{ fontSize: '0.85rem', color: '#94a3b8', minWidth: '80px' }}>{post.date}</span>

                                    <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                                        {/* View/Hide Toggle */}
                                        <button
                                            onClick={(e) => handleToggleStatus(post, e)}
                                            style={{
                                                padding: '8px',
                                                color: post.status === 'published' ? '#166534' : '#64748b',
                                                background: post.status === 'published' ? '#dcfce7' : '#f1f5f9',
                                                borderRadius: '6px',
                                                border: 'none',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                width: '32px',
                                                height: '32px'
                                            }}
                                            title={post.status === 'published' ? "Hide from site" : "Make visible on site"}
                                        >
                                            {post.status === 'published' ? <FaEye size={14} /> : <FaEyeSlash size={14} />}
                                        </button>

                                        {/* Edit Button */}
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setCurrentPost(post); setIsEditorOpen(true); }}
                                            style={{
                                                padding: '8px',
                                                color: '#005baa',
                                                background: '#e0f2ff',
                                                borderRadius: '6px',
                                                border: 'none',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                width: '32px',
                                                height: '32px'
                                            }}
                                            title="Edit Story"
                                        >
                                            <FaEdit size={14} />
                                        </button>

                                        {/* Delete Button */}
                                        <button
                                            onClick={(e) => handleDelete(post.id, e)}
                                            style={{
                                                padding: '8px',
                                                color: '#ef4444',
                                                background: '#fef2f2',
                                                borderRadius: '6px',
                                                border: 'none',
                                                cursor: 'pointer',
                                                transition: 'background 0.2s',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                width: '32px',
                                                height: '32px'
                                            }}
                                            title="Delete"
                                        >
                                            <FaTrash size={14} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            <AnimatePresence>
                {isEditorOpen && renderEditor()}
            </AnimatePresence>
        </div>
    );
};

export default AdminBlog;

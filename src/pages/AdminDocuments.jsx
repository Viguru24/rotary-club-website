import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getDocuments, saveDocument, deleteDocument, generateShareLink } from '../services/documentService';
import { FaPlus, FaFilePdf, FaFileWord, FaFileImage, FaFileAlt, FaDownload, FaTrash, FaSearch, FaCloudUploadAlt, FaShareAlt, FaTag, FaHistory, FaExclamationTriangle, FaThLarge, FaList, FaTimes, FaWhatsapp, FaEnvelope, FaLink, FaMobileAlt, FaFolder, FaFolderOpen, FaEye } from 'react-icons/fa';
import { useUI } from '../context/UIContext';

const AdminDocuments = () => {
    const { showToast, confirmAction } = useUI();
    const [docs, setDocs] = useState([]);
    const [activeCategory, setActiveCategory] = useState('All');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
    const [previewDoc, setPreviewDoc] = useState(null);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [selectedDocToShare, setSelectedDocToShare] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState('grid');
    const [newDoc, setNewDoc] = useState({ title: '', category: 'General', type: 'pdf' });
    const [isDragging, setIsDragging] = useState(false);

    useEffect(() => {
        const fetchDocs = () => setDocs(getDocuments());
        fetchDocs();
        window.addEventListener('docs-updated', fetchDocs);
        return () => window.removeEventListener('docs-updated', fetchDocs);
    }, []);

    const handleSave = (e) => {
        e.preventDefault();
        saveDocument(newDoc);
        setIsModalOpen(false);
        setNewDoc({ title: '', category: 'General', type: 'pdf' });
        showToast('Document uploaded successfully', 'success');
    };

    const handleDelete = (id) => {
        confirmAction(
            'Are you sure you want to permanently delete this document?',
            () => {
                deleteDocument(id);
                showToast('Document deleted', 'success');
            },
            'Delete Document',
            true
        );
    };

    const getFileIcon = (type) => {
        switch (type?.toLowerCase()) {
            case 'pdf': return <FaFilePdf color="#ef4444" />;
            case 'docx':
            case 'doc': return <FaFileWord color="#3b82f6" />;
            case 'jpg':
            case 'png': return <FaFileImage color="#10b981" />;
            case 'csv': return <FaFileAlt color="#10b981" />;
            default: return <FaFileAlt color="#9ca3af" />;
        }
    };

    const openShareModal = (doc) => {
        setSelectedDocToShare(doc);
        setIsShareModalOpen(true);
    };

    const openPreviewModal = (doc) => {
        setPreviewDoc(doc);
        setIsPreviewModalOpen(true);
    };

    // --- Sharing Logic ---
    const handleCopyLink = () => {
        if (!selectedDocToShare) return;
        const link = generateShareLink(selectedDocToShare.id);
        navigator.clipboard.writeText(link);
        showToast('Link copied!', 'success');
        setIsShareModalOpen(false);
    };

    const handleWhatsAppShare = () => {
        if (!selectedDocToShare) return;
        const link = generateShareLink(selectedDocToShare.id);
        const text = encodeURIComponent(`Check out: ${selectedDocToShare.title}`);
        window.open(`https://wa.me/?text=${text}%20${encodeURIComponent(link)}`, '_blank');
        setIsShareModalOpen(false);
    };

    const handleEmailShare = () => {
        if (!selectedDocToShare) return;
        const link = generateShareLink(selectedDocToShare.id);
        const subject = encodeURIComponent(`Shared: ${selectedDocToShare.title}`);
        const body = encodeURIComponent(`I'm sharing this document: ${selectedDocToShare.title}\n\nLink: ${link}`);
        window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
        setIsShareModalOpen(false);
    };

    const handleNativeShare = async () => {
        if (!selectedDocToShare) return;
        const link = generateShareLink(selectedDocToShare.id);
        if (navigator.share) {
            try {
                await navigator.share({ title: selectedDocToShare.title, text: `Check out: ${selectedDocToShare.title}`, url: link });
                showToast('Shared successfully', 'success');
            } catch (error) { console.log('Error sharing:', error); }
        } else {
            showToast('Native sharing not supported', 'error');
        }
        setIsShareModalOpen(false);
    };

    const isExpiringSoon = (dateStr) => {
        if (!dateStr) return false;
        const days = (new Date(dateStr) - new Date()) / (1000 * 60 * 60 * 24);
        return days < 30 && days > 0;
    };

    // --- Smart Categories Logic ---
    const categories = ['All', ...new Set(docs.map(d => d.category))];
    const getCategoryCount = (cat) => cat === 'All' ? docs.length : docs.filter(d => d.category === cat).length;

    const filteredDocs = docs.filter(d => {
        const matchesSearch = d.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = activeCategory === 'All' || d.category === activeCategory;
        return matchesSearch && matchesCategory;
    });

    // --- Global Drag & Drop Handlers ---
    const handleGlobalDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleGlobalDragLeave = (e) => {
        e.preventDefault();
        // Simple check to prevent flicker when dragging over children
        if (e.currentTarget.contains(e.relatedTarget)) return;
        setIsDragging(false);
    };

    const handleGlobalDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) processFile(file);
    };

    const processFile = (file) => {
        const name = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
        const ext = file.name.split('.').pop().toLowerCase();
        let type = 'pdf';
        if (['doc', 'docx'].includes(ext)) type = 'docx';
        if (['jpg', 'jpeg', 'png', 'webp'].includes(ext)) type = 'jpg';
        if (['csv', 'xls', 'xlsx'].includes(ext)) type = 'csv';

        setNewDoc({ title: name, category: 'General', type: type });
        setIsModalOpen(true);
        showToast('File detected! Confirm details to save.', 'info');
    };

    return (
        <div
            style={{ maxWidth: '100%', height: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column' }}
            onDragOver={handleGlobalDragOver}
            onDragLeave={handleGlobalDragLeave}
            onDrop={handleGlobalDrop}
        >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexShrink: 0 }}>
                <div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#111827', lineHeight: 1.2 }}>Smart Documents</h1>
                    <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>AI-powered storage • {docs.length} files stored</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    style={{
                        padding: '10px 20px', background: 'var(--accent-primary)', color: 'white',
                        border: 'none', borderRadius: '10px', fontWeight: 600, cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'
                    }}
                >
                    <FaCloudUploadAlt size={18} /> <span className="desktop-only">Upload</span>
                </button>
            </div>

            {/* Main Content Area: Sidebar + Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(200px, 250px) 1fr', gap: '20px', flex: 1, overflow: 'hidden' }} className="responsive-grid">

                {/* 1. Smart Sidebar */}
                <aside style={{ background: 'white', borderRadius: '16px', padding: '16px', border: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto' }} className="doc-sidebar">
                    <h3 style={{ fontSize: '0.8rem', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', marginBottom: '8px', paddingLeft: '8px' }}>Folders</h3>
                    {categories.map(cat => (
                        <div
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            style={{
                                padding: '10px 12px', borderRadius: '8px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                background: activeCategory === cat ? '#eff6ff' : 'transparent',
                                color: activeCategory === cat ? 'var(--accent-primary)' : '#4b5563',
                                fontWeight: activeCategory === cat ? 600 : 500,
                                transition: 'background 0.2s'
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                {activeCategory === cat ? <FaFolderOpen /> : <FaFolder />}
                                {cat}
                            </div>
                            <span style={{ fontSize: '0.75rem', background: activeCategory === cat ? 'white' : '#f3f4f6', padding: '2px 6px', borderRadius: '99px', minWidth: '20px', textAlign: 'center' }}>
                                {getCategoryCount(cat)}
                            </span>
                        </div>
                    ))}

                    <div style={{ marginTop: 'auto', background: '#f8fafc', padding: '12px', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
                        <p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>Storage Status</p>
                        <div style={{ height: '6px', width: '100%', background: '#e2e8f0', borderRadius: '99px', overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: '45%', background: 'var(--accent-primary)' }}></div>
                        </div>
                        <p style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '4px' }}>4.2 GB of 10 GB used</p>
                    </div>
                </aside>

                {/* Right Content */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', overflow: 'hidden' }}>

                    {/* Search & Toggle Bar */}
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <div style={{ flex: 1, background: 'white', padding: '8px 16px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '10px', border: '1px solid #e5e7eb' }}>
                            <FaSearch color="#9ca3af" />
                            <input
                                type="text"
                                placeholder={`Search in ${activeCategory}...`}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{ border: 'none', outline: 'none', width: '100%', fontSize: '0.9rem' }}
                            />
                        </div>
                        <div style={{ background: 'white', padding: '4px', borderRadius: '10px', border: '1px solid #e5e7eb', display: 'flex', gap: '2px' }}>
                            <button onClick={() => setViewMode('grid')} style={{ padding: '8px', borderRadius: '8px', border: 'none', cursor: 'pointer', background: viewMode === 'grid' ? '#eff6ff' : 'transparent', color: viewMode === 'grid' ? 'var(--accent-primary)' : '#6b7280' }}><FaThLarge size={16} /></button>
                            <button onClick={() => setViewMode('list')} style={{ padding: '8px', borderRadius: '8px', border: 'none', cursor: 'pointer', background: viewMode === 'list' ? '#eff6ff' : 'transparent', color: viewMode === 'list' ? 'var(--accent-primary)' : '#6b7280' }}><FaList size={16} /></button>
                        </div>
                    </div>

                    {/* Scrollable Grid/List */}
                    <div style={{ overflowY: 'auto', overflowX: 'hidden', paddingBottom: '20px', flex: 1, paddingRight: '4px' }} className="custom-scrollbar">
                        {filteredDocs.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>
                                <FaFolderOpen size={48} style={{ opacity: 0.2, marginBottom: '10px' }} />
                                <p>No documents found in this folder.</p>
                            </div>
                        ) : viewMode === 'grid' ? (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '15px' }}>
                                {filteredDocs.map((doc, index) => (
                                    <motion.div
                                        key={doc.id}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        layout
                                        style={{ background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', padding: '16px', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}
                                        className="hover:shadow-md transition-shadow"
                                    >
                                        {isExpiringSoon(doc.expiryDate) && (
                                            <div style={{ position: 'absolute', top: 0, right: 0, background: '#fee2e2', color: '#ef4444', fontSize: '0.65rem', fontWeight: 700, padding: '2px 8px', borderBottomLeftRadius: '8px' }}>EXPIRING</div>
                                        )}
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                                            <div style={{ padding: '10px', background: '#f8fafc', borderRadius: '10px', fontSize: '1.5rem' }}>{getFileIcon(doc.type)}</div>
                                            <button onClick={() => openPreviewModal(doc)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#64748b' }} title="Quick Preview"><FaEye /></button>
                                        </div>
                                        <h3 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#1f2937', marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={doc.title}>{doc.title}</h3>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#6b7280', marginTop: 'auto', paddingTop: '8px', borderTop: '1px solid #f1f5f9' }}>
                                            <span>{doc.size}</span>
                                            <span>{doc.date}</span>
                                        </div>
                                        <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                                            <button onClick={() => openShareModal(doc)} style={{ flex: 1, padding: '6px', fontSize: '0.75rem', border: '1px solid #dbeafe', borderRadius: '6px', background: '#eff6ff', color: '#3b82f6', cursor: 'pointer' }}>Share</button>
                                            <button onClick={() => handleDelete(doc.id)} style={{ padding: '6px 8px', border: 'none', borderRadius: '6px', background: '#fef2f2', color: '#ef4444', cursor: 'pointer' }}><FaTrash size={12} /></button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', borderRadius: '12px', overflow: 'hidden' }}>
                                <thead style={{ background: '#f9fafb', fontSize: '0.8rem', color: '#6b7280', textAlign: 'left' }}>
                                    <tr>
                                        <th style={{ padding: '12px' }}>Name</th>
                                        <th style={{ padding: '12px' }}>Type</th>
                                        <th style={{ padding: '12px' }}>Size</th>
                                        <th style={{ padding: '12px', textAlign: 'right' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredDocs.map(doc => (
                                        <tr key={doc.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                            <td style={{ padding: '12px', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 500, fontSize: '0.9rem' }}>
                                                {getFileIcon(doc.type)} {doc.title}
                                            </td>
                                            <td style={{ padding: '12px', fontSize: '0.85rem', color: '#64748b' }}>{doc.category}</td>
                                            <td style={{ padding: '12px', fontSize: '0.85rem', color: '#64748b' }}>{doc.size}</td>
                                            <td style={{ padding: '12px', textAlign: 'right', display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                                <button onClick={() => openPreviewModal(doc)} style={{ padding: '6px', border: 'none', cursor: 'pointer', color: '#64748b' }}><FaEye /></button>
                                                <button onClick={() => openShareModal(doc)} style={{ padding: '6px', border: 'none', cursor: 'pointer', color: '#3b82f6' }}><FaShareAlt /></button>
                                                <button onClick={() => handleDelete(doc.id)} style={{ padding: '6px', border: 'none', cursor: 'pointer', color: '#ef4444' }}><FaTrash /></button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>

            {/* 2. Global Drag & Drop Overlay */}
            <AnimatePresence>
                {isDragging && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        style={{ position: 'absolute', inset: 0, background: 'rgba(59, 130, 246, 0.9)', zIndex: 200, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'white' }}
                    >
                        <FaCloudUploadAlt size={64} style={{ marginBottom: '20px' }} />
                        <h2 style={{ fontSize: '2rem', fontWeight: 800 }}>Drop to Upload</h2>
                        <p>Release anywhere to add to {activeCategory}</p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* 3. Quick Preview Modal */}
            <AnimatePresence>
                {isPreviewModalOpen && previewDoc && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={() => setIsPreviewModalOpen(false)}
                        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 170 }}
                    >
                        <motion.div
                            initial={{ scale: 0.95 }} animate={{ scale: 1 }}
                            onClick={e => e.stopPropagation()}
                            style={{ background: 'white', borderRadius: '16px', width: '90%', maxWidth: '800px', height: '80vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
                        >
                            <div style={{ padding: '16px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h3 style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '10px' }}>{getFileIcon(previewDoc.type)} {previewDoc.title}</h3>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <a href={previewDoc.url} download className="btn-primary" style={{ padding: '8px 16px', borderRadius: '8px', background: '#3b82f6', color: 'white', textDecoration: 'none', fontSize: '0.9rem' }}>Download</a>
                                    <button onClick={() => setIsPreviewModalOpen(false)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '1.2rem', color: '#64748b' }}><FaTimes /></button>
                                </div>
                            </div>
                            <div style={{ flex: 1, background: '#f8fafc', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {/* Mock Preview Logic */}
                                {previewDoc.type === 'pdf' ? (
                                    <iframe src={previewDoc.url} style={{ width: '100%', height: '100%', border: 'none' }} title="PDF Preview"></iframe>
                                ) : ['jpg', 'png', 'jpeg'].includes(previewDoc.type) ? (
                                    <img src={previewDoc.url} alt="Preview" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                                ) : (
                                    <div style={{ textAlign: 'center', color: '#64748b' }}>
                                        <FaFileAlt size={64} />
                                        <p style={{ marginTop: '16px' }}>Preview not available for this file type.</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Share Modal */}
            <AnimatePresence>
                {isShareModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={() => setIsShareModalOpen(false)}
                        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 160 }}
                    >
                        <motion.div
                            initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
                            onClick={e => e.stopPropagation()}
                            style={{ background: 'white', borderRadius: '24px', width: '100%', maxWidth: '400px', overflow: 'hidden', padding: '30px', textAlign: 'center' }}
                        >
                            <div style={{ marginBottom: '20px' }}>
                                <div style={{ width: '60px', height: '60px', background: '#f0f9ff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px auto' }}>
                                    <FaShareAlt size={24} color="var(--accent-primary)" />
                                </div>
                                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0 0 10px 0' }}>Share Document</h2>
                                <p style={{ color: '#6b7280', margin: 0 }}>Select how you'd like to share <br /><strong>"{selectedDocToShare?.title}"</strong></p>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                <button onClick={handleCopyLink} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '16px', cursor: 'pointer', transition: 'all 0.2s', gap: '10px' }}>
                                    <FaLink size={24} color="#4b5563" />
                                    <span style={{ fontWeight: 600, color: '#374151' }}>Copy Link</span>
                                </button>
                                <button onClick={handleWhatsAppShare} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px', background: '#f0fdf4', border: '1px solid #dcfce7', borderRadius: '16px', cursor: 'pointer', transition: 'all 0.2s', gap: '10px' }}>
                                    <FaWhatsapp size={24} color="#16a34a" />
                                    <span style={{ fontWeight: 600, color: '#166534' }}>WhatsApp</span>
                                </button>
                            </div>

                            <button onClick={() => setIsShareModalOpen(false)} style={{ marginTop: '25px', background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', fontWeight: 500 }}>Cancel</button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Upload Modal (Reused) */}
            <AnimatePresence>
                {isModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 150 }}
                    >
                        <motion.div
                            initial={{ scale: 0.95 }} animate={{ scale: 1 }}
                            style={{ background: 'white', borderRadius: '20px', width: '100%', maxWidth: '500px', overflow: 'hidden', padding: '24px' }}>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '20px' }}>Save Document</h2>
                            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 500, marginBottom: '6px', color: '#374151' }}>Title</label>
                                    <input type="text" required value={newDoc.title} onChange={e => setNewDoc({ ...newDoc, title: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db' }} />
                                </div>
                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <button type="button" onClick={() => setIsModalOpen(false)} style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db', background: 'white', cursor: 'pointer' }}>Cancel</button>
                                    <button type="submit" style={{ flex: 1, padding: '12px', borderRadius: '8px', border: 'none', background: 'var(--accent-primary)', color: 'white', fontWeight: 600, cursor: 'pointer' }}>Save</button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Styles for responsiveness */}
            <style>{`
                @media (max-width: 1000px) {
                    .responsive-grid { grid-template-columns: 1fr !important; }
                    .doc-sidebar { display: none !important; }
                    .desktop-only { display: none; }
                }
            `}</style>
        </div>
    );
};

export default AdminDocuments;

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getDocuments, saveDocument, deleteDocument, generateShareLink } from '../services/documentService';
import { FaPlus, FaFilePdf, FaFileWord, FaFileImage, FaFileAlt, FaDownload, FaTrash, FaSearch, FaCloudUploadAlt, FaShareAlt, FaTag, FaHistory, FaExclamationTriangle, FaThLarge, FaList, FaTimes, FaWhatsapp, FaEnvelope, FaLink, FaMobileAlt } from 'react-icons/fa';
import { useUI } from '../context/UIContext';

const AdminDocuments = () => {
    const { showToast, confirmAction } = useUI();
    const [docs, setDocs] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [selectedDocToShare, setSelectedDocToShare] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
    const [newDoc, setNewDoc] = useState({ title: '', category: 'General', type: 'pdf' });

    useEffect(() => {
        const fetchDocs = () => setDocs(getDocuments());
        fetchDocs();

        // Listen for updates from service
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

    const handleCopyLink = () => {
        if (!selectedDocToShare) return;
        const link = generateShareLink(selectedDocToShare.id);
        navigator.clipboard.writeText(link);
        showToast('Link copied to clipboard!', 'success');
        setIsShareModalOpen(false);
    };

    const handleWhatsAppShare = () => {
        if (!selectedDocToShare) return;
        const link = generateShareLink(selectedDocToShare.id);
        const text = encodeURIComponent(`Check out this document: ${selectedDocToShare.title}`);
        const url = encodeURIComponent(link);
        window.open(`https://wa.me/?text=${text}%20${url}`, '_blank');
        setIsShareModalOpen(false);
    };

    const handleEmailShare = () => {
        if (!selectedDocToShare) return;
        const link = generateShareLink(selectedDocToShare.id);
        const subject = encodeURIComponent(`Document Shared: ${selectedDocToShare.title}`);
        const body = encodeURIComponent(`I'm sharing this document with you: ${selectedDocToShare.title}\n\nLink: ${link}`);
        window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
        setIsShareModalOpen(false);
    };

    const handleNativeShare = async () => {
        if (!selectedDocToShare) return;
        const link = generateShareLink(selectedDocToShare.id);
        if (navigator.share) {
            try {
                await navigator.share({
                    title: selectedDocToShare.title,
                    text: `Check out this document: ${selectedDocToShare.title}`,
                    url: link,
                });
                showToast('Shared successfully', 'success');
            } catch (error) {
                console.log('Error sharing:', error);
            }
        } else {
            showToast('Native sharing not supported on this device', 'error');
        }
        setIsShareModalOpen(false);
    };

    const isExpiringSoon = (dateStr) => {
        if (!dateStr) return false;
        const days = (new Date(dateStr) - new Date()) / (1000 * 60 * 60 * 24);
        return days < 30 && days > 0;
    };

    const filteredDocs = docs.filter(d => d.title.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            {/* Header */}
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 700, color: '#111827', lineHeight: 1.2 }}>Smart Document Hub</h1>
                    <p style={{ color: '#6b7280' }}>AI-powered storage with auto-tagging and expiry tracking.</p>
                </div>
                <button
                    className="desktop-only-btn"
                    onClick={() => setIsModalOpen(true)}
                    style={{
                        padding: '12px 25px', background: 'var(--accent-primary)', color: 'white',
                        border: 'none', borderRadius: '12px', fontWeight: 600, cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.01)'
                    }}
                >
                    <FaCloudUploadAlt size={18} /> Upload Document
                </button>
            </div>

            {/* Mobile Floating Action Button (FAB) */}
            <button
                className="mobile-fab"
                onClick={() => setIsModalOpen(true)}
                style={{
                    position: 'fixed', bottom: '30px', right: '30px', width: '64px', height: '64px', borderRadius: '50%',
                    background: 'var(--accent-primary)', color: 'white', border: 'none',
                    boxShadow: '0 10px 25px -5px rgba(0, 91, 170, 0.5)', zIndex: 90,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
                }}
            >
                <FaCloudUploadAlt size={24} />
            </button>

            <style>{`
                @media (max-width: 768px) {
                    .desktop-only-btn { display: none !important; }
                }
                @media (min-width: 769px) {
                    .mobile-fab { display: none !important; }
                }
            `}</style>

            {/* Controls Bar */}
            <div style={{ display: 'flex', gap: '15px', marginBottom: '30px', flexWrap: 'wrap' }}>
                {/* Search */}
                <div style={{ flex: 1, background: 'white', padding: '12px 20px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '10px', border: '1px solid #e5e7eb', minWidth: '250px' }}>
                    <FaSearch color="#9ca3af" />
                    <input
                        type="text"
                        placeholder="Search by title, tag, or content..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ border: 'none', outline: 'none', width: '100%', fontSize: '0.95rem' }}
                    />
                    {searchTerm && (
                        <button
                            onClick={() => setSearchTerm('')}
                            style={{
                                background: '#f3f4f6',
                                border: 'none',
                                cursor: 'pointer',
                                color: '#6b7280',
                                borderRadius: '50%',
                                width: '24px',
                                height: '24px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'background 0.2s'
                            }}
                            title="Clear Search"
                        >
                            <FaTimes size={12} />
                        </button>
                    )}
                </div>

                {/* View Toggles */}
                <div style={{ background: 'white', padding: '6px', borderRadius: '12px', border: '1px solid #e5e7eb', display: 'flex', gap: '5px' }}>
                    <button
                        onClick={() => setViewMode('grid')}
                        style={{
                            padding: '10px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                            background: viewMode === 'grid' ? '#eff6ff' : 'transparent',
                            color: viewMode === 'grid' ? 'var(--accent-primary)' : '#6b7280'
                        }}
                        title="Grid View"
                    >
                        <FaThLarge size={18} />
                    </button>
                    <button
                        onClick={() => setViewMode('list')}
                        style={{
                            padding: '10px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                            background: viewMode === 'list' ? '#eff6ff' : 'transparent',
                            color: viewMode === 'list' ? 'var(--accent-primary)' : '#6b7280'
                        }}
                        title="List View"
                    >
                        <FaList size={18} />
                    </button>
                </div>
            </div>

            {/* Documents - Grid View */}
            {viewMode === 'grid' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                    {filteredDocs.map((doc, index) => (
                        <motion.div
                            key={doc.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.05 }}
                            style={{ background: 'white', borderRadius: '16px', border: '1px solid #e5e7eb', padding: '20px', display: 'flex', flexDirection: 'column', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)', position: 'relative', overflow: 'hidden' }}
                        >
                            {/* Smart Badge: Expiry */}
                            {isExpiringSoon(doc.expiryDate) && (
                                <div style={{ position: 'absolute', top: 0, right: 0, background: '#fef2f2', color: '#ef4444', fontSize: '0.7rem', fontWeight: 700, padding: '4px 10px', borderBottomLeftRadius: '10px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <FaExclamationTriangle /> EXPIRES SOON
                                </div>
                            )}

                            <div style={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between', marginBottom: '15px' }}>
                                <div style={{ padding: '12px', background: '#f3f4f6', borderRadius: '12px', fontSize: '1.5rem', position: 'relative' }}>
                                    {getFileIcon(doc.type)}
                                    <div style={{ position: 'absolute', bottom: '-5px', right: '-5px', background: 'white', border: '1px solid #e5e7eb', fontSize: '0.6rem', padding: '2px 4px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '2px', fontWeight: 600 }}>
                                        <FaHistory size={8} /> v{doc.version || 1}
                                    </div>
                                </div>
                                <span style={{ fontSize: '0.75rem', fontWeight: 600, background: '#f0f9ff', color: '#0369a1', padding: '4px 8px', borderRadius: '6px' }}>{doc.category?.toUpperCase() || 'DOC'}</span>
                            </div>

                            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#1f2937', marginBottom: '8px', flex: 1 }}>{doc.title}</h3>

                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '15px' }}>
                                {doc.tags?.length > 0 ? doc.tags.map(tag => (
                                    <span key={tag} style={{ fontSize: '0.7rem', background: '#f9fafb', border: '1px solid #e5e7eb', padding: '2px 6px', borderRadius: '4px', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '3px' }}>
                                        <FaTag size={8} /> {tag}
                                    </span>
                                )) : <span style={{ fontSize: '0.7rem', color: '#9ca3af', fontStyle: 'italic' }}>AI analyzing content...</span>}
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#6b7280', marginBottom: '20px', borderTop: '1px solid #f3f4f6', paddingTop: '10px' }}>
                                <span>{doc.date}</span>
                                <span>{doc.size}</span>
                            </div>

                            <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
                                <button onClick={() => openShareModal(doc)} style={{ padding: '8px 12px', border: '1px solid #dbeafe', borderRadius: '8px', background: doc.shared ? '#eff6ff' : 'white', color: '#3b82f6', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontWeight: 500, flex: 1 }}>
                                    <FaShareAlt size={14} /> {doc.shared ? 'Shared' : 'Share'}
                                </button>
                                <a href={doc.url} download target="_blank" rel="noopener noreferrer" style={{ padding: '8px', border: '1px solid #e5e7eb', borderRadius: '8px', background: 'white', color: '#4b5563', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <FaDownload size={14} />
                                </a>
                                <button onClick={() => handleDelete(doc.id)} style={{ padding: '8px 12px', border: '1px solid #fee2e2', borderRadius: '8px', background: '#fef2f2', color: '#ef4444', cursor: 'pointer' }}>
                                    <FaTrash size={14} />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Documents - List View */}
            {viewMode === 'list' && (
                <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #e5e7eb', overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb', fontSize: '0.85rem', color: '#6b7280', textTransform: 'uppercase' }}>
                            <tr>
                                <th style={{ padding: '16px' }}>Name</th>
                                <th style={{ padding: '16px' }}>Category</th>
                                <th style={{ padding: '16px' }}>Size</th>
                                <th style={{ padding: '16px' }}>Modified</th>
                                <th style={{ padding: '16px', textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredDocs.map((doc, index) => (
                                <motion.tr
                                    key={doc.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: index * 0.03 }}
                                    style={{ borderBottom: '1px solid #f3f4f6' }}
                                >
                                    <td style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                                        <div style={{ fontSize: '1.2rem' }}>{getFileIcon(doc.type)}</div>
                                        <div>
                                            <div style={{ fontWeight: 600, color: '#1f2937' }}>{doc.title}</div>
                                            <div style={{ fontSize: '0.8rem', color: '#9ca3af' }}>v{doc.version || 1} • {doc.tags?.join(', ')}</div>
                                        </div>
                                    </td>
                                    <td style={{ padding: '16px' }}>
                                        <span style={{ fontSize: '0.8rem', fontWeight: 600, background: '#f0f9ff', color: '#0369a1', padding: '4px 8px', borderRadius: '6px' }}>{doc.category}</span>
                                    </td>
                                    <td style={{ padding: '16px', color: '#6b7280', fontSize: '0.9rem' }}>{doc.size}</td>
                                    <td style={{ padding: '16px', color: '#6b7280', fontSize: '0.9rem' }}>
                                        {doc.date}
                                        {isExpiringSoon(doc.expiryDate) && <span style={{ display: 'block', fontSize: '0.7rem', color: '#ef4444', fontWeight: 'bold' }}>Expiring Soon</span>}
                                    </td>
                                    <td style={{ padding: '16px', textAlign: 'right' }}>
                                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                            <button onClick={() => openShareModal(doc)} style={{ padding: '8px', borderRadius: '8px', border: '1px solid #dbeafe', background: doc.shared ? '#eff6ff' : 'white', color: '#3b82f6', cursor: 'pointer' }} title="Share">
                                                <FaShareAlt />
                                            </button>
                                            <a href={doc.url} download target="_blank" rel="noopener noreferrer" style={{ padding: '8px', borderRadius: '8px', border: '1px solid #e5e7eb', background: 'white', color: '#4b5563', cursor: 'pointer' }} title="Download">
                                                <FaDownload />
                                            </a>
                                            <button onClick={() => handleDelete(doc.id)} style={{ padding: '8px', borderRadius: '8px', border: '1px solid #fee2e2', background: '#fef2f2', color: '#ef4444', cursor: 'pointer' }} title="Delete">
                                                <FaTrash />
                                            </button>
                                        </div>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                    {filteredDocs.length === 0 && (
                        <div style={{ padding: '40px', textAlign: 'center', color: '#9ca3af' }}>No documents found matching your search.</div>
                    )}
                </div>
            )}

            {/* Upload Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 150 }}
                    >
                        <motion.div
                            initial={{ scale: 0.95 }} animate={{ scale: 1 }}
                            style={{ background: 'white', borderRadius: '20px', width: '100%', maxWidth: '500px', overflow: 'hidden' }}
                        >
                            <div style={{ padding: '24px', borderBottom: '1px solid #e5e7eb' }}>
                                <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Upload New Document</h2>
                            </div>
                            <form onSubmit={handleSave} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

                                {/* Drag & Drop Zone */}
                                <div
                                    onClick={() => document.getElementById('file-upload-input').click()}
                                    onDragOver={(e) => { e.preventDefault(); e.currentTarget.style.borderColor = 'var(--accent-primary)'; e.currentTarget.style.background = '#eff6ff'; }}
                                    onDragLeave={(e) => { e.preventDefault(); e.currentTarget.style.borderColor = '#d1d5db'; e.currentTarget.style.background = '#f9fafb'; }}
                                    onDrop={(e) => {
                                        e.preventDefault();
                                        e.currentTarget.style.borderColor = '#d1d5db';
                                        e.currentTarget.style.background = '#f9fafb';
                                        const file = e.dataTransfer.files[0];
                                        if (file) {
                                            const name = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
                                            const ext = file.name.split('.').pop().toLowerCase();
                                            let type = 'pdf';
                                            if (['doc', 'docx'].includes(ext)) type = 'docx';
                                            if (['jpg', 'jpeg', 'png', 'webp'].includes(ext)) type = 'jpg';
                                            if (['csv', 'xls', 'xlsx'].includes(ext)) type = 'csv';

                                            setNewDoc({ ...newDoc, title: name, type: type });
                                            showToast('File info auto-detected!', 'success');
                                        }
                                    }}
                                    style={{ border: '2px dashed #d1d5db', padding: '30px', borderRadius: '12px', textAlign: 'center', cursor: 'pointer', background: '#f9fafb', transition: 'all 0.2s' }}
                                >
                                    <input
                                        type="file"
                                        id="file-upload-input"
                                        style={{ display: 'none' }}
                                        onChange={(e) => {
                                            const file = e.target.files[0];
                                            if (file) {
                                                const name = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
                                                const ext = file.name.split('.').pop().toLowerCase();
                                                let type = 'pdf';
                                                if (['doc', 'docx'].includes(ext)) type = 'docx';
                                                if (['jpg', 'jpeg', 'png', 'webp'].includes(ext)) type = 'jpg';
                                                if (['csv', 'xls', 'xlsx'].includes(ext)) type = 'csv';

                                                setNewDoc({ ...newDoc, title: name, type: type });
                                                showToast('File info auto-detected!', 'success');
                                            }
                                        }}
                                    />
                                    <FaCloudUploadAlt size={32} color="#9ca3af" />
                                    <p style={{ marginTop: '10px', color: '#6b7280', fontSize: '0.9rem' }}>Click or Drag file to upload</p>
                                    <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '5px' }}>Supports PDF, Word, Images, CSV</p>
                                </div>

                                <div style={{ height: '1px', background: '#e5e7eb', margin: '5px 0' }}></div>

                                <div>
                                    <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 500, marginBottom: '6px', color: '#374151' }}>Document Title</label>
                                    <input type="text" required value={newDoc.title} onChange={e => setNewDoc({ ...newDoc, title: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db' }} placeholder="e.g., AGM Minutes" />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 500, marginBottom: '6px', color: '#374151' }}>File Type</label>
                                    <select value={newDoc.type} onChange={e => setNewDoc({ ...newDoc, type: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db' }}>
                                        <option value="pdf">PDF Document</option>
                                        <option value="docx">Word Document</option>
                                        <option value="jpg">Image (JPG/PNG)</option>
                                        <option value="csv">Data File (CSV)</option>
                                    </select>
                                </div>

                                <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                                    <button type="button" onClick={() => setIsModalOpen(false)} style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db', background: 'white', cursor: 'pointer' }}>Cancel</button>
                                    <button type="submit" style={{ flex: 1, padding: '12px', borderRadius: '8px', border: 'none', background: 'var(--accent-primary)', color: 'white', fontWeight: 600, cursor: 'pointer' }}>Save Document</button>
                                </div>
                            </form>
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
                                <button onClick={handleEmailShare} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px', background: '#eff6ff', border: '1px solid #dbeafe', borderRadius: '16px', cursor: 'pointer', transition: 'all 0.2s', gap: '10px' }}>
                                    <FaEnvelope size={24} color="#3b82f6" />
                                    <span style={{ fontWeight: 600, color: '#1e40af' }}>Email</span>
                                </button>
                                <button onClick={handleNativeShare} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px', background: '#fff7ed', border: '1px solid #ffedd5', borderRadius: '16px', cursor: 'pointer', transition: 'all 0.2s', gap: '10px' }}>
                                    <FaMobileAlt size={24} color="#f97316" />
                                    <span style={{ fontWeight: 600, color: '#9a3412' }}>More</span>
                                </button>
                            </div>

                            <button
                                onClick={() => setIsShareModalOpen(false)}
                                style={{ marginTop: '25px', background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', fontWeight: 500 }}
                            >
                                Cancel
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <style>{`
                button:hover {
                    opacity: 0.9;
                    transform: translateY(-1px);
                }
                button:active {
                    transform: translateY(0);
                }
            `}</style>
        </div>
    );
};

export default AdminDocuments;

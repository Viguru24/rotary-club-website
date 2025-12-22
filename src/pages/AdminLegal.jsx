import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getLegals, saveLegals } from '../services/legalService';
import { FaSave, FaEye, FaCode } from 'react-icons/fa';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

const AdminLegal = () => {
    const [legals, setLegals] = useState(null);
    const [activeTab, setActiveTab] = useState('privacyPolicy');
    const [statusMessage, setStatusMessage] = useState('');

    useEffect(() => {
        setLegals(getLegals());
    }, []);

    const handleSave = () => {
        saveLegals(legals);
        setStatusMessage('Changes saved successfully!');
        setTimeout(() => setStatusMessage(''), 3000);
    };

    const handleContentChange = (content) => {
        setLegals({
            ...legals,
            [activeTab]: {
                ...legals[activeTab],
                content: content
            }
        });
    };

    if (!legals) return <div className="p-10">Loading...</div>;

    const styles = {
        container: { maxWidth: '1200px', margin: '0 auto', color: '#1f2937' },
        header: { marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
        title: { fontSize: '2rem', fontWeight: 700, color: '#111827' },
        tabs: { display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '1px solid #e5e7eb', paddingBottom: '1px' },
        tab: (isActive) => ({
            padding: '12px 24px',
            cursor: 'pointer',
            borderBottom: isActive ? '3px solid var(--accent-primary)' : '3px solid transparent',
            color: isActive ? 'var(--accent-primary)' : '#6b7280',
            fontWeight: 600,
            background: isActive ? 'white' : 'transparent',
            borderTopLeftRadius: '8px',
            borderTopRightRadius: '8px',
            marginBottom: '-1px'
        }),
        editorContainer: {
            background: 'white',
            borderRadius: '16px',
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
            border: '1px solid #e5e7eb',
            display: 'flex',
            flexDirection: 'column',
            minHeight: '600px', // Ensure substantial area
            marginBottom: '50px' // Space at bottom
        },
        toolbar: {
            padding: '15px 20px',
            borderBottom: '1px solid #e5e7eb',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: '#f9fafb',
            borderTopLeftRadius: '16px',
            borderTopRightRadius: '16px'
        },
        saveBtn: {
            padding: '10px 24px',
            background: 'var(--accent-primary)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
        }
    };

    const modules = {
        toolbar: [
            [{ 'header': [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike', 'blockquote'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
            ['link', 'image'],
            ['clean']
        ],
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <div>
                    <h1 style={styles.title}>Legal & Compliance</h1>
                    <p style={{ color: '#6b7280' }}>Manage your site's legal documents with rich text editing.</p>
                </div>
                {statusMessage && <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ color: '#10b981', fontWeight: 600 }}>{statusMessage}</motion.span>}
            </div>

            <div style={styles.tabs}>
                <div onClick={() => setActiveTab('privacyPolicy')} style={styles.tab(activeTab === 'privacyPolicy')}>Privacy Policy</div>
                <div onClick={() => setActiveTab('termsConditions')} style={styles.tab(activeTab === 'termsConditions')}>Terms & Conditions</div>
                <div onClick={() => setActiveTab('cookiePolicy')} style={styles.tab(activeTab === 'cookiePolicy')}>Cookie Policy</div>
            </div>

            <div style={styles.editorContainer}>
                <div style={styles.toolbar}>
                    <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                        <span style={{ fontWeight: 600, color: '#374151' }}>Editing: {legals[activeTab].title}</span>
                    </div>
                    <button onClick={handleSave} style={styles.saveBtn}>
                        <FaSave /> Save Changes
                    </button>
                </div>

                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <ReactQuill
                        theme="snow"
                        value={legals[activeTab].content}
                        onChange={handleContentChange}
                        modules={modules}
                        style={{ display: 'flex', flexDirection: 'column' }}
                    />
                </div>
            </div>
            <style>{`
                .quill { display: flex; flex-direction: column; background: white; border-bottom-left-radius: 16px; border-bottom-right-radius: 16px; }
                .ql-container { font-size: 1rem; border: none !important; }
                .ql-editor { padding: 30px; min-height: 500px; }
                .ql-toolbar { border-top: none !important; border-left: none !important; border-right: none !important; border-bottom: 1px solid #e5e7eb !important; background: #fff; }
                .ql-toolbar.ql-snow { border: none !important; border-bottom: 1px solid #e5e7eb !important; }
                
                /* Match Prose Styles in Editor */
                .ql-editor h1, .ql-editor h2, .ql-editor h3 { color: var(--accent-primary) !important; margin-top: 2.5rem; margin-bottom: 1rem; }
                .ql-editor p { margin-bottom: 1.2em; color: var(--text-secondary); }
            `}</style>
        </div>
    );
};

export default AdminLegal;

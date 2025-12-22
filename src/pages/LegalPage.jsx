import React, { useState, useEffect } from 'react';
import { getLegalDoc } from '../services/legalService';
import { motion } from 'framer-motion';

const LegalPage = ({ docKey }) => {
    const [doc, setDoc] = useState(null);

    useEffect(() => {
        const storedDoc = getLegalDoc(docKey);
        setDoc(storedDoc);

        const handleUpdate = () => {
            setDoc(getLegalDoc(docKey));
        };
        window.addEventListener('legals-updated', handleUpdate);
        return () => window.removeEventListener('legals-updated', handleUpdate);
    }, [docKey]);

    if (!doc) return <div className="container section-padding">Loading...</div>;

    return (
        <div className="container section-padding" style={{ maxWidth: '900px' }}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="glass-panel"
                style={{ padding: '60px', borderRadius: '24px', background: 'rgba(255,255,255,0.8)' }}
            >
                {/* Content rendered safely */}
                <div
                    className="legal-content prose"
                    style={{ lineHeight: '1.8', color: 'var(--text-secondary)' }}
                    dangerouslySetInnerHTML={{ __html: doc.content }}
                />
            </motion.div>
        </div>
    );
};

export default LegalPage;

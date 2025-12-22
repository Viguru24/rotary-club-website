import React, { createContext, useContext, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaTimes } from 'react-icons/fa';

const UIContext = createContext();

export const useUI = () => useContext(UIContext);

export const UIProvider = ({ children }) => {
    // Toast State
    const [toasts, setToasts] = useState([]);

    // Confirm Modal State
    const [confirmState, setConfirmState] = useState({ isOpen: false, title: '', message: '', onConfirm: null, isDanger: false });

    // Toast Actions
    const showToast = useCallback((message, type = 'success') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => removeToast(id), 3000);
    }, []);

    const removeToast = (id) => setToasts(prev => prev.filter(t => t.id !== id));

    const confirmAction = useCallback((message, onConfirm, title = "Confirm Action", isDanger = false) => {
        setConfirmState({ isOpen: true, title, message, onConfirm, isDanger });
    }, []);

    const closeConfirm = () => setConfirmState(prev => ({ ...prev, isOpen: false }));

    const handleConfirm = async () => {
        if (confirmState.onConfirm) await confirmState.onConfirm();
        closeConfirm();
    };

    return (
        <UIContext.Provider value={{ showToast, confirmAction }}>
            {children}

            {/* Toast Container */}
            <div style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 9999, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <AnimatePresence>
                    {toasts.map(toast => (
                        <motion.div
                            key={toast.id}
                            initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 50 }}
                            layout
                            style={{
                                background: 'rgba(255, 255, 255, 0.95)',
                                backdropFilter: 'blur(10px)',
                                padding: '16px 20px',
                                borderRadius: '12px',
                                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                minWidth: '300px',
                                borderLeft: `4px solid ${toast.type === 'error' ? '#ef4444' : '#10b981'}`
                            }}
                        >
                            {toast.type === 'error' ? <FaExclamationCircle color="#ef4444" size={20} /> : <FaCheckCircle color="#10b981" size={20} />}
                            <div style={{ flex: 1, fontSize: '0.95rem', fontWeight: 500, color: '#1f2937' }}>{toast.message}</div>
                            <button onClick={() => removeToast(toast.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', display: 'flex', alignItems: 'center' }}><FaTimes /></button>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Confirm Modal */}
            <AnimatePresence>
                {confirmState.isOpen && (
                    <div style={{ position: 'fixed', inset: 0, zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeConfirm} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }} />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                            style={{ background: 'white', padding: '30px', borderRadius: '20px', width: '90%', maxWidth: '400px', position: 'relative', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}
                        >
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#111827', marginBottom: '10px' }}>{confirmState.title}</h3>
                            <p style={{ color: '#4b5563', marginBottom: '25px', lineHeight: 1.5 }}>{confirmState.message}</p>
                            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                                <button onClick={closeConfirm} style={{ padding: '10px 20px', borderRadius: '10px', background: '#f3f4f6', color: '#374151', fontWeight: 600, border: 'none', cursor: 'pointer' }}>Cancel</button>
                                <button onClick={handleConfirm} style={{ padding: '10px 20px', borderRadius: '10px', background: confirmState.isDanger ? '#ef4444' : 'var(--accent-primary)', color: 'white', fontWeight: 600, border: 'none', cursor: 'pointer' }}>Confirm</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </UIContext.Provider>
    );
};

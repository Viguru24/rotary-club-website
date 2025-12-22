import React, { useRef, useState } from 'react';
import { FaCloudUploadAlt, FaCheck, FaTimes, FaImage } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const ImageUploader = ({ onImageUpload, currentImage, label = "Upload Image" }) => {
    const fileInputRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);
    const [preview, setPreview] = useState(currentImage);

    const handleDragEnter = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            processFile(e.dataTransfer.files[0]);
        }
    };

    const handleClick = () => {
        fileInputRef.current.click();
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            processFile(e.target.files[0]);
        }
    };

    const processFile = (file) => {
        if (!file.type.startsWith('image/')) {
            alert('Please upload an image file');
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            setPreview(reader.result);
            if (onImageUpload) {
                onImageUpload(reader.result);
            }
        };
        reader.readAsDataURL(file);
    };

    const clearImage = (e) => {
        e.stopPropagation();
        setPreview(null);
        if (onImageUpload) {
            onImageUpload(null);
        }
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div style={{ width: '100%' }}>
            {label && <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>{label}</label>}

            <motion.div
                layout
                onClick={handleClick}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                whileHover={{ borderColor: 'var(--accent-primary)', backgroundColor: isDragging ? '#eff6ff' : '#f9fafb' }}
                animate={{
                    borderColor: isDragging ? 'var(--accent-primary)' : '#d1d5db',
                    backgroundColor: isDragging ? '#eff6ff' : (preview ? 'white' : '#f9fafb')
                }}
                style={{
                    border: '2px dashed #d1d5db',
                    borderRadius: '12px',
                    padding: preview ? '10px' : '40px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    position: 'relative',
                    transition: 'all 0.2s ease',
                    minHeight: '150px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden'
                }}
            >
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    style={{ display: 'none' }}
                />

                <AnimatePresence mode='wait'>
                    {preview ? (
                        <motion.div
                            key="preview"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            style={{ position: 'relative', width: '100%', height: '100%' }}
                        >
                            <img
                                src={preview}
                                alt="Preview"
                                style={{
                                    maxWidth: '100%',
                                    maxHeight: '200px',
                                    borderRadius: '8px',
                                    objectFit: 'contain',
                                    marginTop: 'auto',
                                    marginBottom: 'auto'
                                }}
                            />
                            <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', fontSize: '0.8rem', color: '#10b981' }}>
                                <FaCheck /> Image Selected
                            </div>
                            <button
                                onClick={clearImage}
                                style={{
                                    position: 'absolute',
                                    top: '-5px',
                                    right: '-5px',
                                    background: '#ef4444',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '50%',
                                    width: '24px',
                                    height: '24px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                                }}
                            >
                                <FaTimes size={12} />
                            </button>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="placeholder"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            style={{ color: isDragging ? 'var(--accent-primary)' : '#9ca3af' }}
                        >
                            <FaCloudUploadAlt size={40} style={{ marginBottom: '10px' }} />
                            <p style={{ margin: 0, fontWeight: 500, color: '#4b5563' }}>
                                {isDragging ? 'Drop it here!' : 'Click or Drag to Upload'}
                            </p>
                            <p style={{ margin: '5px 0 0', fontSize: '0.75rem', opacity: 0.7 }}>
                                Supports JPG, PNG, WEBP
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
};

export default ImageUploader;

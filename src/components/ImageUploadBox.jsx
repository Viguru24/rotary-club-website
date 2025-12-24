import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Link as LinkIcon } from 'lucide-react';

const ImageUploadBox = ({ currentImage, onImageSelect, className, style, label = "Drop cover image here", subLabel = "or click to browse files", dropLabel = "Drop image here" }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [inputType, setInputType] = useState('file'); // 'file' or 'url'
    const [urlInput, setUrlInput] = useState('');
    const fileInputRef = useRef(null);

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
        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            processFile(files[0]);
        }
    };

    const handleFileSelect = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            processFile(e.target.files[0]);
        }
    };

    const processFile = (file) => {
        if (!file.type.startsWith('image/')) {
            alert('Please select an image file');
            return;
        }
        const reader = new FileReader();
        reader.onload = (e) => {
            onImageSelect(e.target.result);
        };
        reader.readAsDataURL(file);
    };

    const handleUrlSubmit = () => {
        if (urlInput) {
            onImageSelect(urlInput);
            setUrlInput('');
            setInputType('file');
        }
    };

    if (currentImage) {
        return (
            <div style={{ position: 'relative', width: '100%', height: '200px', ...style }} className={className}>
                <img
                    src={currentImage}
                    alt="Selected"
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        borderRadius: '12px',
                        border: '1px solid #e2e8f0'
                    }}
                />
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onImageSelect(''); // Clear image
                    }}
                    style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        background: 'rgba(255, 255, 255, 0.9)',
                        border: 'none',
                        borderRadius: '50%',
                        width: '32px',
                        height: '32px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                        color: '#ef4444'
                    }}
                    title="Remove image"
                >
                    <X size={18} />
                </button>
                <div style={{
                    position: 'absolute',
                    bottom: '10px',
                    right: '10px',
                    background: 'rgba(0, 0, 0, 0.6)',
                    color: 'white',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '0.75rem',
                    pointerEvents: 'none'
                }}>
                    Cover Image
                </div>
            </div>
        );
    }

    return (
        <div style={{ ...style }} className={className}>
            <div
                onDragEnter={handleDragEnter}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                style={{
                    border: `2px dashed ${isDragging ? 'var(--accent-primary, #0ea5e9)' : '#cbd5e1'}`,
                    borderRadius: '12px',
                    padding: '30px',
                    background: isDragging ? '#f0f9ff' : '#f8fafc',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s',
                    cursor: inputType === 'file' ? 'pointer' : 'default',
                    minHeight: '200px'
                }}
            >
                {inputType === 'file' ? (
                    <>
                        <div
                            onClick={() => fileInputRef.current.click()}
                            style={{ width: '100%', textAlign: 'center' }}
                        >
                            <div style={{
                                width: '64px', height: '64px', borderRadius: '50%', background: '#e2e8f0',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto',
                                color: '#64748b'
                            }}>
                                <Upload size={32} />
                            </div>
                            <h4 style={{ margin: '0 0 8px 0', color: '#334155', fontSize: '1.1rem' }}>
                                {isDragging ? dropLabel : label}
                            </h4>
                            <p style={{ margin: '0 0 20px 0', color: '#94a3b8', fontSize: '0.9rem' }}>
                                {subLabel}
                            </p>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleFileSelect}
                                style={{ display: 'none' }}
                            />
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', maxWidth: '300px' }}>
                            <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }}></div>
                            <span style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase' }}>or</span>
                            <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }}></div>
                        </div>

                        <button
                            onClick={(e) => { e.stopPropagation(); setInputType('url'); }}
                            style={{
                                marginTop: '16px',
                                background: 'transparent',
                                border: 'none',
                                color: 'var(--accent-primary, #0ea5e9)',
                                fontSize: '0.9rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                                display: 'flex', alignItems: 'center', gap: '6px'
                            }}
                        >
                            <LinkIcon size={16} /> Use Image URL
                        </button>
                    </>
                ) : (
                    <div style={{ width: '100%' }}>
                        <h4 style={{ margin: '0 0 16px 0', color: '#334155', textAlign: 'center' }}>
                            Paste Image URL
                        </h4>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <input
                                type="text"
                                value={urlInput}
                                onChange={(e) => setUrlInput(e.target.value)}
                                placeholder="https://..."
                                style={{
                                    flex: 1,
                                    padding: '10px 12px',
                                    borderRadius: '8px',
                                    border: '1px solid #cbd5e1',
                                    fontSize: '0.95rem',
                                    outline: 'none'
                                }}
                                onKeyDown={(e) => e.key === 'Enter' && handleUrlSubmit()}
                                autoFocus
                            />
                            <button
                                onClick={handleUrlSubmit}
                                style={{
                                    padding: '10px 16px',
                                    borderRadius: '8px',
                                    background: 'var(--accent-primary, #0ea5e9)',
                                    color: 'white',
                                    border: 'none',
                                    cursor: 'pointer',
                                    fontWeight: 600
                                }}
                            >
                                Add
                            </button>
                        </div>
                        <button
                            onClick={() => setInputType('file')}
                            style={{
                                marginTop: '16px',
                                background: 'transparent',
                                border: 'none',
                                color: '#64748b',
                                fontSize: '0.9rem',
                                cursor: 'pointer',
                                width: '100%',
                                textAlign: 'center'
                            }}
                        >
                            Cancel
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ImageUploadBox;

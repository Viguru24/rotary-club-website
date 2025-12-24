import React, { useState } from 'react';
import { X, AlignLeft, AlignCenter, AlignRight, Maximize2, Minimize2, Video } from 'lucide-react';
import BlogImageCropper from './BlogImageCropper';
import ImageUploadBox from './ImageUploadBox';

const ImageInsertModal = ({ isOpen, onClose, onInsert }) => {
    const [imageUrl, setImageUrl] = useState('');
    const [alignment, setAlignment] = useState('center');
    const [size, setSize] = useState('medium');
    const [step, setStep] = useState('input'); // input, crop, settings
    const [cropImageSrc, setCropImageSrc] = useState(null);

    const handleFileSelect = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.addEventListener('load', () => {
                setCropImageSrc(reader.result);
                setStep('crop');
            });
            reader.readAsDataURL(file);
        }
    };

    const handleCropComplete = (croppedImageBase64) => {
        setImageUrl(croppedImageBase64);
        setStep('settings');
    };

    const handleInsert = () => {
        if (!imageUrl) return;

        let style = '';

        // Size
        if (size === 'small') style += 'width: 300px;';
        else if (size === 'medium') style += 'width: 500px;';
        else style += 'width: 100%;';

        // Alignment
        if (alignment === 'left') style += ' float: left; margin-right: 20px; margin-bottom: 20px;';
        else if (alignment === 'right') style += ' float: right; margin-left: 20px; margin-bottom: 20px;';
        else style += ' display: block; margin-left: auto; margin-right: auto; margin-top: 20px; margin-bottom: 20px;';

        const imgHtml = `<img src="${imageUrl}" style="${style}" alt="Blog image" class="blog-post-image" />`;
        onInsert(imgHtml);

        // Reset and close
        reset();
        onClose();
    };

    const reset = () => {
        setImageUrl('');
        setAlignment('center');
        setSize('medium');
        setStep('input');
        setCropImageSrc(null);
    };

    if (!isOpen) return null;

    if (step === 'crop') {
        return (
            <BlogImageCropper
                imageSrc={cropImageSrc}
                onCropComplete={handleCropComplete}
                onCancel={() => setStep('input')}
            />
        );
    }

    return (
        <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200
        }}>
            <div style={{
                background: 'white', borderRadius: '16px', padding: '30px',
                maxWidth: '500px', width: '90%', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Insert Image</h3>
                    <button onClick={() => { reset(); onClose(); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}>
                        <X size={24} />
                    </button>
                </div>

                {step === 'input' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <ImageUploadBox
                            onImageSelect={(result) => {
                                if (result.startsWith('data:')) {
                                    setCropImageSrc(result);
                                    setStep('crop');
                                } else {
                                    setImageUrl(result);
                                    setStep('settings');
                                }
                            }}
                            label="Drop image here"
                            dropLabel="Drop it!"
                            style={{ minHeight: '250px' }}
                        />
                    </div>
                )}

                {step === 'settings' && (
                    <>
                        <div style={{ marginBottom: '20px' }}>
                            <div style={{ height: '150px', background: '#f3f4f6', borderRadius: '8px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                                <img src={imageUrl} alt="Preview" style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
                            </div>

                            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, marginBottom: '12px', color: '#374151' }}>Size</label>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                {['small', 'medium', 'large'].map((s) => (
                                    <button
                                        key={s}
                                        onClick={() => setSize(s)}
                                        style={{
                                            flex: 1, padding: '12px', borderRadius: '8px',
                                            border: size === s ? '2px solid var(--accent-primary)' : '1px solid #e5e7eb',
                                            background: size === s ? '#eff6ff' : 'white',
                                            color: size === s ? 'var(--accent-primary)' : '#6b7280',
                                            fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                                        }}
                                    >
                                        {s === 'small' && <Minimize2 size={16} />}
                                        {s === 'large' && <Maximize2 size={16} />}
                                        {s.charAt(0).toUpperCase() + s.slice(1)}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div style={{ marginBottom: '25px' }}>
                            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, marginBottom: '12px', color: '#374151' }}>Alignment</label>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                {[
                                    { value: 'left', icon: AlignLeft, label: 'Left' },
                                    { value: 'center', icon: AlignCenter, label: 'Center' },
                                    { value: 'right', icon: AlignRight, label: 'Right' }
                                ].map(({ value, icon: Icon, label }) => (
                                    <button
                                        key={value}
                                        onClick={() => setAlignment(value)}
                                        style={{
                                            flex: 1, padding: '12px', borderRadius: '8px',
                                            border: alignment === value ? '2px solid var(--accent-primary)' : '1px solid #e5e7eb',
                                            background: alignment === value ? '#eff6ff' : 'white',
                                            color: alignment === value ? 'var(--accent-primary)' : '#6b7280',
                                            fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                                        }}
                                    >
                                        <Icon size={16} /> {label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button
                                onClick={() => setStep('input')}
                                style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db', background: 'white', color: '#374151', fontWeight: 600, cursor: 'pointer' }}
                            >
                                Back
                            </button>
                            <button
                                onClick={handleInsert}
                                style={{ flex: 1, padding: '12px', borderRadius: '8px', border: 'none', background: 'var(--accent-primary)', color: 'white', fontWeight: 600, cursor: 'pointer' }}
                            >
                                Insert Image
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default ImageInsertModal;

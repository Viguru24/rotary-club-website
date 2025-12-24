import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import getCroppedImg from '../utils/cropImage';
import { X, Check, RotateCcw, ZoomIn, Image as ImageIcon } from 'lucide-react';

const BlogImageCropper = ({ imageSrc, onCropComplete, onCancel }) => {
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [rotation, setRotation] = useState(0);
    const [aspect, setAspect] = useState(16 / 9);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

    const onCropChange = (crop) => {
        setCrop(crop);
    };

    const onCropCompleteCallback = useCallback((croppedArea, croppedAreaPixels) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const showCroppedImage = async () => {
        try {
            const croppedImage = await getCroppedImg(
                imageSrc,
                croppedAreaPixels,
                rotation
            );
            onCropComplete(croppedImage);
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(0,0,0,0.85)',
            display: 'flex', flexDirection: 'column', color: 'white'
        }}>
            {/* Header */}
            <div style={{
                padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(10px)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <ImageIcon size={20} />
                    <h3 style={{ margin: 0, fontWeight: 600 }}>Crop Image</h3>
                </div>
                <button
                    onClick={onCancel}
                    style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}
                >
                    <X size={24} />
                </button>
            </div>

            {/* Cropper Area */}
            <div style={{ position: 'relative', flex: 1, background: '#111' }}>
                <Cropper
                    image={imageSrc}
                    crop={crop}
                    zoom={zoom}
                    rotation={rotation}
                    aspect={aspect}
                    onCropChange={setCrop}
                    onCropComplete={onCropCompleteCallback}
                    onZoomChange={setZoom}
                    onRotationChange={setRotation}
                />
            </div>

            {/* Controls */}
            <div style={{
                padding: '20px', background: 'white', color: '#333',
                display: 'flex', flexDirection: 'column', gap: '20px'
            }}>
                {/* Sliders */}
                <div style={{ display: 'flex', gap: '30px', alignItems: 'center' }}>
                    <div style={{ flex: 1 }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', fontWeight: 600, marginBottom: '8px' }}>
                            <ZoomIn size={16} /> Zoom
                        </label>
                        <input
                            type="range"
                            value={zoom}
                            min={1}
                            max={3}
                            step={0.1}
                            aria-labelledby="Zoom"
                            onChange={(e) => setZoom(e.target.value)}
                            style={{ width: '100%' }}
                        />
                    </div>
                    <div style={{ flex: 1 }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', fontWeight: 600, marginBottom: '8px' }}>
                            <RotateCcw size={16} /> Rotation
                        </label>
                        <input
                            type="range"
                            value={rotation}
                            min={0}
                            max={360}
                            step={1}
                            aria-labelledby="Rotation"
                            onChange={(e) => setRotation(e.target.value)}
                            style={{ width: '100%' }}
                        />
                    </div>
                </div>

                {/* Aspect Ratio Buttons */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        {[
                            { label: 'Cover (16:9)', value: 16 / 9 },
                            { label: 'Standard (4:3)', value: 4 / 3 },
                            { label: 'Square (1:1)', value: 1 },
                            { label: 'Free', value: null } // Free crop not fully supported by this simple UI switch logic in react-easy-crop without aspect prop, passing null disables aspect lock
                        ].map((ratio) => (
                            <button
                                key={ratio.label}
                                onClick={() => setAspect(ratio.value)}
                                style={{
                                    padding: '8px 16px',
                                    borderRadius: '20px',
                                    border: aspect === ratio.value ? '2px solid var(--accent-primary)' : '1px solid #ddd',
                                    background: aspect === ratio.value ? '#eff6ff' : 'white',
                                    color: aspect === ratio.value ? 'var(--accent-primary)' : '#666',
                                    fontWeight: 600,
                                    fontSize: '0.85rem',
                                    cursor: 'pointer'
                                }}
                            >
                                {ratio.label}
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={showCroppedImage}
                        style={{
                            padding: '12px 30px',
                            background: 'var(--accent-primary)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontWeight: 700,
                            fontSize: '1rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                        }}
                    >
                        <Check size={20} /> Use Image
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BlogImageCropper;

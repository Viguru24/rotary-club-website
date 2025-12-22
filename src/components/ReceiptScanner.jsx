import React, { useState, useRef } from "react";
import { Camera, Upload, Sparkles, X, AlertCircle } from "lucide-react";
import imageCompression from "browser-image-compression";

const ReceiptScanner = ({ onScanComplete, onClose }) => {
    const [scanning, setScanning] = useState(false);
    const [error, setError] = useState(null);
    const cameraInputRef = useRef(null);
    const galleryInputRef = useRef(null);

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            // 1. Compress Image (Crucial for API speed/limits)
            const options = {
                maxSizeMB: 0.2, // Compress to ~200KB
                maxWidthOrHeight: 800,
                useWebWorker: true,
            };

            const compressedFile = await imageCompression(file, options);

            // 2. Convert to Base64
            const reader = new FileReader();
            reader.onload = (event) => processImage(event.target.result);
            reader.readAsDataURL(compressedFile);
        } catch (err) {
            console.error(err);
            setError("Failed to process image.");
        }
    };

    const processImage = async (imageData) => {
        setScanning(true);
        setError(null);

        try {
            // 3. Send to API
            // Note: Adjust the port or proxy if running locally and API is on different port, 
            // but in this setup, usually handled by Vite proxy or same origin in prod.
            // Assuming relative path works via Vite proxy or same domain.
            const response = await fetch("http://localhost:3001/api/scan-receipt", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ image: imageData }),
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || "Scan failed");
            }

            const { data } = await response.json();

            // 4. Return Data
            onScanComplete({ ...data, receiptUrl: imageData });

        } catch (err) {
            console.error(err);
            setError(err.message || "Failed to scan receipt");
        } finally {
            setScanning(false);
        }
    };

    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(5px)' }}>
            <div style={{ background: 'white', borderRadius: '24px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', width: '100%', height: '100%', maxWidth: '100%', margin: '0', display: 'flex', flexDirection: 'column' }}>
                {/* Header */}
                <div style={{ padding: '24px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#ffffff', zIndex: 10 }}>
                    <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '12px', color: '#1f2937' }}>
                        <Sparkles size={28} color="#7c3aed" />
                        AI Receipt Scanner
                    </h3>
                    <button onClick={onClose} style={{ padding: '12px', background: '#f3f4f6', border: 'none', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#374151', transition: 'background 0.2s' }}>
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div style={{ flex: 1, padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', overflowY: 'auto' }}>
                    {scanning ? (
                        <div style={{ textAlign: 'center', padding: '40px' }}>
                            <div className="spinner" style={{ width: '80px', height: '80px', border: '6px solid #7c3aed', borderTopColor: 'transparent', borderRadius: '50%', margin: '0 auto 24px', animation: 'spin 1s linear infinite' }} />
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#1f2937', marginBottom: '8px' }}>Scanning Receipt...</h2>
                            <p style={{ color: '#6b7280', fontSize: '1.1rem' }}>Extracting details using Gemini AI</p>
                            <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%', maxWidth: '600px' }}>
                            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                                <p style={{ fontSize: '1.2rem', color: '#4b5563' }}>Choose how you'd like to capture your receipt.</p>
                            </div>

                            <button
                                onClick={() => cameraInputRef.current?.click()}
                                style={{
                                    width: '100%', padding: '40px', border: '3px dashed #d8b4fe', background: '#ffffff', borderRadius: '20px',
                                    display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', transition: 'all 0.2s',
                                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
                                }}
                                onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#7c3aed'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#d8b4fe'; e.currentTarget.style.transform = 'translateY(0)'; }}
                            >
                                <div style={{ background: '#f3e8ff', padding: '20px', borderRadius: '50%', marginBottom: '16px' }}>
                                    <Camera size={48} color="#7c3aed" />
                                </div>
                                <span style={{ fontSize: '1.25rem', fontWeight: 700, color: '#581c87' }}>Take Photo</span>
                                <span style={{ fontSize: '0.9rem', color: '#9ca3af', marginTop: '4px' }}>Use your device camera</span>
                            </button>

                            <button
                                onClick={() => galleryInputRef.current?.click()}
                                style={{
                                    width: '100%', padding: '30px', border: '2px solid #e5e7eb', background: 'white', borderRadius: '20px',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', cursor: 'pointer', transition: 'all 0.2s',
                                    boxShadow: '0 2px 4px -1px rgba(0, 0, 0, 0.05)'
                                }}
                                onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#9ca3af'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e5e7eb'; }}
                            >
                                <Upload size={24} color="#6b7280" />
                                <div style={{ textAlign: 'left' }}>
                                    <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#374151' }}>Upload from Gallery</div>
                                </div>
                            </button>


                            {/* Hidden Inputs */}
                            <input
                                type="file"
                                ref={cameraInputRef}
                                onChange={handleFileChange}
                                accept="image/*"
                                capture="environment"
                                style={{ display: 'none' }}
                            />
                            <input
                                type="file"
                                ref={galleryInputRef}
                                onChange={handleFileChange}
                                accept="image/*"
                                style={{ display: 'none' }}
                            />

                            {error && (
                                <div style={{ padding: '12px', background: '#fef2f2', color: '#dc2626', borderRadius: '8px', display: 'flex', gap: '8px', alignItems: 'center', fontSize: '0.875rem', border: '1px solid #fee2e2' }}>
                                    <AlertCircle size={16} /> {error}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ReceiptScanner;

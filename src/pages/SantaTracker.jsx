import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Navigation, AlertCircle, Smartphone } from 'lucide-react';

const SantaTracker = () => {
    const [tracking, setTracking] = useState(false);
    const [status, setStatus] = useState('Ready');
    const [coords, setCoords] = useState(null);
    const [error, setError] = useState(null);
    const watchId = useRef(null);
    const wakeLockRef = useRef(null);

    const toggleTracking = () => {
        if (tracking) {
            stopTracking();
        } else {
            startTracking();
        }
    };

    const requestWakeLock = async () => {
        try {
            if ('wakeLock' in navigator) {
                wakeLockRef.current = await navigator.wakeLock.request('screen');
                console.log('Screen Wake Lock active');
            }
        } catch (err) {
            console.error('Wake Lock Error:', err);
        }
    };

    const startTracking = () => {
        if (!window.isSecureContext && window.location.hostname !== 'localhost') {
            setError('GPS requires HTTPS or Localhost. Cannot track on insecure connection.');
            return;
        }

        if (!navigator.geolocation) {
            setError('Geolocation is not supported by your browser.');
            return;
        }

        setTracking(true);
        setStatus('Initializing GPS...');
        setError(null);
        requestWakeLock();

        watchId.current = navigator.geolocation.watchPosition(
            (position) => {
                const { latitude, longitude, accuracy } = position.coords;

                // Only update if accuracy is high quality (within 25 meters)
                if (accuracy <= 25) {
                    setCoords({
                        lat: latitude,
                        lng: longitude,
                        accuracy: accuracy.toFixed(1)
                    });
                    setStatus(`Broadcasting (±${accuracy.toFixed(0)}m)`);
                    sendLocation(latitude, longitude, accuracy);
                } else {
                    setStatus(`Improving accuracy... (±${accuracy.toFixed(0)}m)`);
                }
            },
            (err) => {
                console.error(err);
                setError('GPS Error: ' + err.message);
                setStatus('Error');
            },
            {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 0
            }
        );
    };

    const stopTracking = () => {
        if (watchId.current) {
            navigator.geolocation.clearWatch(watchId.current);
            watchId.current = null;
        }
        if (wakeLockRef.current) {
            wakeLockRef.current.release();
            wakeLockRef.current = null;
        }
        setTracking(false);
        setStatus('Stopped');
        // Optional: Send "stop" signal to backend
    };

    const sendLocation = async (lat, lng, accuracy) => {
        try {
            // Updated endpoint to match earlier correct path in SantaTracker.jsx (it was /api/santa-tour/location in view_file)
            // But user might have used a different one. The view_file at step 595 used /api/santa-tour/location. 
            // Previous replace attempt (Step 590) used http://localhost:3001/api/gps, which might be wrong.
            // I will use the one found in the file at Step 595: /api/santa-tour/location
            await fetch('/api/santa-tour/location', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ lat, lng, accuracy, active: true })
            });
        } catch (e) {
            console.error('Failed to send location', e);
            setStatus('Network Error - Retrying...');
        }
    };

    // Clean up
    useEffect(() => {
        return () => {
            if (watchId.current) navigator.geolocation.clearWatch(watchId.current);
            if (wakeLockRef.current) wakeLockRef.current.release();
        };
    }, []);

    return (
        <div style={{
            minHeight: '100vh', background: '#0f172a', color: 'white',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            padding: '2rem'
        }}>
            <div style={{
                background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)',
                padding: '2rem', borderRadius: '1.5rem', width: '100%', maxWidth: '400px',
                textAlign: 'center', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)'
            }}>
                <div style={{
                    width: '80px', height: '80px', background: tracking ? '#ef4444' : '#334155',
                    borderRadius: '50%', margin: '0 auto 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'background 0.3s'
                }}>
                    <Navigation size={40} className={tracking ? 'animate-pulse' : ''} />
                </div>

                <h1 className="text-2xl font-bold mb-2">Santa Tracker Driver</h1>
                <p className="text-slate-400 mb-6">
                    {tracking ? "You are LIVE. Keep this tab open." : "Press Start to begin broadcasting location."}
                </p>

                {/* Accuracy Warning / Home Screen Tip */}
                {!tracking && (
                    <div className="bg-blue-500/20 text-blue-200 p-3 rounded mb-6 text-sm" style={{ background: 'rgba(59, 130, 246, 0.2)', color: '#bfdbfe', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '0.9rem', textAlign: 'left' }}>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '4px' }}>
                            <Smartphone size={16} />
                            <strong>Pro Tip:</strong>
                        </div>
                        Tap <strong>Share</strong> (iPhone) or <strong>Menu</strong> (Android) and select <strong>"Add to Home Screen"</strong> for a permanent app icon! 📱
                    </div>
                )}

                {error && (
                    <div className="bg-red-500/20 text-red-200 p-3 rounded mb-4 text-sm flex items-center gap-2" style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#fecaca', padding: '12px', borderRadius: '8px' }}>
                        <AlertCircle size={16} /> {error}
                    </div>
                )}

                <div className="mb-8">
                    <div className="text-6xl font-mono font-bold tracking-wider mb-2">
                        {tracking ? "ON" : "OFF"}
                    </div>
                    <div className={`text-sm font-bold uppercase tracking-widest ${tracking ? 'text-green-400' : 'text-slate-500'}`} style={{ color: tracking ? '#4ade80' : '#64748b' }}>
                        {status}
                    </div>
                </div>

                {coords && (
                    <div className="text-xs text-slate-500 font-mono mb-6" style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
                        LAT: {coords.lat.toFixed(5)} <br />
                        LNG: {coords.lng.toFixed(5)} <br />
                        {coords.accuracy && (
                            <span style={{ color: coords.accuracy <= 15 ? '#4ade80' : '#facc15' }}>
                                ACCURACY: ±{coords.accuracy}m
                            </span>
                        )}
                    </div>
                )}

                <button
                    onClick={toggleTracking}
                    style={{
                        width: '100%', padding: '1rem', borderRadius: '1rem',
                        background: tracking ? '#334155' : '#ef4444',
                        color: 'white', fontWeight: 'bold', fontSize: '1.1rem',
                        transition: 'all 0.2s', border: 'none', cursor: 'pointer',
                        boxShadow: tracking ? 'none' : '0 10px 15px -3px rgba(239, 68, 68, 0.3)'
                    }}
                >
                    {tracking ? 'Stop Tracking' : 'Start Tracking'}
                </button>
            </div>
        </div>
    );
};

export default SantaTracker;

import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

// Custom Santa Sleigh Icon
const santaIcon = L.divIcon({
    className: 'custom-santa-icon',
    html: `<div style="font-size: 2rem; filter: drop-shadow(0 4px 6px rgba(0,0,0,0.3));">🛷</div>`,
    iconSize: [40, 40],
    iconAnchor: [20, 20]
});

L.Marker.prototype.options.icon = DefaultIcon;

const RecenterMap = ({ lat, lng }) => {
    const map = useMap();
    useEffect(() => {
        if (lat && lng) {
            map.flyTo([lat, lng], map.getZoom());
        }
    }, [lat, lng, map]);
    return null;
};

const SantaMap = () => {
    const defaultCenter = [51.280, -0.080]; // Caterham rough center
    const [sleighPos, setSleighPos] = useState(null);
    const [userPos, setUserPos] = useState(null);
    const [lastSeen, setLastSeen] = useState(null);
    const [distance, setDistance] = useState(null);
    const [audioEnabled, setAudioEnabled] = useState(false);

    // Audio Player - Using local file
    const audioRef = useRef(new Audio('/sleigh-bells.mp3'));

    // Config
    const ALERT_DISTANCE = 500; // meters

    useEffect(() => {
        // Track Sleigh
        const interval = setInterval(fetchLocation, 5000);
        fetchLocation();

        // Track User
        let watchId;
        if (navigator.geolocation) {
            watchId = navigator.geolocation.watchPosition(
                (pos) => setUserPos([pos.coords.latitude, pos.coords.longitude]),
                (err) => console.log("User loc error", err),
                { enableHighAccuracy: true }
            );
        }

        // Configure Audio
        audioRef.current.loop = true;
        audioRef.current.volume = 0.5;

        return () => {
            clearInterval(interval);
            if (watchId) navigator.geolocation.clearWatch(watchId);
            audioRef.current.pause();
        };
    }, []);

    // Distance Check & Audio Trigger
    useEffect(() => {
        if (sleighPos && userPos) {
            const dist = getDistance(sleighPos[0], sleighPos[1], userPos[0], userPos[1]);
            setDistance(dist);

            if (audioEnabled && dist < ALERT_DISTANCE) {
                if (audioRef.current.paused) {
                    audioRef.current.play().catch(e => console.log("Audio play failed", e));
                }
                // Volume fades in as he gets closer (simulated 3D audio)
                // 500m = 0 volume, 0m = 1 volume
                const volume = Math.max(0.0, Math.min(1, 1 - (dist / ALERT_DISTANCE)));
                audioRef.current.volume = volume;
            } else {
                audioRef.current.pause();
            }
        }
    }, [sleighPos, userPos, audioEnabled]);

    const fetchLocation = async () => {
        try {
            const res = await fetch('/api/santa-tour/location');
            const data = await res.json();
            if (data && data.lat && data.lng) {
                setSleighPos([data.lat, data.lng]);
                setLastSeen(new Date(data.timestamp));
            }
        } catch (err) {
            console.error("Error fetching sleigh pos", err);
        }
    };

    // Haversine Formula
    const getDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371e3; // metres
        const φ1 = lat1 * Math.PI / 180;
        const φ2 = lat2 * Math.PI / 180;
        const Δφ = (lat2 - lat1) * Math.PI / 180;
        const Δλ = (lon2 - lon1) * Math.PI / 180;

        const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return Math.round(R * c);
    };

    const toggleAudio = () => {
        setAudioEnabled(!audioEnabled);
        if (!audioEnabled) {
            // Prime the audio on user gesture (required by browsers)
            audioRef.current.play().then(() => audioRef.current.pause()).catch(e => console.log(e));
        } else {
            audioRef.current.pause();
        }
    };

    return (
        <div style={{ height: '500px', width: '100%', borderRadius: '1rem', overflow: 'hidden', border: '1px solid #cbd5e1', position: 'relative' }}>
            <MapContainer center={defaultCenter} zoom={14} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {sleighPos && (
                    <>
                        <Marker position={sleighPos} icon={santaIcon}>
                            <Popup>
                                <strong>Santa's Sleigh!</strong><br />
                                {lastSeen ? `Last seen: ${lastSeen.toLocaleTimeString()}` : 'Live'}
                            </Popup>
                        </Marker>
                        <RecenterMap lat={sleighPos[0]} lng={sleighPos[1]} />
                    </>
                )}

                {userPos && (
                    <Marker position={userPos}>
                        <Popup>You are here</Popup>
                    </Marker>
                )}
            </MapContainer>

            {/* Overlay Info */}
            <div style={{
                position: 'absolute', top: '10px', right: '10px', zIndex: 1000,
                display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end'
            }}>
                <div style={{
                    background: 'rgba(255,255,255,0.9)', padding: '0.5rem 1rem', borderRadius: '0.5rem',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)', fontSize: '0.9rem', fontWeight: 'bold'
                }}>
                    {sleighPos ? (
                        <div className="text-green-600 flex items-center gap-2">
                            <span className="relative flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                            </span>
                            LIVE TRACKING
                        </div>
                    ) : (
                        <div className="text-gray-500">Waiting for signal...</div>
                    )}
                </div>

                {sleighPos && distance && (
                    <div style={{
                        background: 'rgba(255,255,255,0.9)', padding: '0.5rem 1rem', borderRadius: '0.5rem',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)', fontSize: '0.9rem', fontWeight: 'bold',
                        color: distance < ALERT_DISTANCE ? '#dc2626' : '#334155'
                    }}>
                        🎅 {distance}m away
                    </div>
                )}

                <button
                    onClick={toggleAudio}
                    style={{
                        background: audioEnabled ? '#10b981' : 'white',
                        color: audioEnabled ? 'white' : '#64748b',
                        padding: '8px 12px', borderRadius: '0.5rem', border: 'none',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)', cursor: 'pointer', fontWeight: 600,
                        fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px'
                    }}
                >
                    {audioEnabled ? '🔔 Sound ON' : '🔕 Sound OFF'}
                </button>
            </div>
        </div>
    );
};

export default SantaMap;

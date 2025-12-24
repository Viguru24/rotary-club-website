import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google'; // Changed import
import { useNavigate } from 'react-router-dom';
import { FaLock, FaUserShield } from 'react-icons/fa';

const LoginPage = () => {
    const { login, memberLogin, user } = useAuth();
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    // Redirect if already logged in
    React.useEffect(() => {
        if (user) {
            navigate('/members');
        }
    }, [user, navigate]);

    const handleGoogleSuccess = (credentialResponse) => {
        login(credentialResponse);
        navigate('/members');
    };

    const handleGoogleError = () => {
        setError('Google Login Failed');
    };

    const handleMemberLogin = (e) => {
        e.preventDefault();
        if (memberLogin(password)) {
            navigate('/members');
        } else {
            setError('Incorrect password. Please try again.');
        }
    };

    return (
        <div className="container section-padding" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: '140px', paddingBottom: '40px' }}>
            <motion.div
                className="glass-panel"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ padding: '40px', maxWidth: '450px', width: '100%', borderRadius: '24px' }}
            >
                <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                    <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-primary)', marginBottom: '10px' }}>Member Access</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Enter the club password to access the member dashboard.</p>
                </div>

                <form onSubmit={handleMemberLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                    <div style={{ position: 'relative' }}>
                        <FaLock style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                        <input
                            type="password"
                            placeholder="Club Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '14px 14px 14px 45px',
                                borderRadius: '12px',
                                border: '1px solid #e5e7eb',
                                fontSize: '1rem',
                                outline: 'none'
                            }}
                        />
                    </div>

                    {error && <p style={{ color: '#ef4444', fontSize: '0.9rem', textAlign: 'center' }}>{error}</p>}

                    <button
                        type="submit"
                        className="fancy-button"
                        style={{ width: '100%', padding: '14px', borderRadius: '12px', fontSize: '1.1rem', fontWeight: 600 }}
                    >
                        Access Dashboard
                    </button>
                </form>

                <div style={{ marginTop: '30px', paddingTop: '20px', borderTop: '1px solid #e5e7eb', textAlign: 'center' }}>
                    <p style={{ fontSize: '0.9rem', color: '#6b7280', marginBottom: '15px' }}>Administrator Access</p>
                    <div id="google-login-btn-container" style={{ display: 'flex', justifyContent: 'center' }}>
                        <GoogleLogin
                            onSuccess={handleGoogleSuccess}
                            onError={handleGoogleError}
                            useOneTap
                            theme="filled_blue"
                            shape="pill"
                            text="signin_with"
                        />
                    </div>
                </div>

                {/* Developer Bypass - Only visible in DEV mode */}
                {import.meta.env.DEV && (
                    <div style={{ marginTop: '20px', textAlign: 'center' }}>
                        <button
                            onClick={() => {
                                const mockUser = {
                                    name: 'Dev Admin',
                                    email: 'admin@local.test',
                                    role: 'admin',
                                    picture: 'https://ui-avatars.com/api/?name=Dev+Admin&background=10b981&color=fff'
                                };
                                // We need to expose a way to set user directly or use a mock credential
                                // Since login() expects a credentialResponse, we'll use a direct state update mechanism if possible
                                // accessing the internal setUser would requires modifying AuthContext.
                                // Instead, let's use the memberLogin with the correct password or add a bypass method to context.
                                // For now, let's try calling memberLogin with the env password directly.
                                if (memberLogin(import.meta.env.VITE_MEMBER_PASSWORD)) {
                                    navigate('/members');
                                }
                            }}
                            style={{
                                background: 'none', border: '1px dashed #ef4444', color: '#ef4444',
                                padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem'
                            }}
                        >
                            [DEV] Bypass Authentication
                        </button>
                    </div>
                )}

            </motion.div>
        </div>
    );
};

export default LoginPage;

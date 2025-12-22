import React from 'react';
import { FaFacebook } from 'react-icons/fa';

const Footer = () => {
    return (
        <footer style={{
            background: 'var(--bg-secondary)',
            padding: '50px 0',
            marginTop: '50px',
            borderTop: '1px solid var(--glass-border)'
        }}>
            <div className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', textAlign: 'center' }}>
                <h3 className="text-gradient logo-text">Caterham Rotary</h3>
                <p style={{ color: 'var(--text-secondary)', maxWidth: '600px' }}>
                    Bringing good cheer and happiness to the community. Join us in making a difference.
                </p>

                <div style={{ display: 'flex', gap: '20px' }}>
                    <a href="https://www.facebook.com/caterham.rotary" target="_blank" rel="noopener noreferrer" style={{ fontSize: '1.5rem', color: 'var(--text-primary)' }}>
                        <FaFacebook />
                    </a>
                </div>

                <div style={{ marginTop: '20px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    <p>© {new Date().getFullYear()} Caterham Rotary Club. Registered Charity No. 254116.</p>
                    <div style={{ marginTop: '10px' }}>
                        <a href="/privacy-policy" style={{ margin: '0 10px', color: 'inherit', textDecoration: 'none' }}>Privacy Policy</a>
                        |
                        <a href="/terms-conditions" style={{ margin: '0 10px', color: 'inherit', textDecoration: 'none' }}>Terms & Conditions</a>
                        |
                        <a href="/cookie-policy" style={{ margin: '0 10px', color: 'inherit', textDecoration: 'none' }}>Cookie Policy</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;

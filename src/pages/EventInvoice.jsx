import React from 'react';

const EventInvoice = () => {
    return (
        <div className="container section-padding" style={{ minHeight: '80vh' }}>
            <div style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto' }}>
                <div style={{ fontSize: '5rem', marginBottom: '2rem' }}>🧾</div>
                <h1 className="text-gradient" style={{ fontSize: '3rem', marginBottom: '1.5rem' }}>
                    Event Invoicing
                </h1>
                <p className="glass-panel" style={{ padding: '2rem', borderRadius: '16px', fontSize: '1.1rem', lineHeight: '1.8' }}>
                    Need an invoice for one of our events or services?
                    This page will help you request and manage invoices for Rotary Club activities.
                    <br /><br />
                    <strong>Coming Soon:</strong> Invoice request and management tools will be available here.
                </p>
            </div>
        </div>
    );
};

export default EventInvoice;

import React, { useState } from 'react';

const EventBreakfast = () => {
    const [submitStatus, setSubmitStatus] = useState(null); // 'submitting', 'success', 'error'
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        num_adults: '1',
        num_children: '0',
        dietary_requirements: ''
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitStatus('submitting');

        try {
            const response = await fetch('/api/bunny-run/breakfast-bookings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                setSubmitStatus('success');
            } else {
                setSubmitStatus('error');
            }
        } catch (error) {
            console.error('Error submitting booking:', error);
            setSubmitStatus('error');
        }
    };

    if (submitStatus === 'success') {
        return (
            <div className="container section-padding" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', borderRadius: '1rem', maxWidth: '600px' }}>
                    <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>🥞</div>
                    <h2 style={{ fontSize: '2rem', marginBottom: '1rem', color: 'var(--slate-900)' }}>Yum! Breakfast Booked!</h2>
                    <p style={{ fontSize: '1.1rem', color: 'var(--slate-600)', marginBottom: '2rem' }}>
                        Identify confirmation has been sent to <strong>{formData.email}</strong>.
                        We look forward to sharing a meal with you!
                    </p>
                    <button
                        className="fancy-button"
                        onClick={() => {
                            setSubmitStatus(null);
                            setFormData({
                                name: '',
                                email: '',
                                phone: '',
                                num_adults: '1',
                                num_children: '0',
                                dietary_requirements: ''
                            });
                        }}
                    >
                        Book Another Breakfast
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="container section-padding" style={{ minHeight: '80vh' }}>
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                    <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🥞</div>
                    <h1 className="text-gradient" style={{ fontSize: '3rem', marginBottom: '1rem', lineHeight: '1.2' }}>
                        Rotary Breakfast
                    </h1>
                    <p style={{ fontSize: '1.1rem', color: 'var(--slate-600)', maxWidth: '600px', margin: '0 auto' }}>
                        Join us for a delicious community breakfast. Great food, great company, and all for a good cause!
                    </p>
                </div>

                <div className="glass-panel" style={{ padding: '2rem', borderRadius: '1rem' }}>
                    <form onSubmit={handleSubmit}>
                        <div style={{ display: 'grid', gap: '1.5rem' }}>
                            <div className="grid-2">
                                <div>
                                    <label style={labelStyle}>Full Name *</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        required
                                        style={inputStyle}
                                        placeholder="Your name"
                                    />
                                </div>
                                <div>
                                    <label style={labelStyle}>Email Address *</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        required
                                        style={inputStyle}
                                        placeholder="For confirmation"
                                    />
                                </div>
                            </div>

                            <div className="grid-2">
                                <div>
                                    <label style={labelStyle}>Phone Number</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        style={inputStyle}
                                        placeholder="Mobile number"
                                    />
                                </div>
                                <div>
                                    <label style={labelStyle}>Dietary Requirements</label>
                                    <input
                                        type="text"
                                        name="dietary_requirements"
                                        value={formData.dietary_requirements}
                                        onChange={handleInputChange}
                                        style={inputStyle}
                                        placeholder="e.g., Vegetarian, Gluten-free..."
                                    />
                                </div>
                            </div>

                            <div className="grid-2">
                                <div>
                                    <label style={labelStyle}>Number of Adults (£10) *</label>
                                    <input
                                        type="number"
                                        name="num_adults"
                                        value={formData.num_adults}
                                        onChange={handleInputChange}
                                        required
                                        min="1"
                                        style={inputStyle}
                                    />
                                </div>
                                <div>
                                    <label style={labelStyle}>Number of Children (£5)</label>
                                    <input
                                        type="number"
                                        name="num_children"
                                        value={formData.num_children}
                                        onChange={handleInputChange}
                                        min="0"
                                        style={inputStyle}
                                    />
                                </div>
                            </div>

                            <div style={{
                                background: 'var(--slate-50)',
                                padding: '1.5rem',
                                borderRadius: '0.5rem',
                                marginTop: '1rem',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                border: '1px solid var(--slate-200)'
                            }}>
                                <span style={{ fontWeight: '600', color: 'var(--slate-700)' }}>Total to Pay</span>
                                <span style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--primary)' }}>
                                    £{(parseInt(formData.num_adults || 0) * 10) + (parseInt(formData.num_children || 0) * 5)}
                                </span>
                            </div>

                            {submitStatus === 'error' && (
                                <div style={{ padding: '1rem', background: '#fee2e2', color: '#dc2626', borderRadius: '0.5rem' }}>
                                    Something went wrong. Please try again or contact us directly.
                                </div>
                            )}

                            <button
                                type="submit"
                                className="fancy-button"
                                disabled={submitStatus === 'submitting'}
                                style={{ width: '100%', marginTop: '1rem', opacity: submitStatus === 'submitting' ? 0.7 : 1 }}
                            >
                                {submitStatus === 'submitting' ? 'Booking...' : 'Confirm Breakfast Booking'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

const labelStyle = {
    display: 'block',
    marginBottom: '0.5rem',
    fontWeight: '600',
    color: 'var(--slate-700)'
};

const inputStyle = {
    width: '100%',
    padding: '0.75rem 1rem',
    borderRadius: '0.5rem',
    border: '1px solid var(--slate-200)',
    fontSize: '1rem',
    background: 'white',
    outline: 'none',
    transition: 'border-color 0.2s'
};

export default EventBreakfast;

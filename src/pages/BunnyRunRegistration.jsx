import React, { useState } from 'react';

const BunnyRunRegistration = () => {
    const [activeForm, setActiveForm] = useState('race');
    const [submitted, setSubmitted] = useState(false);

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 50%, #fbbf24 100%)',
            padding: '2rem 1rem'
        }}>
            <div style={{
                maxWidth: '800px',
                margin: '0 auto'
            }}>
                {/* Header */}
                <div style={{
                    textAlign: 'center',
                    marginBottom: '3rem'
                }}>
                    <h1 style={{
                        fontSize: '3rem',
                        fontWeight: '800',
                        background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        margin: '0 0 1rem 0',
                        lineHeight: '1.2'
                    }}>
                        🐰 Easter Bunny Fun Run
                    </h1>
                    <p style={{
                        fontSize: '1.25rem',
                        color: '#78350f',
                        margin: 0,
                        fontWeight: '500'
                    }}>
                        Register for the race, book Santa visits, or reserve breakfast!
                    </p>
                </div>

                {/* Form Type Selector */}
                <div style={{
                    background: 'white',
                    padding: '1rem',
                    borderRadius: '1rem',
                    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
                    marginBottom: '2rem',
                    display: 'flex',
                    gap: '0.5rem',
                    flexWrap: 'wrap'
                }}>
                    {[
                        { id: 'race', label: '🏃 Race Registration', icon: '🏃' },
                        { id: 'santa', label: '🎅 Santa Booking', icon: '🎅' },
                        { id: 'breakfast', label: '🥞 Breakfast Booking', icon: '🥞' }
                    ].map(form => (
                        <button
                            key={form.id}
                            onClick={() => {
                                setActiveForm(form.id);
                                setSubmitted(false);
                            }}
                            style={{
                                flex: 1,
                                minWidth: '150px',
                                padding: '1rem',
                                borderRadius: '0.75rem',
                                border: 'none',
                                background: activeForm === form.id
                                    ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
                                    : 'transparent',
                                color: activeForm === form.id ? 'white' : '#78350f',
                                fontSize: '0.95rem',
                                fontWeight: '600',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                boxShadow: activeForm === form.id ? '0 4px 15px rgba(245, 158, 11, 0.3)' : 'none'
                            }}
                        >
                            {form.label}
                        </button>
                    ))}
                </div>

                {/* Forms */}
                <div style={{
                    background: 'white',
                    padding: '2.5rem',
                    borderRadius: '1.5rem',
                    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)'
                }}>
                    {submitted ? (
                        <SuccessMessage onReset={() => setSubmitted(false)} />
                    ) : (
                        <>
                            {activeForm === 'race' && <RaceRegistrationForm onSuccess={() => setSubmitted(true)} />}
                            {activeForm === 'santa' && <SantaBookingForm onSuccess={() => setSubmitted(true)} />}
                            {activeForm === 'breakfast' && <BreakfastBookingForm onSuccess={() => setSubmitted(true)} />}
                        </>
                    )}
                </div>

                {/* Footer Info */}
                <div style={{
                    textAlign: 'center',
                    marginTop: '2rem',
                    color: '#78350f',
                    fontSize: '0.875rem'
                }}>
                    <p>Questions? Contact us at <strong>info@caterhamrotary.org</strong></p>
                </div>
            </div>
        </div>
    );
};

// Race Registration Form
const RaceRegistrationForm = ({ onSuccess }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        event_type: '5k',
        age: '',
        postcode: '',
        consent_fitness: false,
        consent_photos: false
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch('/api/bunny-run/registrations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                onSuccess();
            } else {
                alert('Registration failed. Please try again.');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Registration failed. Please try again.');
        }

        setLoading(false);
    };

    return (
        <form onSubmit={handleSubmit}>
            <h2 style={{
                fontSize: '1.75rem',
                fontWeight: '700',
                color: '#78350f',
                margin: '0 0 1.5rem 0'
            }}>
                🏃 Race Registration
            </h2>

            <div style={{ display: 'grid', gap: '1.25rem' }}>
                <div>
                    <label style={labelStyle}>Full Name *</label>
                    <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        style={inputStyle}
                        required
                    />
                </div>

                <div>
                    <label style={labelStyle}>Email *</label>
                    <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        style={inputStyle}
                        required
                    />
                </div>

                <div>
                    <label style={labelStyle}>Phone</label>
                    <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        style={inputStyle}
                    />
                </div>

                <div>
                    <label style={labelStyle}>Event Type *</label>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <label style={{
                            flex: 1,
                            padding: '1rem',
                            border: `2px solid ${formData.event_type === '5k' ? '#f59e0b' : '#e5e7eb'}`,
                            borderRadius: '0.75rem',
                            cursor: 'pointer',
                            background: formData.event_type === '5k' ? '#fef3c7' : 'white',
                            transition: 'all 0.2s',
                            textAlign: 'center'
                        }}>
                            <input
                                type="radio"
                                name="event_type"
                                value="5k"
                                checked={formData.event_type === '5k'}
                                onChange={(e) => setFormData({ ...formData, event_type: e.target.value })}
                                style={{ marginRight: '0.5rem' }}
                            />
                            <strong>5k Race</strong> (£7)
                        </label>
                        <label style={{
                            flex: 1,
                            padding: '1rem',
                            border: `2px solid ${formData.event_type === '1k' ? '#f59e0b' : '#e5e7eb'}`,
                            borderRadius: '0.75rem',
                            cursor: 'pointer',
                            background: formData.event_type === '1k' ? '#fef3c7' : 'white',
                            transition: 'all 0.2s',
                            textAlign: 'center'
                        }}>
                            <input
                                type="radio"
                                name="event_type"
                                value="1k"
                                checked={formData.event_type === '1k'}
                                onChange={(e) => setFormData({ ...formData, event_type: e.target.value })}
                                style={{ marginRight: '0.5rem' }}
                            />
                            <strong>1k Fun Run</strong> (£5)
                        </label>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                        <label style={labelStyle}>Age</label>
                        <input
                            type="number"
                            value={formData.age}
                            onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                            style={inputStyle}
                            min="1"
                        />
                    </div>
                    <div>
                        <label style={labelStyle}>Postcode</label>
                        <input
                            type="text"
                            value={formData.postcode}
                            onChange={(e) => setFormData({ ...formData, postcode: e.target.value })}
                            style={inputStyle}
                        />
                    </div>
                </div>

                <div style={{
                    background: '#fef3c7',
                    padding: '1.5rem',
                    borderRadius: '0.75rem',
                    border: '2px solid #fbbf24'
                }}>
                    <label style={{ display: 'flex', alignItems: 'start', gap: '0.75rem', marginBottom: '1rem', cursor: 'pointer' }}>
                        <input
                            type="checkbox"
                            checked={formData.consent_fitness}
                            onChange={(e) => setFormData({ ...formData, consent_fitness: e.target.checked })}
                            style={{ marginTop: '0.25rem' }}
                            required
                        />
                        <span style={{ fontSize: '0.875rem', color: '#78350f' }}>
                            I confirm that I am fit and healthy to participate in this event *
                        </span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'start', gap: '0.75rem', cursor: 'pointer' }}>
                        <input
                            type="checkbox"
                            checked={formData.consent_photos}
                            onChange={(e) => setFormData({ ...formData, consent_photos: e.target.checked })}
                            style={{ marginTop: '0.25rem' }}
                        />
                        <span style={{ fontSize: '0.875rem', color: '#78350f' }}>
                            I consent to photos being taken during the event for promotional purposes
                        </span>
                    </label>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    style={{
                        padding: '1rem 2rem',
                        borderRadius: '0.75rem',
                        border: 'none',
                        background: loading ? '#d1d5db' : 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                        color: 'white',
                        fontSize: '1rem',
                        fontWeight: '700',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        transition: 'all 0.2s',
                        boxShadow: '0 4px 15px rgba(245, 158, 11, 0.3)'
                    }}
                >
                    {loading ? 'Submitting...' : '🎉 Complete Registration'}
                </button>
            </div>
        </form>
    );
};

// Santa Booking Form
const SantaBookingForm = ({ onSuccess }) => {
    const [formData, setFormData] = useState({
        parent_name: '',
        email: '',
        phone: '',
        child_name: '',
        child_age: '',
        time_slot: '',
        special_requests: ''
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch('/api/bunny-run/santa-bookings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                onSuccess();
            } else {
                alert('Booking failed. Please try again.');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Booking failed. Please try again.');
        }

        setLoading(false);
    };

    return (
        <form onSubmit={handleSubmit}>
            <h2 style={{
                fontSize: '1.75rem',
                fontWeight: '700',
                color: '#78350f',
                margin: '0 0 1.5rem 0'
            }}>
                🎅 Book a Visit from Santa
            </h2>

            <div style={{ display: 'grid', gap: '1.25rem' }}>
                <div>
                    <label style={labelStyle}>Parent/Guardian Name *</label>
                    <input
                        type="text"
                        value={formData.parent_name}
                        onChange={(e) => setFormData({ ...formData, parent_name: e.target.value })}
                        style={inputStyle}
                        required
                    />
                </div>

                <div>
                    <label style={labelStyle}>Email *</label>
                    <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        style={inputStyle}
                        required
                    />
                </div>

                <div>
                    <label style={labelStyle}>Phone</label>
                    <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        style={inputStyle}
                    />
                </div>

                <div>
                    <label style={labelStyle}>Child's Name *</label>
                    <input
                        type="text"
                        value={formData.child_name}
                        onChange={(e) => setFormData({ ...formData, child_name: e.target.value })}
                        style={inputStyle}
                        required
                    />
                </div>

                <div>
                    <label style={labelStyle}>Child's Age</label>
                    <input
                        type="number"
                        value={formData.child_age}
                        onChange={(e) => setFormData({ ...formData, child_age: e.target.value })}
                        style={inputStyle}
                        min="1"
                        max="12"
                    />
                </div>

                <div>
                    <label style={labelStyle}>Preferred Time Slot</label>
                    <select
                        value={formData.time_slot}
                        onChange={(e) => setFormData({ ...formData, time_slot: e.target.value })}
                        style={inputStyle}
                    >
                        <option value="">Select a time...</option>
                        <option value="10:00 AM">10:00 AM</option>
                        <option value="10:30 AM">10:30 AM</option>
                        <option value="11:00 AM">11:00 AM</option>
                        <option value="11:30 AM">11:30 AM</option>
                        <option value="12:00 PM">12:00 PM</option>
                        <option value="12:30 PM">12:30 PM</option>
                        <option value="1:00 PM">1:00 PM</option>
                        <option value="1:30 PM">1:30 PM</option>
                    </select>
                </div>

                <div>
                    <label style={labelStyle}>Special Requests</label>
                    <textarea
                        value={formData.special_requests}
                        onChange={(e) => setFormData({ ...formData, special_requests: e.target.value })}
                        style={{ ...inputStyle, minHeight: '100px', resize: 'vertical' }}
                        placeholder="Any special requests or things Santa should know?"
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    style={{
                        padding: '1rem 2rem',
                        borderRadius: '0.75rem',
                        border: 'none',
                        background: loading ? '#d1d5db' : 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)',
                        color: 'white',
                        fontSize: '1rem',
                        fontWeight: '700',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        transition: 'all 0.2s',
                        boxShadow: '0 4px 15px rgba(220, 38, 38, 0.3)'
                    }}
                >
                    {loading ? 'Booking...' : '🎅 Book Santa Visit'}
                </button>
            </div>
        </form>
    );
};

// Breakfast Booking Form
const BreakfastBookingForm = ({ onSuccess }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        num_adults: 0,
        num_children: 0,
        dietary_requirements: ''
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch('/api/bunny-run/breakfast-bookings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                onSuccess();
            } else {
                alert('Booking failed. Please try again.');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Booking failed. Please try again.');
        }

        setLoading(false);
    };

    const totalGuests = (parseInt(formData.num_adults) || 0) + (parseInt(formData.num_children) || 0);

    return (
        <form onSubmit={handleSubmit}>
            <h2 style={{
                fontSize: '1.75rem',
                fontWeight: '700',
                color: '#78350f',
                margin: '0 0 1.5rem 0'
            }}>
                🥞 Breakfast Booking
            </h2>

            <div style={{ display: 'grid', gap: '1.25rem' }}>
                <div>
                    <label style={labelStyle}>Name *</label>
                    <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        style={inputStyle}
                        required
                    />
                </div>

                <div>
                    <label style={labelStyle}>Email *</label>
                    <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        style={inputStyle}
                        required
                    />
                </div>

                <div>
                    <label style={labelStyle}>Phone</label>
                    <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        style={inputStyle}
                    />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                        <label style={labelStyle}>Number of Adults</label>
                        <input
                            type="number"
                            value={formData.num_adults}
                            onChange={(e) => setFormData({ ...formData, num_adults: e.target.value })}
                            style={inputStyle}
                            min="0"
                        />
                    </div>
                    <div>
                        <label style={labelStyle}>Number of Children</label>
                        <input
                            type="number"
                            value={formData.num_children}
                            onChange={(e) => setFormData({ ...formData, num_children: e.target.value })}
                            style={inputStyle}
                            min="0"
                        />
                    </div>
                </div>

                {totalGuests > 0 && (
                    <div style={{
                        background: '#fef3c7',
                        padding: '1rem',
                        borderRadius: '0.75rem',
                        textAlign: 'center',
                        fontWeight: '600',
                        color: '#78350f'
                    }}>
                        Total Guests: {totalGuests}
                    </div>
                )}

                <div>
                    <label style={labelStyle}>Dietary Requirements</label>
                    <textarea
                        value={formData.dietary_requirements}
                        onChange={(e) => setFormData({ ...formData, dietary_requirements: e.target.value })}
                        style={{ ...inputStyle, minHeight: '100px', resize: 'vertical' }}
                        placeholder="Any allergies or dietary requirements we should know about?"
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading || totalGuests === 0}
                    style={{
                        padding: '1rem 2rem',
                        borderRadius: '0.75rem',
                        border: 'none',
                        background: (loading || totalGuests === 0) ? '#d1d5db' : 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                        color: 'white',
                        fontSize: '1rem',
                        fontWeight: '700',
                        cursor: (loading || totalGuests === 0) ? 'not-allowed' : 'pointer',
                        transition: 'all 0.2s',
                        boxShadow: '0 4px 15px rgba(245, 158, 11, 0.3)'
                    }}
                >
                    {loading ? 'Booking...' : '🥞 Book Breakfast'}
                </button>
            </div>
        </form>
    );
};

// Success Message Component
const SuccessMessage = ({ onReset }) => (
    <div style={{ textAlign: 'center', padding: '2rem' }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎉</div>
        <h2 style={{
            fontSize: '2rem',
            fontWeight: '700',
            color: '#78350f',
            margin: '0 0 1rem 0'
        }}>
            Success!
        </h2>
        <p style={{
            fontSize: '1.1rem',
            color: '#78350f',
            marginBottom: '2rem'
        }}>
            Your booking has been received. We'll send you a confirmation email shortly.
        </p>
        <button
            onClick={onReset}
            style={{
                padding: '0.75rem 2rem',
                borderRadius: '0.75rem',
                border: '2px solid #f59e0b',
                background: 'white',
                color: '#f59e0b',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s'
            }}
        >
            Make Another Booking
        </button>
    </div>
);

// Shared Styles
const labelStyle = {
    display: 'block',
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#78350f',
    marginBottom: '0.5rem'
};

const inputStyle = {
    width: '100%',
    padding: '0.75rem',
    border: '2px solid #e5e7eb',
    borderRadius: '0.5rem',
    fontSize: '1rem',
    outline: 'none',
    transition: 'border-color 0.2s'
};

export default BunnyRunRegistration;

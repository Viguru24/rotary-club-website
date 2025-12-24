import React, { useState, useEffect } from 'react';

const EventSantaTour = () => {
    const [step, setStep] = useState(1);
    const [schedules, setSchedules] = useState([]);
    const [selectedSchedule, setSelectedSchedule] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitStatus, setSubmitStatus] = useState(null); // 'submitting', 'success', 'error'

    const [formData, setFormData] = useState({
        parent_name: '',
        child_name: '',
        child_age: '',
        email: '',
        phone: '',
        postcode: '',
        special_requests: ''
    });

    useEffect(() => {
        fetchSchedules();
    }, []);

    const fetchSchedules = async () => {
        try {
            // Fetch schedules that are in the future
            const response = await fetch('/api/santa-tour/schedules');
            if (response.ok) {
                const data = await response.json();
                // Filter for future dates only
                const futureSchedules = data.filter(s => new Date(s.date) >= new Date().setHours(0, 0, 0, 0));
                setSchedules(futureSchedules);
            } else {
                console.error('Failed to fetch schedules');
            }
        } catch (error) {
            console.error('Error fetching schedules:', error);
        }
        setLoading(false);
    };

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

        const bookingData = {
            ...formData,
            // Map schedule details to time_slot since backend doesn't have schedule_id
            time_slot: `Night ${selectedSchedule.night_number} (${new Date(selectedSchedule.date).toLocaleDateString()}) - Route ${selectedSchedule.route_id}`,
            schedule_id: selectedSchedule.id, // Keeping these for reference if backend updates
            date: selectedSchedule.date,
            route_id: selectedSchedule.route_id
        };

        try {
            const response = await fetch('/api/bunny-run/santa-bookings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(bookingData),
            });

            if (response.ok) {
                setSubmitStatus('success');
                setStep(3); // Success step
            } else {
                setSubmitStatus('error');
            }
        } catch (error) {
            console.error('Error submitting booking:', error);
            setSubmitStatus('error');
        }
    };

    if (loading) {
        return (
            <div className="container section-padding" style={{ minHeight: '60vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <div style={{ color: 'var(--slate-500)', fontSize: '1.2rem' }}>Loading magical dates... 🎅</div>
            </div>
        );
    }

    return (
        <div className="container section-padding" style={{ minHeight: '80vh' }}>
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                    <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎅</div>
                    <h1 className="text-gradient" style={{ fontSize: '3rem', marginBottom: '1rem', lineHeight: '1.2' }}>
                        Santa's Magical Tour
                    </h1>
                    <p style={{ fontSize: '1.1rem', color: 'var(--slate-600)', maxWidth: '600px', margin: '0 auto' }}>
                        Santa is coming to Caterham! Book a special visit for your little ones as Santa makes his way through the neighborhood.
                    </p>
                </div>

                {/* Progress Steps */}
                {step < 3 && (
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '3rem', gap: '1rem' }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            opacity: step === 1 ? 1 : 0.5
                        }}>
                            <div style={{
                                width: '2rem', height: '2rem', borderRadius: '50%',
                                background: step === 1 ? 'var(--primary)' : 'var(--slate-200)',
                                color: step === 1 ? 'white' : 'var(--slate-500)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold'
                            }}>1</div>
                            <span style={{ fontWeight: '600' }}>Choose Date</span>
                        </div>
                        <div style={{ width: '50px', height: '2px', background: 'var(--slate-200)', alignSelf: 'center' }}></div>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            opacity: step === 2 ? 1 : 0.5
                        }}>
                            <div style={{
                                width: '2rem', height: '2rem', borderRadius: '50%',
                                background: step === 2 ? 'var(--primary)' : 'var(--slate-200)',
                                color: step === 2 ? 'white' : 'var(--slate-500)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold'
                            }}>2</div>
                            <span style={{ fontWeight: '600' }}>Your Details</span>
                        </div>
                    </div>
                )}

                {/* Step 1: Select Schedule */}
                {step === 1 && (
                    <div className="grid-2">
                        {schedules.length === 0 ? (
                            <div className="glass-panel" style={{ gridColumn: '1 / -1', padding: '3rem', textAlign: 'center' }}>
                                <p style={{ fontSize: '1.2rem', color: 'var(--slate-500)' }}>
                                    Santa's schedule is still being finalized. Please check back soon! 🎄
                                </p>
                            </div>
                        ) : (
                            schedules.map(schedule => (
                                <div
                                    key={schedule.id}
                                    className="glass-panel"
                                    style={{
                                        padding: '1.5rem',
                                        borderRadius: '1rem',
                                        cursor: 'pointer',
                                        border: selectedSchedule?.id === schedule.id ? '2px solid var(--primary)' : '2px solid transparent',
                                        transition: 'all 0.2s',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '0.5rem'
                                    }}
                                    onClick={() => setSelectedSchedule(schedule)}
                                >
                                    <div style={{
                                        fontSize: '0.9rem',
                                        fontWeight: '700',
                                        color: 'var(--primary)',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.5px'
                                    }}>
                                        Night {schedule.night_number}
                                    </div>
                                    <h3 style={{ fontSize: '1.5rem', margin: 0 }}>
                                        {new Date(schedule.date).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}
                                    </h3>
                                    <div style={{ display: 'flex', gap: '0.5rem', color: 'var(--slate-600)', alignItems: 'center' }}>
                                        <span>📍</span>
                                        <span>Route {schedule.route_id}</span>
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.5rem', color: 'var(--slate-600)', alignItems: 'center' }}>
                                        <span>⏰</span>
                                        <span>Starts {schedule.start_time || '6:00 PM'}</span>
                                    </div>
                                    {selectedSchedule?.id === schedule.id && (
                                        <button
                                            className="fancy-button"
                                            style={{ marginTop: '1rem', width: '100%' }}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setStep(2);
                                            }}
                                        >
                                            Select This Night
                                        </button>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                )}

                {/* Step 2: Booking Form */}
                {step === 2 && (
                    <form onSubmit={handleSubmit} className="glass-panel" style={{ padding: '2rem', borderRadius: '1rem' }}>
                        <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem', paddingBottom: '1rem', borderBottom: '1px solid var(--slate-100)' }}>
                            <button
                                type="button"
                                onClick={() => setStep(1)}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.5rem' }}
                            >
                                ←
                            </button>
                            <div>
                                <div style={{ fontSize: '0.9rem', color: 'var(--slate-500)' }}>Selected Date</div>
                                <div style={{ fontWeight: '700', fontSize: '1.1rem' }}>
                                    {new Date(selectedSchedule.date).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gap: '1.5rem' }}>
                            <div className="grid-2">
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'var(--slate-700)' }}>Parent Name *</label>
                                    <input
                                        type="text"
                                        name="parent_name"
                                        value={formData.parent_name}
                                        onChange={handleInputChange}
                                        required
                                        style={inputStyle}
                                        placeholder="Your full name"
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'var(--slate-700)' }}>Email Address *</label>
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
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'var(--slate-700)' }}>Child's Name *</label>
                                    <input
                                        type="text"
                                        name="child_name"
                                        value={formData.child_name}
                                        onChange={handleInputChange}
                                        required
                                        style={inputStyle}
                                        placeholder="Name of child"
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'var(--slate-700)' }}>Child's Age</label>
                                    <input
                                        type="text"
                                        name="child_age"
                                        value={formData.child_age}
                                        onChange={handleInputChange}
                                        style={inputStyle}
                                        placeholder="Age"
                                    />
                                </div>
                            </div>

                            <div className="grid-2">
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'var(--slate-700)' }}>Phone Number *</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        required
                                        style={inputStyle}
                                        placeholder="Mobile number"
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'var(--slate-700)' }}>Postcode *</label>
                                    <input
                                        type="text"
                                        name="postcode"
                                        value={formData.postcode}
                                        onChange={handleInputChange}
                                        required
                                        style={inputStyle}
                                        placeholder="e.g., CR3 5..."
                                    />
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'var(--slate-700)' }}>Special Requests</label>
                                <textarea
                                    name="special_requests"
                                    value={formData.special_requests}
                                    onChange={handleInputChange}
                                    style={{ ...inputStyle, minHeight: '100px', resize: 'vertical' }}
                                    placeholder="Any specific instructions for Santa or his helpers to find you?"
                                />
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
                                {submitStatus === 'submitting' ? 'Confirming with Santa...' : 'Confirm Booking'}
                            </button>
                        </div>
                    </form>
                )}

                {/* Step 3: Success */}
                {step === 3 && (
                    <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', borderRadius: '1rem' }}>
                        <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>🎄</div>
                        <h2 style={{ fontSize: '2rem', marginBottom: '1rem', color: 'var(--slate-900)' }}>Booking Confirmed!</h2>
                        <p style={{ fontSize: '1.1rem', color: 'var(--slate-600)', marginBottom: '2rem' }}>
                            Thank you! Santa is looking forward to seeing you on <strong>{new Date(selectedSchedule.date).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}</strong>.
                            We've sent a confirmation email to {formData.email}.
                        </p>
                        <button
                            className="fancy-button"
                            onClick={() => {
                                setStep(1);
                                setFormData({
                                    parent_name: '',
                                    child_name: '',
                                    child_age: '',
                                    email: '',
                                    phone: '',
                                    postcode: '',
                                    special_requests: ''
                                });
                                setSelectedSchedule(null);
                                setSubmitStatus(null);
                            }}
                        >
                            Book Another Visit
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
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

export default EventSantaTour;

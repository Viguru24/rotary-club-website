import React, { useState, useEffect } from 'react';
import '../bunny-run.css';

const BunnyFunRun = () => {
    const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
    const [formData, setFormData] = useState({
        event_type: '',
        name: '',
        age: '',
        address: '',
        postcode: '',
        phone: '',
        email: '',
        consent_fitness: false,
        consent_photos: false
    });

    // Countdown timer
    useEffect(() => {
        const targetDate = new Date('2026-04-12T10:00:00').getTime();

        const updateCountdown = () => {
            const now = new Date().getTime();
            const distance = targetDate - now;

            if (distance > 0) {
                setCountdown({
                    days: Math.floor(distance / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                    minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
                    seconds: Math.floor((distance % (1000 * 60)) / 1000)
                });
            }
        };

        updateCountdown();
        const interval = setInterval(updateCountdown, 1000);
        return () => clearInterval(interval);
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch('/api/bunny-run/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                alert('Registration successful! You will receive a confirmation email shortly.');
                setFormData({
                    event_type: '',
                    name: '',
                    age: '',
                    address: '',
                    postcode: '',
                    phone: '',
                    email: '',
                    consent_fitness: false,
                    consent_photos: false
                });
            } else {
                alert('Registration failed. Please try again.');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred. Please try again.');
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    return (
        <div className="bunny-run-page">
            {/* Hero Section */}
            <section className="hero">
                <div className="hero-content fade-in-up">
                    <span className="eyebrow">Sunday 12th April 2026</span>
                    <h1>Easter Bunny <br /> Fun Run & 5k</h1>
                    <p>Join us at Queens Park, Caterham on the Hill</p>
                    <div className="hero-stats">
                        <div className="stat-item">
                            <span className="stat-number">10:00</span>
                            <span className="stat-label">1k Fun Run</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-number">10:30</span>
                            <span className="stat-label">5k Race</span>
                        </div>
                    </div>
                </div>
                <div className="hero-visual">
                    <img src="/bunny-run/bunny.png" alt="Easter Bunny Runner" className="floating-bunny" />
                </div>
            </section>

            {/* Countdown Section */}
            <section className="countdown-section fade-in-up">
                <div className="glass-strip">
                    <h2>Race Starts In</h2>
                    <div className="countdown-timer">
                        <div className="time-unit">
                            <span>{String(countdown.days).padStart(2, '0')}</span>
                            <label>Days</label>
                        </div>
                        <div className="time-unit">
                            <span>{String(countdown.hours).padStart(2, '0')}</span>
                            <label>Hours</label>
                        </div>
                        <div className="time-unit">
                            <span>{String(countdown.minutes).padStart(2, '0')}</span>
                            <label>Mins</label>
                        </div>
                        <div className="time-unit">
                            <span>{String(countdown.seconds).padStart(2, '0')}</span>
                            <label>Secs</label>
                        </div>
                    </div>
                </div>
            </section>

            {/* Details Section */}
            <section className="details-grid">
                <div className="card glass-card">
                    <h3>The Course</h3>
                    <p>An undulating course on grass, pathway and track through Chaldon and Caterham on the Hill.</p>
                </div>
                <div className="card glass-card">
                    <h3>Location</h3>
                    <iframe
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2492.673238676231!2d-0.0844!3d51.2855!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4875fe5b2b62b1b7%3A0x40eae2da2cc4400!2sQueen's%20Park!5e0!3m2!1sen!2suk!4v1710000000000!5m2!1sen!2suk"
                        width="100%"
                        height="200"
                        style={{ border: 0, borderRadius: 'var(--radius-md)' }}
                        allowFullScreen=""
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                    />
                </div>
                <div className="card glass-card">
                    <h3>Prizes & Goodies</h3>
                    <p>ALL finishers receive an Easter Egg! Prizes in each run for 'Best Dressed Bunnies'.</p>
                </div>
                <div className="card glass-card">
                    <h3>Entry Fees</h3>
                    <ul className="price-list">
                        <li><strong>£7</strong> for 5k Race</li>
                        <li><strong>£5</strong> for 1k Fun Run</li>
                        <li><em>Double on the day!</em></li>
                    </ul>
                </div>
            </section>

            {/* Gallery Section */}
            <section className="gallery-section">
                <h2>Bunny Highlights</h2>
                <div className="gallery-grid">
                    <div className="gallery-item glass-card">
                        <img src="/bunny-run/gallery1.png" alt="Bunnies stretching" />
                    </div>
                    <div className="gallery-item glass-card">
                        <img src="/bunny-run/gallery2.png" alt="Bunny winning" />
                    </div>
                    <div className="gallery-item glass-card">
                        <img src="/bunny-run/gallery3.png" alt="Bunny hydrating" />
                    </div>
                </div>
            </section>

            {/* Registration Form */}
            <section id="register" className="registration-section">
                <div className="form-container glass-panel">
                    <h2>Registration</h2>
                    <p className="form-intro">
                        To apply, fill out the details below. Registration fee and signed form required for each runner.
                    </p>

                    <form onSubmit={handleSubmit}>
                        <div className="form-group event-selection">
                            <label className="radio-card">
                                <input
                                    type="radio"
                                    name="event_type"
                                    value="1k"
                                    checked={formData.event_type === '1k'}
                                    onChange={handleChange}
                                    required
                                />
                                <span className="card-content">
                                    <span className="event-name">1k Fun Run</span>
                                    <span className="price">£5</span>
                                </span>
                            </label>
                            <label className="radio-card">
                                <input
                                    type="radio"
                                    name="event_type"
                                    value="5k"
                                    checked={formData.event_type === '5k'}
                                    onChange={handleChange}
                                    required
                                />
                                <span className="card-content">
                                    <span className="event-name">5k Race</span>
                                    <span className="price">£7</span>
                                </span>
                            </label>
                        </div>

                        <div className="input-grid">
                            <div className="form-group">
                                <label htmlFor="name">Full Name</label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    placeholder="Jane Doe"
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="age">Age (if under 14)</label>
                                <input
                                    type="number"
                                    id="age"
                                    name="age"
                                    value={formData.age}
                                    onChange={handleChange}
                                    placeholder="10"
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="address">Address</label>
                            <textarea
                                id="address"
                                name="address"
                                rows="2"
                                value={formData.address}
                                onChange={handleChange}
                                required
                                placeholder="123 Bunny Lane..."
                            />
                        </div>

                        <div className="input-grid">
                            <div className="form-group">
                                <label htmlFor="postcode">Post Code</label>
                                <input
                                    type="text"
                                    id="postcode"
                                    name="postcode"
                                    value={formData.postcode}
                                    onChange={handleChange}
                                    required
                                    placeholder="CR3 ---"
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="phone">Contact Tel</label>
                                <input
                                    type="tel"
                                    id="phone"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    required
                                    placeholder="07..."
                                />
                            </div>
                            <div className="form-group full-width">
                                <label htmlFor="email">Email</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    placeholder="jane@example.com"
                                />
                            </div>
                        </div>

                        <div className="disclaimer-box">
                            <label className="checkbox-container">
                                <input
                                    type="checkbox"
                                    name="consent_fitness"
                                    checked={formData.consent_fitness}
                                    onChange={handleChange}
                                    required
                                />
                                <span className="checkmark"></span>
                                <span className="text">
                                    I confirm I am fit to complete the run. I take part at my own risk and understand
                                    the promoters are not responsible for my well-being.
                                </span>
                            </label>
                            <label className="checkbox-container">
                                <input
                                    type="checkbox"
                                    name="consent_photos"
                                    checked={formData.consent_photos}
                                    onChange={handleChange}
                                />
                                <span className="checkmark"></span>
                                <span className="text">
                                    I consent to photographs being used for event promotion.
                                </span>
                            </label>
                        </div>

                        <button type="submit" className="submit-btn">Complete Registration</button>
                    </form>
                </div>
            </section>

            <section className="info-footer">
                <p>Please make cheques payable to <strong>'Rotary Club of Caterham'</strong></p>
                <address>
                    Send to: 'Rotary Runs', 11a Queens Park Road, Caterham, Surrey, CR3 5RB.
                </address>
                <p>Extra forms via <a href="http://caterhamrotary.org.uk/event">caterhamrotary.org.uk/event</a> or 01883 347348</p>
            </section>
        </div>
    );
};

export default BunnyFunRun;

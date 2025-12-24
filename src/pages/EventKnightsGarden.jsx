import React from 'react';

const EventKnightsGarden = () => {
    return (
        <div className="container section-padding" style={{ minHeight: '80vh' }}>
            <div style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto' }}>
                <div style={{ fontSize: '5rem', marginBottom: '2rem' }}>🎄</div>
                <h1 className="text-gradient" style={{ fontSize: '3rem', marginBottom: '1.5rem' }}>
                    Knights Garden Christmas Trees
                </h1>
                <p className="glass-panel" style={{ padding: '2rem', borderRadius: '16px', fontSize: '1.1rem', lineHeight: '1.8' }}>
                    Get your perfect Christmas tree from Knights Garden!
                    We offer a wide selection of fresh, locally-sourced Christmas trees.
                    <br /><br />
                    <strong>Coming Soon:</strong> Tree selection and ordering information will be available here.
                </p>
            </div>
        </div>
    );
};

export default EventKnightsGarden;

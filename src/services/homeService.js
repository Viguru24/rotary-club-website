const STORAGE_KEY = 'rotary_home_config';

const INITIAL_CONFIG = {
    heroTitle: 'Making a Difference<br />In Caterham',
    heroSubtitle: 'Caterham Rotary International is a nonprofit organisation based in Surrey dedicated to serving our community through friendship and action.',
    ctaText: 'Get Involved',
    ctaLink: '/join-us',
    statsText: '50+ Active Members',
    heroImages: [
        // Default gradient/abstract background for fallback
    ],
    featuredEventPages: [
        {
            id: 'bunny-run',
            title: 'Bunny Fun Run',
            icon: '🐰',
            path: '/events/bunny-run',
            description: 'Annual charity fun run for all ages',
            enabled: true
        },
        {
            id: 'santa-tour',
            title: 'Santa Tour',
            icon: '🎅',
            path: '/events/santa-tour',
            description: "Santa's Magical Christmas Tour around Caterham",
            enabled: true
        },
        {
            id: 'knights-garden',
            title: 'Knights Garden',
            icon: '🎄',
            path: '/events/knights-garden',
            description: 'Christmas trees from Knights Garden',
            enabled: true
        },
        {
            id: 'breakfast',
            title: 'Breakfast',
            icon: '🥞',
            path: '/events/breakfast',
            description: 'Community breakfast events',
            enabled: true
        },
        {
            id: 'invoice',
            title: 'Event Invoice',
            icon: '🧾',
            path: '/events/invoice',
            description: 'Generate invoices for event sponsorships',
            enabled: false
        }
    ]
};

export const getHomeConfig = () => {
    let config = INITIAL_CONFIG;
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            const parsed = JSON.parse(stored);
            // Deep merge or at least ensure all keys from INITIAL_CONFIG exist
            config = { ...INITIAL_CONFIG, ...parsed };
            // Ensure array fields are actually arrays if meant to be
            if (!Array.isArray(config.heroImages)) config.heroImages = [];
        } else {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_CONFIG));
        }
    } catch (e) {
        console.error("Error loading home config, resetting defaults", e);
        config = INITIAL_CONFIG;
    }

    // Auto-migrate old #join link
    if (config.ctaLink === '#join') {
        config.ctaLink = '/join-us';
        localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    }

    return config;
};

export const saveHomeConfig = (config) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    // Dispatch event so the frontend can react immediately if we want real-time updates (optional)
    window.dispatchEvent(new Event('home-config-updated'));
};

export const resetHomeConfig = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_CONFIG));
    window.dispatchEvent(new Event('home-config-updated'));
    return INITIAL_CONFIG;
};

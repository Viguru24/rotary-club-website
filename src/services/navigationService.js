const NAV_STORAGE_KEY = 'caterham_rotary_nav';

const DEFAULT_NAV_LINKS = [
    { id: '1', name: 'Home', path: '/', order: 0 },
    { id: '2', name: 'Blog', path: '/blog', order: 1 },
    { id: '4', name: 'Business Partners', path: '/business-partners', order: 2 },
    { id: '5', name: 'Where we meet', path: '/where-we-meet', order: 3 },
    { id: '3', name: 'Events', path: '/calendar', order: 4 },
    { id: '6', name: 'Join Us', path: '/join-us', order: 5 }
];

export const getNavLinks = () => {
    let links = DEFAULT_NAV_LINKS;
    const stored = localStorage.getItem(NAV_STORAGE_KEY);
    if (stored) {
        links = JSON.parse(stored);
    }

    // Force Migration to new structure (User request: Specific flat list)
    // If we have 'Calendar' or 'FAQ', or if order implies old structure, reset to defaults.
    // Also ensuring 'Events' is present instead of 'Calendar'.
    const hasOldItems = links.some(l => l.name === 'Calendar' || l.name === 'FAQ');
    const missingNewItems = !links.some(l => l.name === 'Events');

    if (hasOldItems || missingNewItems) {
        links = DEFAULT_NAV_LINKS;
        localStorage.setItem(NAV_STORAGE_KEY, JSON.stringify(links));
    }

    return links;
};

export const saveNavLinks = (links) => {
    localStorage.setItem(NAV_STORAGE_KEY, JSON.stringify(links));
    window.dispatchEvent(new Event('nav-updated'));
};

export const addNavLink = (link) => {
    const links = getNavLinks();
    const newLink = { ...link, id: Date.now().toString(), order: links.length };
    links.push(newLink);
    saveNavLinks(links);
};

export const deleteNavLink = (id) => {
    const links = getNavLinks();
    const filtered = links.filter(l => l.id !== id);
    saveNavLinks(filtered);
};

export const resetNavLinks = () => {
    localStorage.setItem(NAV_STORAGE_KEY, JSON.stringify(DEFAULT_NAV_LINKS));
    window.dispatchEvent(new Event('nav-updated'));
    return DEFAULT_NAV_LINKS;
};

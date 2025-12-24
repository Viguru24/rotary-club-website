const NAV_STORAGE_KEY = 'caterham_rotary_nav';

const DEFAULT_NAV_LINKS = [
    { id: '1', name: 'Home', path: '/', order: 0, enabled: true },
    { id: '2', name: 'Blog', path: '/blog', order: 1, enabled: true },
    { id: '3', name: 'Calendar', path: '/calendar', order: 2, enabled: true },
    {
        id: '7',
        name: 'Events',
        path: '/events',
        order: 3,
        enabled: true,
        children: [
            { id: '7-1', name: 'Bunny Fun Run', path: '/events/bunny-run', enabled: true },
            { id: '7-2', name: 'Santa Tour', path: '/events/santa-tour', enabled: true },
            { id: '7-3', name: 'Knights Garden', path: '/events/knights-garden', enabled: true },
            { id: '7-4', name: 'Breakfast', path: '/events/breakfast', enabled: true },
            { id: '7-5', name: 'Invoice', path: '/events/invoice', enabled: false }
        ]
    },
    {
        id: 'info',
        name: 'Get Involved',
        path: '#',
        order: 4,
        enabled: true,
        children: [
            { id: '4', name: 'Business Partners', path: '/business-partners', enabled: true },
            { id: '5', name: 'Where we meet', path: '/where-we-meet', enabled: true },
            { id: '6', name: 'Join Us', path: '/join-us', enabled: true }
        ]
    }
];

export const getNavLinks = () => {
    let links = DEFAULT_NAV_LINKS;
    const stored = localStorage.getItem(NAV_STORAGE_KEY);
    if (stored) {
        links = JSON.parse(stored);
    }

    // Force Migration to new structure (User request: Calendar + Events with children)
    // If we have old structure or missing new items, reset to defaults.
    const hasCalendar = links.some(l => l.name === 'Calendar');
    const hasEventsWithChildren = links.some(l => l.name === 'Events' && l.children && l.children.length > 0);

    if (!hasCalendar || !hasEventsWithChildren) {
        links = DEFAULT_NAV_LINKS;
        localStorage.setItem(NAV_STORAGE_KEY, JSON.stringify(links));
    }

    // Filter out disabled links
    return links
        .filter(link => link.enabled !== false)
        .map(link => ({
            ...link,
            children: link.children?.filter(child => child.enabled !== false)
        }));
};

export const getAllNavLinks = () => {
    // Get all links including disabled ones for admin editing
    let links = DEFAULT_NAV_LINKS;
    const stored = localStorage.getItem(NAV_STORAGE_KEY);
    if (stored) {
        links = JSON.parse(stored);
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

export const toggleNavLink = (id, isChild = false, parentId = null) => {
    const links = getAllNavLinks();

    if (isChild && parentId) {
        const updatedLinks = links.map(link => {
            if (link.id === parentId && link.children) {
                return {
                    ...link,
                    children: link.children.map(child =>
                        child.id === id ? { ...child, enabled: !child.enabled } : child
                    )
                };
            }
            return link;
        });
        saveNavLinks(updatedLinks);
    } else {
        const updatedLinks = links.map(link =>
            link.id === id ? { ...link, enabled: !link.enabled } : link
        );
        saveNavLinks(updatedLinks);
    }
};

export const resetNavLinks = () => {
    localStorage.setItem(NAV_STORAGE_KEY, JSON.stringify(DEFAULT_NAV_LINKS));
    window.dispatchEvent(new Event('nav-updated'));
    return DEFAULT_NAV_LINKS;
};

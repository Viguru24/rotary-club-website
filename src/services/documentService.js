
const STORAGE_KEY = 'rotary_documents';

const INITIAL_DOCUMENTS = [
    {
        id: 1,
        title: "AGM Minutes 2024",
        category: "Minutes",
        tags: ["meeting", "governance", "annual"],
        date: "2024-11-20",
        expiryDate: null,
        version: 1,
        size: "2.4 MB",
        type: "pdf",
        url: "/documents/AGM_Minutes_2024.pdf",
        shared: false
    },
    {
        id: 2,
        title: "Club Constitution",
        category: "Legal",
        tags: ["rules", "governance", "fundamental"],
        date: "2024-01-15",
        expiryDate: null,
        version: 3,
        size: "1.1 MB",
        type: "pdf",
        url: "/documents/Club_Constitution.pdf",
        shared: true,
        shareLink: "https://rotary.org/s/xyz123"
    },
    {
        id: 3,
        title: "Public Liability Insurance",
        category: "Insurance",
        tags: ["finance", "protection", "critical"],
        date: "2024-03-10",
        expiryDate: "2025-03-10",
        version: 1,
        size: "0.5 MB",
        type: "pdf",
        url: "/documents/Insurance_Policy.pdf",
        shared: false
    },
    {
        id: 5,
        title: "Admin Dashboard Repair Manual",
        category: "Technical",
        tags: ["guide", "maintenance", "dev"],
        date: new Date().toISOString().split('T')[0],
        expiryDate: null,
        version: 1,
        size: "3 KB",
        type: "txt",
        url: "/documents/PROJECT_REPAIR_MANUAL.md",
        shared: false
    },
    {
        id: 6,
        title: "Financial Snapshot 2024",
        category: "Finance",
        tags: ["report", "data", "csv"],
        date: new Date().toISOString().split('T')[0],
        expiryDate: null,
        version: 1,
        size: "1 KB",
        type: "csv",
        url: "/documents/Financial_Snapshot_2024.csv",
        shared: false
    },
    {
        id: 7,
        title: "DMS System Architecture",
        category: "Technical",
        tags: ["documentation", "architecture", "smart-hub"],
        date: new Date().toISOString().split('T')[0],
        expiryDate: null,
        version: 1,
        size: "2 KB",
        type: "txt",
        url: "/documents/DMS_Architecture.md",
        shared: false
    }
];

export const getDocuments = () => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DOCUMENTS));
        return INITIAL_DOCUMENTS;
    }
    return JSON.parse(stored);
};

// Simulated AI Analysis
const analyzeDocument = (doc) => {
    const tags = [];
    let expiryDate = null;
    let category = "General";

    const lowerTitle = doc.title.toLowerCase();

    // Auto-Categorization & Tagging
    if (lowerTitle.includes('minutes') || lowerTitle.includes('agm')) {
        category = "Minutes";
        tags.push('meeting', 'record');
    } else if (lowerTitle.includes('insurance') || lowerTitle.includes('policy')) {
        category = "Insurance";
        tags.push('finance', 'critical');
        // Auto-Expiry: 1 year from now
        const d = new Date();
        d.setFullYear(d.getFullYear() + 1);
        expiryDate = d.toISOString().split('T')[0];
    } else if (lowerTitle.includes('form') || lowerTitle.includes('template')) {
        category = "Forms";
        tags.push('template', 'reusable');
    } else if (doc.type === 'jpg' || doc.type === 'png') {
        category = "Media";
        tags.push('image', 'visual');
    } else {
        tags.push('document');
    }

    return { ...doc, category, tags, expiryDate };
};

export const saveDocument = (doc) => {
    const docs = getDocuments();
    let updatedDoc;

    if (doc.id) {
        // Update existing (Version Control)
        const index = docs.findIndex(d => d.id === doc.id);
        if (index !== -1) {
            const oldDoc = docs[index];
            // If main details change, bump version
            const isContentChange = oldDoc.size !== doc.size;

            updatedDoc = {
                ...oldDoc,
                ...doc,
                version: isContentChange ? oldDoc.version + 1 : oldDoc.version,
                lastModified: new Date().toISOString()
            };
            docs[index] = updatedDoc;
        }
    } else {
        // Create New (Simulate AI Processing)
        const baseDoc = {
            ...doc,
            id: Date.now(),
            date: new Date().toISOString().split('T')[0],
            size: doc.size || (Math.random() * 5 + 0.5).toFixed(1) + ' MB',
            version: 1,
            shared: false
        };

        // Apply AI Smarts
        updatedDoc = analyzeDocument(baseDoc);
        docs.unshift(updatedDoc);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(docs));
    window.dispatchEvent(new Event('docs-updated'));
    return updatedDoc;
};

export const deleteDocument = (id) => {
    const docs = getDocuments();
    const filtered = docs.filter(d => d.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    window.dispatchEvent(new Event('docs-updated'));
};

export const generateShareLink = (id) => {
    const docs = getDocuments();
    const index = docs.findIndex(d => d.id === id);
    if (index !== -1) {
        const link = `https://caterhamrotary.uk/s/${Math.random().toString(36).substr(2, 9)}`;
        docs[index].shareLink = link;
        docs[index].shared = true;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(docs));
        window.dispatchEvent(new Event('docs-updated'));
        return link;
    }
    return null;
};

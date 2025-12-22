const API_URL = '/api/members';

export const getMembers = async () => {
    try {
        const res = await fetch(API_URL);
        if (!res.ok) throw new Error('Failed to fetch from API');
        const json = await res.json();
        return json.data || [];
    } catch (error) {
        console.error("API Error (Members):", error);
        throw error;
    }
};

export const saveMember = async (member) => {
    const url = member.id ? `${API_URL}/${member.id}` : API_URL;
    const method = member.id ? 'PUT' : 'POST';

    try {
        const res = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(member)
        });
        if (!res.ok) throw new Error('Failed to save member');
        return await res.json();
    } catch (error) {
        console.error("API Save Error:", error);
        throw error;
    }
};

export const deleteMember = async (id) => {
    try {
        const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Failed to delete member');
        return await res.json();
    } catch (error) {
        console.error("API Delete Error:", error);
        throw error;
    }
};

export const importMembers = async (newMembers) => {
    try {
        const res = await fetch(`${API_URL}/bulk`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newMembers)
        });
        if (!res.ok) throw new Error('Failed to import members');
        return await res.json();
    } catch (error) {
        console.error("API Import Error:", error);
        throw error;
    }
};

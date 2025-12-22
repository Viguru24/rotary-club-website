// Event Services - Connected to Real Backend
const API_URL = '/api/events';

export const getEvents = async () => {
    try {
        const res = await fetch(API_URL);
        if (!res.ok) throw new Error('Failed to fetch events from API');
        const json = await res.json();
        return json.data || [];
    } catch (error) {
        console.error("API Error (Events):", error);
        throw error;
    }
};

export const saveEvent = async (event) => {
    const url = event.id ? `${API_URL}/${event.id}` : API_URL;
    const method = event.id ? 'PUT' : 'POST';

    try {
        const res = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(event)
        });
        if (!res.ok) throw new Error('Failed to save event');
        return await res.json();
    } catch (error) {
        console.error("API Save Error (Events):", error);
        throw error;
    }
};

export const deleteEvent = async (id) => {
    try {
        const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Failed to delete event');
        return await res.json();
    } catch (error) {
        console.error("API Delete Error (Events):", error);
        throw error;
    }
};

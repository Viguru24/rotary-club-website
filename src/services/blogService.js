// Blog Services - Connected to Real Backend
const API_URL = '/api/posts';

export const getBlogPosts = async (status) => {
    try {
        let url = API_URL;
        if (status) {
            url += `?status=${encodeURIComponent(status)}`;
        }
        const res = await fetch(url);
        if (!res.ok) throw new Error('Failed to fetch blog posts');
        const json = await res.json();
        return json.data || [];
    } catch (error) {
        console.error("API Error (Blog):", error);
        throw error;
    }
};

export const getBlogPost = async (id) => {
    try {
        const res = await fetch(`${API_URL}/${id}`);
        if (!res.ok) throw new Error('Failed to fetch blog post');
        const json = await res.json();
        return json.data || json; // Handle generic response or direct object
    } catch (error) {
        console.error("API Error (Blog Post):", error);
        throw error;
    }
};

export const saveBlogPost = async (post) => {
    const url = post.id ? `${API_URL}/${post.id}` : API_URL;
    const method = post.id ? 'PUT' : 'POST';

    try {
        const res = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(post)
        });
        if (!res.ok) throw new Error('Failed to save blog post');
        return await res.json();
    } catch (error) {
        console.error("API Save Error (Blog):", error);
        throw error;
    }
};

export const deleteBlogPost = async (id) => {
    try {
        const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Failed to delete blog post');
        return await res.json();
    } catch (error) {
        console.error("API Delete Error (Blog):", error);
        throw error;
    }
};

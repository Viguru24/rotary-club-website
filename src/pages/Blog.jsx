import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getBlogPosts } from '../services/blogService';
import { FaArrowRight, FaCalendarAlt, FaClock } from 'react-icons/fa';

const BlogPage = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const data = await getBlogPosts('published');
                setPosts(data);
            } catch (error) {
                console.error("Failed to fetch posts:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchPosts();
    }, []);

    const getSummary = (html, length = 160) => {
        const tmp = document.createElement("DIV");
        tmp.innerHTML = html;
        let text = tmp.textContent || tmp.innerText || "";
        return text.substring(0, length).trim() + (text.length > length ? "..." : "");
    };

    const handleImageError = (e) => {
        e.target.src = 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1000'; // Reliable fallback
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-white pt-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
        </div>
    );

    const featuredPost = posts[0];
    const otherPosts = posts.slice(1);

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-20 pt-32 sm:pt-40">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Header */}
                <header className="mb-16 text-center max-w-3xl mx-auto">
                    <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 mb-4 pb-2 leading-tight">
                        Caterham <span className="text-indigo-600">Magazine</span>
                    </h1>
                    <p className="text-lg text-slate-600">
                        Stories of community, service, and impact.
                    </p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

                    {/* Main Feed */}
                    <div className="lg:col-span-8">

                        {/* Featured Post */}
                        {featuredPost && (
                            <Link to={`/blog/${featuredPost.id}`} className="group block mb-12">
                                <article className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                                    <div className="aspect-video w-full overflow-hidden bg-slate-100 relative">
                                        <img
                                            src={featuredPost.image || ''}
                                            alt={featuredPost.title}
                                            onError={handleImageError}
                                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                        />
                                    </div>
                                    <div className="p-6 sm:p-8 space-y-4">
                                        <div className="flex items-center gap-3 text-sm font-bold tracking-wide text-indigo-600 uppercase">
                                            {featuredPost.category}
                                        </div>
                                        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                                            {featuredPost.title}
                                        </h2>
                                        <p className="text-slate-600 leading-relaxed text-base sm:text-lg line-clamp-3">
                                            {getSummary(featuredPost.content, 200)}
                                        </p>
                                        <div className="flex items-center gap-4 text-sm text-slate-400 font-medium pt-2 border-t border-slate-100 mt-4">
                                            <span className="flex items-center gap-2"><FaCalendarAlt /> {featuredPost.date}</span>
                                            <span>&middot;</span>
                                            <span className="flex items-center gap-2"><FaClock /> {featuredPost.readTime || '5 min read'}</span>
                                        </div>
                                    </div>
                                </article>
                            </Link>
                        )}

                        {/* Post List */}
                        <div className="space-y-8">
                            {otherPosts.map((post) => (
                                <Link key={post.id} to={`/blog/${post.id}`} className="group block">
                                    <article className="bg-white rounded-xl overflow-hidden shadow-sm border border-slate-200 hover:shadow-md transition-shadow flex flex-col sm:flex-row">
                                        <div className="sm:w-1/3 aspect-video sm:aspect-auto bg-slate-100 relative">
                                            <img
                                                src={post.image || ''}
                                                alt={post.title}
                                                onError={handleImageError}
                                                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                            />
                                        </div>
                                        <div className="p-6 sm:w-2/3 flex flex-col justify-center">
                                            <div className="text-xs font-bold tracking-wide text-indigo-600 uppercase mb-2">
                                                {post.category}
                                            </div>
                                            <h3 className="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors mb-3">
                                                {post.title}
                                            </h3>
                                            <p className="text-slate-600 text-sm leading-relaxed line-clamp-2 mb-4">
                                                {getSummary(post.content, 120)}
                                            </p>
                                            <div className="flex items-center gap-3 text-xs text-slate-400 font-medium">
                                                <span>{post.date}</span>
                                                <span>&middot;</span>
                                                <span>{post.readTime || '3 min'}</span>
                                            </div>
                                        </div>
                                    </article>
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Sidebar */}
                    <aside className="lg:col-span-4 space-y-8">
                        {/* About Widget */}
                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-4 border-b border-slate-100 pb-2">About Us</h4>
                            <p className="text-slate-600 text-sm leading-relaxed mb-4">
                                The Rotary Club of Caterham Harestone is dedicated to community service, bringing people together to create positive change.
                            </p>
                            <Link to="/about" className="text-indigo-600 text-sm font-semibold hover:underline inline-flex items-center gap-1">
                                More about us <FaArrowRight size={12} />
                            </Link>
                        </div>
                    </aside>

                </div>
            </div>
        </div>
    );
};

export default BlogPage;

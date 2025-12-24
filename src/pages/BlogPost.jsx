import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getBlogPost } from '../services/blogService';
import { FaArrowLeft, FaCalendarAlt, FaClock, FaUser } from 'react-icons/fa';
import '../blog-overrides.css';

const BlogPost = () => {
    const { id } = useParams();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const data = await getBlogPost(id);
                setPost(data);
            } catch (err) {
                setError("Could not load story.");
            } finally {
                setLoading(false);
            }
        };
        fetchPost();
    }, [id]);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-white">
            <div className="animate-pulse flex flex-col items-center gap-4">
                <div className="h-4 w-48 bg-slate-200 rounded"></div>
            </div>
        </div>
    );

    if (error || !post) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-white text-slate-600">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Story not found</h2>
            <p className="mb-6">The article you are looking for doesn't exist or has been removed.</p>
            <Link to="/blog" className="text-indigo-600 hover:underline flex items-center gap-2">
                <FaArrowLeft /> Back to Magazine
            </Link>
        </div>
    );

    return (
        <article className="min-h-screen bg-white text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900 pt-32 pb-20">

            {/* Navigation / Back Button */}
            <div className="max-w-3xl mx-auto px-6 sm:px-8 mb-12">
                <Link to="/blog" className="group inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-indigo-600 transition-colors">
                    <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" />
                    Back to Magazine
                </Link>
            </div>

            {/* Header */}
            <header className="max-w-3xl mx-auto px-6 sm:px-8 mb-12 text-center">
                <div className="inline-block px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold tracking-widest uppercase rounded-full mb-6">
                    {post.category}
                </div>
                <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 mb-8 leading-tight">
                    {post.title}
                </h1>

                <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-slate-500 font-medium">
                    <span className="flex items-center gap-2">
                        <FaUser className="text-slate-400" /> {post.author || 'Rotary Editor'}
                    </span>
                    <span className="hidden sm:inline text-slate-300">|</span>
                    <span className="flex items-center gap-2">
                        <FaCalendarAlt className="text-slate-400" /> {post.date}
                    </span>
                    <span className="hidden sm:inline text-slate-300">|</span>
                    <span className="flex items-center gap-2">
                        <FaClock className="text-slate-400" /> {post.readTime || '5 min read'}
                    </span>
                </div>
            </header>

            {/* Featured Image (if exists) */}
            {post.image && (
                <div className="max-w-5xl mx-auto px-6 sm:px-8 mb-16">
                    <div className="w-full bg-slate-100 rounded-2xl overflow-hidden shadow-sm flex items-center justify-center p-1" style={{ maxHeight: '600px' }}>
                        <img
                            src={post.image}
                            alt={post.title}
                            className="w-full h-full object-contain max-h-[600px]"
                        />
                    </div>
                </div>
            )}

            {/* Article Content */}
            <div className="max-w-3xl mx-auto px-6 sm:px-8">
                <div
                    className="prose prose-lg prose-slate prose-headings:font-bold prose-headings:text-slate-900 prose-a:text-indigo-600 hover:prose-a:text-indigo-500 prose-img:rounded-xl mx-auto"
                    dangerouslySetInnerHTML={{ __html: post.content }}
                >
                </div>
            </div>

            {/* Footer / Share / Tags */}
            <footer className="max-w-3xl mx-auto px-6 sm:px-8 mt-20 pt-10 border-t border-slate-100">
                <div className="flex justify-between items-center">
                    <Link to="/blog" className="text-slate-500 hover:text-indigo-600 font-semibold text-sm">
                        More Stories
                    </Link>
                    {/* Add Social Share buttons here later if needed */}
                </div>
            </footer>

        </article>
    );
};

export default BlogPost;

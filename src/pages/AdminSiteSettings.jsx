import React, { useState, useEffect, useMemo } from 'react';
import { motion, Reorder } from 'framer-motion';
import { getHomeConfig, saveHomeConfig } from '../services/homeService';
import { getAllNavLinks, saveNavLinks, addNavLink, deleteNavLink, toggleNavLink } from '../services/navigationService';
import { getMembers, saveMember } from '../services/memberService'; // Use Mock Service
import { FaSave, FaPlus, FaTrash, FaGripLines, FaImage, FaUpload, FaArrowRight, FaPen, FaCheck, FaTimes, FaEye, FaEyeSlash } from 'react-icons/fa';
import { useUI } from '../context/UIContext';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

const AdminSiteSettings = () => {
    const { showToast, confirmAction } = useUI();
    const [activeTab, setActiveTab] = useState('home');
    const [homeConfig, setHomeConfig] = useState(getHomeConfig());
    const [navLinks, setNavLinks] = useState(getAllNavLinks());
    const [newLink, setNewLink] = useState({ name: '', path: '' });
    const [lists, setLists] = useState({ role: [], strength: [], event_category: [], event_location: [] });
    const [members, setMembers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        setHomeConfig(getHomeConfig());
        setNavLinks(getAllNavLinks());
        fetchMembers();
        fetchLists();
    }, []);

    const fetchLists = async () => {
        try {
            const res = await fetch('/api/lists');
            const data = await res.json();
            if (data.message === 'success') {
                const grouped = data.data.reduce((acc, item) => {
                    if (!acc[item.type]) acc[item.type] = [];
                    acc[item.type].push(item);
                    return acc;
                }, { role: [], strength: [], event_category: [], event_location: [] });
                setLists(grouped);
            }
        } catch (error) {
            console.error("Failed to fetch lists", error);
        }
    };

    const handleAddList = async (type, value) => {
        if (!value.trim()) return;
        try {
            const res = await fetch('/api/lists', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type, value: value.trim() })
            });
            const data = await res.json();
            if (data.message === 'success') {
                showToast('Item added', 'success');
                fetchLists();
            }
        } catch (error) {
            console.error("Failed to add list item", error);
            showToast('Failed to add item', 'error');
        }
    };

    const handleDeleteList = async (id) => {
        try {
            const res = await fetch(`/api/lists/${id}`, { method: 'DELETE' });
            const data = await res.json();
            if (data.message === 'deleted') {
                showToast('Item deleted', 'success');
                fetchLists();
            }
        } catch (error) {
            console.error("Failed to delete list item", error);
            showToast('Failed to delete item', 'error');
        }
    };

    // Prevent ReactQuill Loop: Memoize modules
    const quillModules = useMemo(() => ({
        toolbar: [
            [{ 'header': [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'color': [] }, { 'background': [] }],
            [{ 'align': [] }],
            ['clean']
        ]
    }), []);

    // --- MEMBERS ACCESS HANDLERS (UPDATED TO USE SERVICE) ---
    const fetchMembers = async () => {
        try {
            const data = await getMembers();
            setMembers(data); // Service now returns array directly
        } catch (error) {
            console.error("Failed to fetch members", error);
        }
    };

    const handleRoleChange = async (memberId, newRole) => {
        // Optimistic update
        setMembers(prev => prev.map(m => m.id === memberId ? { ...m, role: newRole } : m));

        const member = members.find(m => m.id === memberId);
        if (!member) return;

        try {
            const updatedMember = { ...member, role: newRole };
            const res = await saveMember(updatedMember);

            if (res.success) {
                showToast(`User role updated to ${newRole}`, 'success');
            } else {
                throw new Error('Update failed');
            }
        } catch (error) {
            console.error(error);
            showToast('Failed to update role', 'error');
            fetchMembers(); // Revert
        }
    };

    // --- HOME CONFIG HANDLERS ---
    const handleHomeSave = (e) => {
        e.preventDefault();
        saveHomeConfig(homeConfig);
        showToast('Home settings saved!', 'success');
    };

    const handleImageDrop = (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = () => {
                setHomeConfig(prev => ({
                    ...prev,
                    heroImages: [...prev.heroImages, reader.result]
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    const removeImage = (index) => {
        setHomeConfig(prev => ({
            ...prev,
            heroImages: prev.heroImages.filter((_, i) => i !== index)
        }));
    };

    // --- NAV CONFIG HANDLERS ---
    const handleReorder = (newOrder) => {
        setNavLinks(newOrder);
    };

    const handleNavSave = () => {
        saveNavLinks(navLinks);
        showToast('Navigation menu saved!', 'success');
    };

    const handleAddLink = () => {
        if (newLink.name && newLink.path) {
            addNavLink(newLink);
            setNavLinks(getAllNavLinks()); // Refresh list
            setNewLink({ name: '', path: '' });
        }
    };

    const handleDeleteLink = (id) => {
        confirmAction('Delete this navigation link?', () => {
            deleteNavLink(id);
            setNavLinks(getAllNavLinks());
            showToast('Link deleted', 'success');
        }, 'Delete Helper', true);
    };

    const handleToggleLink = (id, isChild = false, parentId = null) => {
        toggleNavLink(id, isChild, parentId);
        setNavLinks(getAllNavLinks());
        showToast('Menu item visibility updated', 'success');
    };

    const handleIndent = (index) => {
        if (index === 0) return; // Cannot indent the first item
        setNavLinks(prevItems => {
            const newLinks = [...prevItems];
            const current = { ...newLinks[index] }; // Clone current
            const prevIndex = index - 1;
            const prev = { ...newLinks[prevIndex] }; // Clone parent

            // Ensure children array exists and is cloned
            prev.children = prev.children ? [...prev.children] : [];
            prev.children.push(current);

            newLinks[prevIndex] = prev;
            newLinks.splice(index, 1);
            return newLinks;
        });
    };

    const handlePromote = (item) => {
        // Move item to the end of the root list
        setNavLinks(prev => [...prev, item]);
    };

    // Helper component for editable row
    const EditableRow = ({ item, onDelete, onIndent, onPromote, onSave, onToggle, canIndent }) => {
        const [isEditing, setIsEditing] = useState(false);
        const [editData, setEditData] = useState({ name: item.name, path: item.path });

        const handleSave = () => {
            onSave(editData);
            setIsEditing(false);
        };

        const handleCancel = () => {
            setEditData({ name: item.name, path: item.path });
            setIsEditing(false);
        };

        if (isEditing) {
            return (
                <div style={{
                    background: 'white', padding: '10px', borderRadius: '8px', border: '1px solid #3b82f6',
                    display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 2px 5px rgba(59,130,246,0.1)'
                }}>
                    <input
                        value={editData.name}
                        onChange={e => setEditData({ ...editData, name: e.target.value })}
                        placeholder="Name"
                        style={{ padding: '8px', borderRadius: '4px', border: '1px solid #d1d5db', flex: 1 }}
                        autoFocus
                    />
                    <input
                        value={editData.path}
                        onChange={e => setEditData({ ...editData, path: e.target.value })}
                        placeholder="Path"
                        style={{ padding: '8px', borderRadius: '4px', border: '1px solid #d1d5db', flex: 1 }}
                    />
                    <button onClick={handleSave} style={{ color: '#10b981', background: 'none', border: 'none', cursor: 'pointer', padding: '5px' }} title="Save">
                        <FaCheck />
                    </button>
                    <button onClick={handleCancel} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', padding: '5px' }} title="Cancel">
                        <FaTimes />
                    </button>
                </div>
            );
        }

        const isDisabled = item.enabled === false;

        return (
            <div style={{
                background: canIndent ? 'white' : '#f9fafb',
                padding: canIndent ? '15px 20px' : '10px 15px',
                borderRadius: '8px',
                border: `1px solid ${isDisabled ? '#fca5a5' : '#e5e7eb'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                boxShadow: canIndent ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
                cursor: 'grab',
                opacity: isDisabled ? 0.6 : 1
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <FaGripLines style={{ color: '#9ca3af', fontSize: canIndent ? '1rem' : '0.8rem' }} />
                    <div>
                        <div style={{ fontWeight: 600, color: '#1f2937', fontSize: canIndent ? '1rem' : '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {item.name}
                            {isDisabled && <span style={{ fontSize: '0.75rem', color: '#ef4444', fontWeight: 500 }}>(Hidden)</span>}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>{item.path}</div>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    {onToggle && (
                        <button
                            onClick={(e) => { e.stopPropagation(); onToggle(); }}
                            style={{ color: isDisabled ? '#9ca3af' : '#10b981', background: 'none', border: 'none', cursor: 'pointer', padding: '5px' }}
                            title={isDisabled ? 'Show in menu' : 'Hide from menu'}
                        >
                            {isDisabled ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                        </button>
                    )}

                    {canIndent && onIndent && (
                        <button
                            onClick={(e) => { e.stopPropagation(); onIndent(); }}
                            style={{ color: '#2563eb', background: 'none', border: '1px solid #bfdbfe', borderRadius: '4px', cursor: 'pointer', padding: '4px 8px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                            title="Nest under previous item"
                        >
                            <FaArrowRight size={10} /> Nest
                        </button>
                    )}

                    <button
                        onClick={(e) => { e.stopPropagation(); setIsEditing(true); }}
                        style={{ color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer', padding: '5px' }}
                        title="Edit"
                    >
                        <FaPen size={12} />
                    </button>

                    {/* Promote button for children */}
                    {!canIndent && onPromote && (
                        <button
                            onClick={(e) => { e.stopPropagation(); onPromote(); }}
                            style={{ color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer', padding: '5px' }}
                            title="Un-nest (Delete and Re-add is safer)"
                        >
                            <FaArrowRight style={{ transform: 'rotate(180deg)' }} size={12} />
                        </button>
                    )}

                    <button
                        onClick={(e) => { e.stopPropagation(); onDelete(item.id); }}
                        style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', padding: '5px' }}
                        title="Remove"
                    >
                        <FaTrash size={12} />
                    </button>
                </div>
            </div>
        );
    };

    const NavItem = ({ link, index, isFirst, onDelete, onIndent, onUpdate, onPromoteItem }) => {
        const handleChildReorder = (newChildren) => {
            onUpdate({ ...link, children: newChildren });
        };

        const updateChild = (childIdx, newData) => {
            const newChildren = [...link.children];
            newChildren[childIdx] = { ...newChildren[childIdx], ...newData };
            onUpdate({ ...link, children: newChildren });
        };

        const deleteChild = (childId) => {
            const newChildren = link.children.filter(c => c.id !== childId);
            onUpdate({ ...link, children: newChildren });
        };

        // Simplified "Promote/Un-nest" Handler
        // Simplified "Promote/Un-nest" Handler
        const promoteChild = (childIndex) => {
            const childToPromote = link.children[childIndex];
            const newChildren = link.children.filter((_, i) => i !== childIndex);

            // Update parent (remove child)
            onUpdate({ ...link, children: newChildren });

            // Add to root list
            if (onPromoteItem) onPromoteItem(childToPromote);
        };

        return (
            <Reorder.Item value={link} style={{ marginBottom: '10px' }}>
                <EditableRow
                    item={link}
                    canIndent={!isFirst}
                    onIndent={onIndent}
                    onDelete={onDelete}
                    onSave={(newData) => onUpdate({ ...link, ...newData })}
                    onToggle={() => handleToggleLink(link.id)}
                />

                {/* Render Children */}
                {link.children && link.children.length > 0 && (
                    <div style={{ marginLeft: '40px', marginTop: '10px', paddingLeft: '20px', borderLeft: '2px solid #e5e7eb' }}>
                        <Reorder.Group axis="y" values={link.children} onReorder={handleChildReorder}>
                            {link.children.map((child, cIdx) => (
                                <Reorder.Item key={child.id} value={child} style={{ marginBottom: '10px' }}>
                                    <EditableRow
                                        item={child}
                                        canIndent={false}
                                        onDelete={() => deleteChild(child.id)}
                                        onSave={(newData) => updateChild(cIdx, newData)}
                                        onPromote={() => promoteChild(cIdx)}
                                        onToggle={() => handleToggleLink(child.id, true, link.id)}
                                    />
                                </Reorder.Item>
                            ))}
                        </Reorder.Group>
                    </div>
                )}
            </Reorder.Item>
        );
    };
    const styles = {
        container: { maxWidth: '1000px', margin: '0 auto', color: '#1f2937' },
        header: { marginBottom: '30px' },
        title: { fontSize: '2rem', fontWeight: 700, color: '#111827' },
        tabs: { display: 'flex', gap: '20px', marginBottom: '30px', borderBottom: '1px solid #e5e7eb' },
        tab: (isActive) => ({
            padding: '10px 20px',
            cursor: 'pointer',
            borderBottom: isActive ? '3px solid var(--accent-primary)' : '3px solid transparent',
            color: isActive ? 'var(--accent-primary)' : '#6b7280',
            fontWeight: 600
        }),
        card: { background: 'white', padding: '30px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' },
        label: { display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '0.9rem', color: '#374151' },
        input: { width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db', marginBottom: '20px' },
        btn: { padding: '12px 24px', background: 'var(--accent-primary)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' },
        dropZone: {
            border: '2px dashed #d1d5db', borderRadius: '12px', padding: '40px', textAlign: 'center', cursor: 'pointer', background: '#f9fafb', marginBottom: '20px',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '10px', color: '#6b7280'
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h1 style={styles.title}>Site Management</h1>
                <p style={{ color: '#6b7280' }}>Control your homepage content and navigation menu.</p>
            </div>

            <div style={styles.tabs}>
                <div onClick={() => setActiveTab('home')} style={styles.tab(activeTab === 'home')}>Home Editor</div>
                <div onClick={() => setActiveTab('menu')} style={styles.tab(activeTab === 'menu')}>Menu Manager</div>
                <div onClick={() => setActiveTab('access')} style={styles.tab(activeTab === 'access')}>Access Control</div>
                <div onClick={() => setActiveTab('lists')} style={styles.tab(activeTab === 'lists')}>Lists Config</div>
            </div>

            {/* --- HOME EDITOR TAB --- */}
            {activeTab === 'home' && (
                <div style={styles.card}>
                    <h2 style={{ marginBottom: '20px', fontSize: '1.25rem' }}>Homepage Configuration</h2>
                    <form onSubmit={handleHomeSave}>
                        <div style={{ marginBottom: '20px' }}>
                            <label style={styles.label}>Hero Title</label>
                            <ReactQuill
                                theme="snow"
                                value={homeConfig.heroTitle || ''}
                                onChange={(value) => {
                                    if (value !== homeConfig.heroTitle) {
                                        setHomeConfig(prev => ({ ...prev, heroTitle: value }));
                                    }
                                }}
                                modules={quillModules}
                            />
                        </div>
                        <div style={{ marginBottom: '40px' }}>
                            <label style={styles.label}>Hero Subtitle</label>
                            <ReactQuill
                                theme="snow"
                                value={homeConfig.heroSubtitle || ''}
                                onChange={(value) => {
                                    if (value !== homeConfig.heroSubtitle) {
                                        setHomeConfig(prev => ({ ...prev, heroSubtitle: value }));
                                    }
                                }}
                                style={{ height: '150px', marginBottom: '40px' }} // Height for editor
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '20px' }}>
                            <div style={{ flex: 1 }}>
                                <label style={styles.label}>CTA Button Text</label>
                                <input
                                    type="text"
                                    value={homeConfig.ctaText}
                                    onChange={e => setHomeConfig({ ...homeConfig, ctaText: e.target.value })}
                                    style={styles.input}
                                />
                            </div>
                            <div style={{ flex: 1 }}>
                                <label style={styles.label}>CTA Link</label>
                                <input
                                    type="text"
                                    value={homeConfig.ctaLink}
                                    onChange={e => setHomeConfig({ ...homeConfig, ctaLink: e.target.value })}
                                    style={styles.input}
                                />
                            </div>
                        </div>

                        {/* Image Manager */}
                        <div style={{ marginBottom: '30px' }}>
                            <label style={styles.label}>Hero Carousel Images</label>
                            <div
                                style={styles.dropZone}
                                onDragOver={e => e.preventDefault()}
                                onDrop={handleImageDrop}
                                onClick={() => {
                                    const input = document.createElement('input');
                                    input.type = 'file';
                                    input.accept = 'image/*';
                                    input.onchange = (e) => {
                                        const file = e.target.files[0];
                                        if (file) {
                                            const reader = new FileReader();
                                            reader.onload = () => {
                                                setHomeConfig(prev => ({
                                                    ...prev,
                                                    heroImages: [...prev.heroImages, reader.result]
                                                }));
                                            };
                                            reader.readAsDataURL(file);
                                        }
                                    };
                                    input.click();
                                }}
                            >
                                <FaUpload size={24} />
                                <span>Click to upload image (or drag & drop)</span>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '10px' }}>
                                {homeConfig.heroImages.map((img, index) => (
                                    <div key={index} style={{ position: 'relative', height: '80px', borderRadius: '8px', overflow: 'hidden' }}>
                                        <img src={img} alt="Hero" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        <button
                                            type="button"
                                            onClick={() => removeImage(index)}
                                            style={{
                                                position: 'absolute', top: 2, right: 2, background: 'rgba(255,0,0,0.8)', color: 'white',
                                                border: 'none', borderRadius: '50%', width: '20px', height: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                                            }}
                                        >
                                            &times;
                                        </button>
                                    </div>
                                ))}
                                {homeConfig.heroImages.length === 0 && (
                                    <div style={{ color: '#9ca3af', fontStyle: 'italic', fontSize: '0.9rem' }}>No images set. (Will use default background)</div>
                                )}
                            </div>
                        </div>

                        <button type="submit" style={styles.btn}>
                            <FaSave /> Save Changes
                        </button>
                    </form>
                </div>
            )}

            {/* --- MENU MANAGER TAB --- */}
            {activeTab === 'menu' && (
                <div style={styles.card}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h2 style={{ fontSize: '1.25rem' }}>Navigation Menu</h2>
                        <button onClick={handleNavSave} style={styles.btn}>
                            <FaSave /> Save Order
                        </button>
                    </div>

                    <div style={{ background: '#f9fafb', padding: '20px', borderRadius: '12px', marginBottom: '30px', border: '1px solid #e5e7eb' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '15px' }}>Add New Link</h3>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <input
                                placeholder="Link Name (e.g. Gallery)"
                                value={newLink.name}
                                onChange={e => setNewLink({ ...newLink, name: e.target.value })}
                                style={{ ...styles.input, marginBottom: 0, flex: 1 }}
                            />
                            <input
                                placeholder="Path (e.g. /gallery)"
                                value={newLink.path}
                                onChange={e => setNewLink({ ...newLink, path: e.target.value })}
                                style={{ ...styles.input, marginBottom: 0, flex: 1 }}
                            />
                            <button onClick={handleAddLink} style={{ ...styles.btn, background: '#10b981' }}>
                                <FaPlus /> Add
                            </button>
                        </div>
                    </div>

                    <div style={{ padding: '10px', background: '#eff6ff', borderRadius: '8px', marginBottom: '20px', fontSize: '0.9rem', color: '#1e40af' }}>
                        <strong>Tip:</strong> Drag to reorder. Use the arrows to create sub-menus (nesting).
                    </div>

                    <Reorder.Group axis="y" values={navLinks} onReorder={handleReorder} style={{ listStyle: 'none', padding: 0 }}>
                        {navLinks.map((link, index) => (
                            <NavItem
                                key={link.id}
                                link={link}
                                index={index}
                                isFirst={index === 0}
                                onDelete={handleDeleteLink}
                                onIndent={() => handleIndent(index)}
                                onUpdate={(updatedLink) => {
                                    const newLinks = [...navLinks];
                                    newLinks[index] = updatedLink;
                                    setNavLinks(newLinks);
                                }}
                                onPromoteItem={handlePromote}
                            />
                        ))}
                    </Reorder.Group>
                </div>
            )}

            {/* --- ACCESS CONTROL EDITOR TAB --- */}
            {activeTab === 'access' && (
                <div style={styles.card}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h2 style={{ fontSize: '1.25rem' }}>User Access Control</h2>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <input
                                type="text"
                                placeholder="Search members..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{
                                    padding: '10px 15px',
                                    borderRadius: '8px',
                                    border: '1px solid #d1d5db',
                                    width: '250px'
                                }}
                            />
                            <button
                                onClick={() => setSearchTerm('')}
                                disabled={!searchTerm}
                                style={{
                                    padding: '10px 15px',
                                    background: searchTerm ? '#e5e7eb' : '#f3f4f6',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '8px',
                                    cursor: searchTerm ? 'pointer' : 'default',
                                    color: searchTerm ? '#374151' : '#9ca3af',
                                    fontWeight: 600,
                                    transition: 'all 0.2s'
                                }}
                            >
                                Reset
                            </button>
                        </div>
                    </div>
                    <p style={{ color: '#6b7280', marginBottom: '20px' }}>Manage user roles and permissions for the back office.</p>

                    <div style={{
                        background: 'linear-gradient(to right, #eff6ff, #ffffff)',
                        borderLeft: '5px solid var(--accent-primary)',
                        borderRadius: '8px',
                        padding: '25px',
                        marginBottom: '30px',
                        boxShadow: '0 4px 15px rgba(0, 91, 170, 0.05)'
                    }}>
                        <h3 style={{ color: 'var(--accent-primary)', fontSize: '1.2rem', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            Permission Levels
                        </h3>
                        <div style={{ display: 'grid', gap: '15px' }}>
                            <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                                <span style={{ background: '#e5e7eb', color: '#374151', padding: '6px 12px', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 700, minWidth: '110px', textAlign: 'center' }}>Member</span>
                                <span style={{ color: '#4b5563', fontSize: '0.95rem' }}>Standard account. Access to public website areas only. No dashboard access.</span>
                            </div>
                            <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                                <span style={{ background: '#fef3c7', color: '#92400e', padding: '6px 12px', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 700, minWidth: '110px', textAlign: 'center' }}>Committee</span>
                                <span style={{ color: '#4b5563', fontSize: '0.95rem' }}>Operational access. Can manage events, blog posts, and routine tasks. No access to system settings.</span>
                            </div>
                            <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                                <span style={{ background: '#fee2e2', color: '#991b1b', padding: '6px 12px', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 700, minWidth: '110px', textAlign: 'center' }}>Administrator</span>
                                <span style={{ color: '#4b5563', fontSize: '0.95rem' }}>Super-admin access. Full control over site settings, finances, legal documents, and user roles.</span>
                            </div>
                        </div>
                    </div>

                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead style={{ background: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
                                <tr>
                                    <th style={{ textAlign: 'left', padding: '15px', color: '#4b5563' }}>Name</th>
                                    <th style={{ textAlign: 'left', padding: '15px', color: '#4b5563' }}>Email</th>
                                    <th style={{ textAlign: 'left', padding: '15px', color: '#4b5563' }}>Current Role</th>
                                    <th style={{ textAlign: 'right', padding: '15px', color: '#4b5563' }}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {members.filter(member =>
                                    (member.firstName + ' ' + member.lastName).toLowerCase().includes(searchTerm.toLowerCase()) ||
                                    member.email.toLowerCase().includes(searchTerm.toLowerCase())
                                ).map(member => (
                                    <tr key={member.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                        <td style={{ padding: '15px', fontWeight: 500 }}>{member.firstName} {member.lastName}</td>
                                        <td style={{ padding: '15px', color: '#6b7280' }}>{member.email}</td>
                                        <td style={{ padding: '15px' }}>
                                            <span style={{
                                                padding: '4px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 600,
                                                background: member.role === 'Administrator' ? '#fee2e2' : member.role === 'Committee' ? '#fef3c7' : '#e5e7eb',
                                                color: member.role === 'Administrator' ? '#991b1b' : member.role === 'Committee' ? '#92400e' : '#374151'
                                            }}>
                                                {member.role || 'Member'}
                                            </span>
                                        </td>
                                        <td style={{ padding: '15px', textAlign: 'right' }}>
                                            <select
                                                value={member.role || 'Member'}
                                                onChange={(e) => handleRoleChange(member.id, e.target.value)}
                                                style={{ padding: '8px', borderRadius: '6px', border: '1px solid #d1d5db', cursor: 'pointer' }}
                                            >
                                                <option value="Member">Member</option>
                                                <option value="Committee">Committee</option>
                                                <option value="Administrator">Administrator</option>
                                            </select>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
            {/* --- LISTS MANAGEMENT TAB --- */}
            {activeTab === 'lists' && (
                <div style={styles.card}>
                    <h2 style={{ marginBottom: '20px', fontSize: '1.25rem' }}>Dropdown Lists Management</h2>
                    <p style={{ color: '#6b7280', marginBottom: '30px' }}>Manage the options available in member profiles and events.</p>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>

                        {/* Reusable List Manager Block */}
                        {[
                            { title: 'Member Roles', type: 'role', color: 'var(--accent-primary)', data: lists.role },
                            { title: 'Member Strengths', type: 'strength', color: '#10b981', data: lists.strength },
                            { title: 'Event Categories', type: 'event_category', color: '#f59e0b', data: lists.event_category },
                            { title: 'Event Locations', type: 'event_location', color: '#8b5cf6', data: lists.event_location },
                        ].map((section) => (
                            <div key={section.type}>
                                <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: section.color }}></span>
                                    {section.title}
                                </h3>
                                <div style={{ background: '#f9fafb', padding: '15px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                                    <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                                        <input
                                            placeholder={`Add new ${section.title.split(' ')[1].toLowerCase()}...`}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    handleAddList(section.type, e.target.value);
                                                    e.target.value = '';
                                                }
                                            }}
                                            style={{ ...styles.input, marginBottom: 0 }}
                                        />
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '300px', overflowY: 'auto' }}>
                                        {section.data && section.data.map((item) => (
                                            <div key={item.id} style={{ background: 'white', padding: '10px', borderRadius: '8px', border: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <span>{item.value}</span>
                                                <button
                                                    onClick={() => handleDeleteList(item.id)}
                                                    style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}
                                                >
                                                    <FaTrash size={12} />
                                                </button>
                                            </div>
                                        ))}
                                        {(!section.data || section.data.length === 0) && (
                                            <div style={{ color: '#9ca3af', fontStyle: 'italic', fontSize: '0.9rem', textAlign: 'center', padding: '10px' }}>No items yet.</div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}

                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminSiteSettings;

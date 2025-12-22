import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getMembers, saveMember, deleteMember, importMembers } from '../services/memberService';
import ImageUploader from '../components/ImageUploader';
import * as XLSX from 'xlsx';
// const { read, utils } = XLSX;
// Remove destructuring to avoid potential undefined access on load
// const { read, utils } = XLSX;
import { FaPlus, FaSearch, FaIdCard, FaBirthdayCake, FaMedal, FaBriefcase, FaExclamationTriangle, FaUserCheck, FaTimes, FaPrint, FaQrcode, FaFileImport, FaFileExport, FaCopy } from 'react-icons/fa';
import { useUI } from '../context/UIContext';

const AdminMembers = () => {
    const { showToast, confirmAction } = useUI();
    const [members, setMembers] = useState([]);
    const [selectedMember, setSelectedMember] = useState(null); // For ID Card
    const [isIdModalOpen, setIsIdModalOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [lists, setLists] = useState({
        roles: ['Member', 'President', 'Secretary', 'Treasurer', 'Committee Chair'],
        strengths: ['Community Service', 'Leadership', 'Event Planning']
    });

    useEffect(() => {
        const load = async () => {
            try {
                const data = await getMembers();
                setMembers(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error("Failed to load members:", error);
                setMembers([]);
            }
        };
        load();

        const storedLists = localStorage.getItem('caterham_rotary_lists');
        if (storedLists) {
            setLists(JSON.parse(storedLists));
        }
    }, []);

    // --- ANALYTICS CALCULATIONS ---
    const getVocationStats = () => {
        const counts = {};
        members.forEach(m => counts[m.vocation] = (counts[m.vocation] || 0) + 1);
        return Object.entries(counts)
            .sort((a, b) => b[1] - a[1]) // Sort desc
            .slice(0, 4); // Top 4
    };



    const getUpcomingCelebrations = () => {
        // Mocking 'todays date' logic for demo purposes, just finding next birthdays
        return members.slice(0, 2).map(m => ({
            ...m,
            event: 'Birthday',
            date: (m.dob || '1980-01-01').slice(5) // MM-DD
        }));
    };

    const filteredMembers = members.filter(m =>
        (m.firstName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (m.lastName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (m.vocation || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const openIdCard = (member) => {
        setSelectedMember(member);
        setIsIdModalOpen(true);
    };

    const handleExport = () => {
        const csvContent = "data:text/csv;charset=utf-8,"
            + "First Name,Last Name,Email,Phone,Role\n"
            + members.map(m => `${m.firstName},${m.lastName},${m.email},${m.phone},${m.role}`).join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "rotary_members.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleCopyMember = (member) => {
        const text = `${member.firstName} ${member.lastName}\n${member.email}\n${member.phone}\n${member.role}`;
        navigator.clipboard.writeText(text);
        showToast(`Copied details for ${member.firstName}!`, 'success');
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (evt) => {
            try {
                const bstr = evt.target.result;
                const wb = XLSX.read(bstr, { type: 'binary' });
                const wsname = wb.SheetNames[0];
                const ws = wb.Sheets[wsname];
                const data = XLSX.utils.sheet_to_json(ws);

                const mapped = data.map(row => {
                    const keys = Object.keys(row);
                    const findKey = (regex) => keys.find(k => k.match(regex));

                    return {
                        firstName: row[findKey(/first|name/i)] || 'Unknown',
                        lastName: row[findKey(/last|surname/i)] || '',
                        email: row[findKey(/email|mail/i)] || '',
                        phone: row[findKey(/phone|mobile|cell/i)] || '',
                        role: row[findKey(/role|position|title/i)] || 'Member',
                        vocation: row[findKey(/vocation|job|industry/i)] || 'Community',
                        status: 'Active',
                        attendance: 100,
                        serviceHours: 0,
                        joinDate: new Date().toISOString().split('T')[0],
                        dob: '1980-01-01',
                        imageUrl: `https://ui-avatars.com/api/?name=${row[findKey(/first|name/i)] || 'U'}+${row[findKey(/last|surname/i)] || ''}&background=f3f4f6&color=6b7280&size=128`,
                        bio: "Imported Member"
                    };
                });

                if (mapped.length > 0) {
                    await importMembers(mapped);
                    // Refresh
                    const updated = await getMembers();
                    setMembers(updated);
                    showToast(`Successfully imported ${mapped.length} members using AI matching!`, 'success');
                }
            } catch (err) {
                console.error(err);
                showToast('Failed to parse file. Please ensure it is a valid Excel or CSV.', 'error');
            }
        };
        reader.readAsBinaryString(file);
    };

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            {/* Header */}
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '30px', flexWrap: 'wrap', gap: '20px' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 700, color: '#111827', lineHeight: 1.2 }}>Member Management</h1>
                    <p style={{ color: '#6b7280' }}>Track engagement, professions, and service.</p>
                </div>
                <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', alignItems: 'center' }}>
                    <div style={{ background: 'white', padding: '10px 16px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '10px', border: '1px solid #e5e7eb', flexGrow: 1, minWidth: '200px' }}>
                        <FaSearch color="#9ca3af" />
                        <input
                            type="text"
                            placeholder="Search members..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ border: 'none', outline: 'none', width: '100%' }}
                        />
                        {searchTerm && (
                            <FaTimes
                                color="#9ca3af"
                                style={{ cursor: 'pointer' }}
                                onClick={() => setSearchTerm('')}
                            />
                        )}
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <label style={{ padding: '12px', background: 'white', border: '1px solid #e5e7eb', borderRadius: '12px', color: '#4b5563', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
                            <FaFileImport /> <span className="hide-on-mobile">Import</span>
                            <input type="file" onChange={handleFileUpload} style={{ display: 'none' }} accept=".csv,.xlsx,.xls" />
                        </label>
                        <button onClick={handleExport} style={{ padding: '12px', background: 'white', border: '1px solid #e5e7eb', borderRadius: '12px', color: '#4b5563', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                            <FaFileExport /> <span className="hide-on-mobile">Export</span>
                        </button>
                    </div>
                    <button className="desktop-only-btn" onClick={() => { setSelectedMember({}); setIsModalOpen(true); }} style={{ padding: '12px 20px', background: 'var(--accent-primary)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                        <FaPlus /> Add Member
                    </button>
                </div>
            </div>

            {/* Mobile Floating Action Button (FAB) */}
            <button
                className="mobile-fab"
                onClick={() => { setSelectedMember({}); setIsModalOpen(true); }}
                style={{
                    position: 'fixed', bottom: '30px', right: '30px', width: '64px', height: '64px', borderRadius: '50%',
                    background: 'var(--accent-primary)', color: 'white', border: 'none',
                    boxShadow: '0 10px 25px -5px rgba(0, 91, 170, 0.5)', zIndex: 90,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
                }}
            >
                <FaPlus size={24} />
            </button>

            <style>{`
                @media (max-width: 768px) {
                    .desktop-only-btn { display: none !important; }
                    .hide-on-mobile { display: none !important; }
                }
                @media (min-width: 769px) {
                    .mobile-fab { display: none !important; }
                }
            `}</style>

            {/* WOW FEATURES WIDGET GRID */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '40px' }}>

                {/* 1. Vocation Visualizer */}
                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} style={{ background: 'white', padding: '20px', borderRadius: '16px', border: '1px solid #e5e7eb' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px', color: '#4b5563' }}>
                        <FaBriefcase /> <span style={{ fontWeight: 600 }}>Vocation Visualizer</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {getVocationStats().map(([vocation, count], idx) => (
                            <div key={vocation}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px' }}>
                                    <span>{vocation}</span>
                                    <span style={{ fontWeight: 700 }}>{count}</span>
                                </div>
                                <div style={{ height: '6px', background: '#f3f4f6', borderRadius: '3px', overflow: 'hidden' }}>
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${(count / members.length) * 100}%` }}
                                        transition={{ duration: 1, delay: idx * 0.1 }}
                                        style={{ height: '100%', background: idx === 0 ? 'var(--accent-primary)' : '#9ca3af' }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>



                {/* 4. Celebrations */}
                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} style={{ background: 'white', padding: '20px', borderRadius: '16px', border: '1px solid #e5e7eb' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px', color: '#ec4899' }}>
                        <FaBirthdayCake /> <span style={{ fontWeight: 600, color: '#4b5563' }}>Upcoming</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {getUpcomingCelebrations().map((m, idx) => (
                            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px', background: '#fdf2f8', borderRadius: '10px' }}>
                                <div style={{ background: 'white', padding: '8px', borderRadius: '8px', textAlign: 'center', minWidth: '45px' }}>
                                    <div style={{ fontSize: '0.7rem', color: '#ec4899', fontWeight: 700 }}>DEC</div>
                                    <div style={{ fontSize: '1rem', fontWeight: 700, color: '#1f2937' }}>{Math.floor(Math.random() * 20) + 10}</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{m.firstName}'s Birthday</div>
                                    <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>Send a card!</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* MEMBER TABLE */}
            <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                        <tr>
                            <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '0.85rem', fontWeight: 600, color: '#6b7280' }}>MEMBER</th>
                            <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '0.85rem', fontWeight: 600, color: '#6b7280' }}>ROLE</th>
                            <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '0.85rem', fontWeight: 600, color: '#6b7280' }}>STATUS</th>
                            <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '0.85rem', fontWeight: 600, color: '#6b7280' }}>JOINED</th>
                            <th style={{ padding: '16px 24px', textAlign: 'right', fontSize: '0.85rem', fontWeight: 600, color: '#6b7280' }}>ACTIONS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredMembers.map((member) => (
                            <tr key={member.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                <td style={{ padding: '16px 24px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <img src={member.imageUrl} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} alt="" />
                                        <div>
                                            <div style={{ fontWeight: 600, color: '#111827' }}>{member.firstName} {member.lastName}</div>
                                            <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>{member.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td style={{ padding: '16px 24px' }}>
                                    <div style={{ color: '#374151', fontWeight: 500 }}>{member.role}</div>
                                    <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>{member.vocation}</div>
                                </td>
                                <td style={{ padding: '16px 24px' }}>
                                    <span style={{
                                        padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700,
                                        background: member.status === 'Active' ? '#dcfce7' : '#fee2e2',
                                        color: member.status === 'Active' ? '#166534' : '#991b1b'
                                    }}>
                                        {member.status.toUpperCase()}
                                    </span>
                                </td>
                                <td style={{ padding: '16px 24px', color: '#6b7280', fontSize: '0.9rem' }}>
                                    {member.joinDate}
                                </td>
                                <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                                        <button
                                            onClick={() => handleCopyMember(member)}
                                            title="Copy Details"
                                            style={{ padding: '8px', background: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', color: '#4b5563', cursor: 'pointer' }}
                                        >
                                            <FaCopy />
                                        </button>
                                        <button
                                            onClick={() => openIdCard(member)}
                                            title="Generate ID Card"
                                            style={{ padding: '8px', background: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', color: 'var(--accent-primary)', cursor: 'pointer' }}
                                        >
                                            <FaIdCard />
                                        </button>
                                        <button
                                            onClick={() => { setSelectedMember(member); setIsModalOpen(true); }}
                                            title="Edit Member"
                                            style={{ padding: '8px', background: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', color: '#4b5563', cursor: 'pointer' }}
                                        >
                                            <FaUserCheck />
                                        </button>
                                        <button
                                            onClick={() => {
                                                confirmAction(
                                                    `Are you sure you want to delete ${member.firstName} ${member.lastName}?`,
                                                    async () => {
                                                        await deleteMember(member.id);
                                                        setMembers(await getMembers());
                                                        showToast('Member deleted successfully', 'success');
                                                    },
                                                    'Delete Member',
                                                    true
                                                );
                                            }}
                                            title="Delete Member"
                                            style={{ padding: '8px', background: '#fef2f2', border: '1px solid #fee2e2', borderRadius: '8px', color: '#ef4444', cursor: 'pointer' }}
                                        >
                                            <FaTimes />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* MEMBER EDIT/ADD MODAL */}
            <AnimatePresence>
                {isModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300 }}
                    >
                        <motion.div
                            initial={{ scale: 0.95 }} animate={{ scale: 1 }}
                            style={{ background: 'white', borderRadius: '20px', width: '100%', maxWidth: '600px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}
                        >
                            <div style={{ padding: '24px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{selectedMember?.id ? 'Edit Member' : 'Add New Member'}</h2>
                                <button onClick={() => { setIsModalOpen(false); setSelectedMember(null); }} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#9ca3af' }}>&times;</button>
                            </div>
                            <form onSubmit={async (e) => {
                                e.preventDefault();
                                const formData = new FormData(e.target);
                                // Get image URL from hidden input directly
                                const finalImageUrl = document.getElementById('hidden-image-input')?.value;

                                const newMember = {
                                    id: selectedMember?.id,
                                    firstName: formData.get('firstName'),
                                    lastName: formData.get('lastName'),
                                    email: formData.get('email'),
                                    dob: formData.get('dob'),
                                    role: formData.get('role'),
                                    vocation: formData.get('vocation'),
                                    serviceHours: selectedMember?.serviceHours || 0, // Preserve existing or default to 0
                                    joinDate: formData.get('joinDate') || new Date().toISOString().split('T')[0],
                                    status: 'Active',
                                    imageUrl: finalImageUrl || selectedMember?.imageUrl || `https://ui-avatars.com/api/?name=${formData.get('firstName')}+${formData.get('lastName')}&background=f3f4f6&color=6b7280&size=128`
                                };
                                await saveMember(newMember);
                                setMembers(await getMembers());
                                setIsModalOpen(false);
                                setSelectedMember(null);
                            }} style={{ padding: '24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>

                                <div style={{ gridColumn: 'span 2', display: 'flex', gap: '20px' }}>
                                    <div style={{ flex: 1 }}>
                                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>First Name</label>
                                        <input name="firstName" defaultValue={selectedMember?.firstName} required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db' }} />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Last Name</label>
                                        <input name="lastName" defaultValue={selectedMember?.lastName} required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db' }} />
                                    </div>
                                </div>

                                <div style={{ gridColumn: 'span 2', display: 'flex', gap: '20px' }}>
                                    <div style={{ flex: 1 }}>
                                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Email Address</label>
                                        <input name="email" type="email" defaultValue={selectedMember?.email} required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db' }} />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Date of Birth</label>
                                        <input name="dob" type="date" defaultValue={selectedMember?.dob} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db' }} />
                                    </div>
                                </div>

                                <div style={{ gridColumn: 'span 2', display: 'flex', gap: '20px' }}>
                                    <div style={{ flex: 1 }}>
                                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Role</label>
                                        <select name="role" defaultValue={selectedMember?.role || 'Member'} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db' }}>
                                            {lists.roles.map(r => <option key={r} value={r}>{r}</option>)}
                                        </select>
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Date Joined</label>
                                        <input name="joinDate" type="date" defaultValue={selectedMember?.joinDate || new Date().toISOString().split('T')[0]} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db' }} />
                                    </div>
                                </div>

                                <div style={{ gridColumn: 'span 2' }}>
                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Strength (Vocation)</label>
                                    <select name="vocation" defaultValue={selectedMember?.vocation || ''} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db' }}>
                                        <option value="">Select Strength...</option>
                                        {lists.strengths.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>

                                <div style={{ gridColumn: 'span 2' }}>
                                    <ImageUploader
                                        currentImage={selectedMember?.imageUrl}
                                        onImageUpload={(url) => {
                                            const input = document.getElementById('hidden-image-input');
                                            if (input) input.value = url || '';
                                        }}
                                        label="Profile Picture"
                                    />
                                    <input type="hidden" name="imageUrl" id="hidden-image-input" defaultValue={selectedMember?.imageUrl} />
                                </div>

                                <div style={{ gridColumn: 'span 2', display: 'flex', gap: '12px', marginTop: '10px' }}>
                                    <button type="button" onClick={() => { setIsModalOpen(false); setSelectedMember(null); }} style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db', background: 'white', cursor: 'pointer' }}>Cancel</button>
                                    <button type="submit" style={{ flex: 1, padding: '12px', borderRadius: '8px', border: 'none', background: 'var(--accent-primary)', color: 'white', fontWeight: 600, cursor: 'pointer' }}>Save Member</button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* 5. Smart ID Card Modal */}
            <AnimatePresence>
                {isIdModalOpen && selectedMember && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 250 }}
                        onClick={() => setIsIdModalOpen(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 50 }} animate={{ scale: 1, y: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            style={{ background: 'transparent', perspective: '1000px' }}
                        >
                            <div style={{
                                width: '350px',
                                background: 'white',
                                borderRadius: '20px',
                                overflow: 'hidden',
                                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                                border: '1px solid rgba(255,255,255,0.2)'
                            }}>
                                {/* Card Header */}
                                <div style={{ background: 'var(--accent-primary)', padding: '20px', textAlign: 'center', color: 'white' }}>
                                    <img src="https://www.rotary.org/sites/all/themes/rotary_rotaryorg/images/rotary-logo-color-2019-simplified.svg" style={{ width: '120px', filter: 'brightness(0) invert(1)' }} alt="Rotary" />
                                    <div style={{ marginTop: '10px', fontSize: '0.9rem', fontWeight: 500, opacity: 0.9 }}>CLUB MEMBER ID</div>
                                </div>

                                {/* Card Body */}
                                <div style={{ padding: '30px', textAlign: 'center', background: 'url(https://www.transparenttextures.com/patterns/cubes.png)' }}>
                                    <div style={{
                                        width: '100px', height: '100px', margin: '0 auto 20px',
                                        borderRadius: '50%', padding: '4px', background: 'white',
                                        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
                                    }}>
                                        <img src={selectedMember.imageUrl} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} alt="" />
                                    </div>

                                    <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#111827', margin: 0 }}>
                                        {selectedMember.firstName} {selectedMember.lastName}
                                    </h2>
                                    <div style={{ color: 'var(--accent-primary)', fontWeight: 600, fontSize: '0.9rem', marginTop: '5px' }}>
                                        {selectedMember.role.toUpperCase()}
                                    </div>

                                    <div style={{ margin: '20px 0', borderTop: '1px solid #e5e7eb', borderBottom: '1px solid #e5e7eb', padding: '15px 0', display: 'flex', justifyContent: 'center', gap: '20px' }}>
                                        <div>
                                            <div style={{ fontSize: '0.7rem', color: '#6b7280', fontWeight: 700 }}>VOCATION</div>
                                            <div style={{ fontWeight: 600, color: '#374151' }}>{selectedMember.vocation}</div>
                                        </div>
                                        <div style={{ width: '1px', background: '#e5e7eb' }}></div>
                                        <div>
                                            <div style={{ fontSize: '0.7rem', color: '#6b7280', fontWeight: 700 }}>ID NUMBER</div>
                                            <div style={{ fontWeight: 600, color: '#374151' }}>RC-2024-{selectedMember.id}</div>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', color: '#374151' }}>
                                        <FaQrcode size={40} />
                                        <div style={{ textAlign: 'left', fontSize: '0.7rem', lineHeight: 1.2 }}>
                                            <strong>SCAN TO VERIFY</strong><br />
                                            Active Member Status<br />
                                            Valid thru Dec 2025
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div style={{ padding: '15px', background: '#f9fafb', borderTop: '1px solid #e5e7eb', display: 'flex', gap: '10px' }}>
                                    <button onClick={() => window.print()} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db', background: 'white', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
                                        <FaPrint /> Print
                                    </button>
                                    <button onClick={() => setIsIdModalOpen(false)} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', background: '#374151', color: 'white', fontWeight: 600, cursor: 'pointer' }}>
                                        Close
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminMembers;

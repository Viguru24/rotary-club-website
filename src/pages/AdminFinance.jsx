import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlus, FaSearch, FaFileInvoiceDollar, FaWallet, FaMoneyBillWave, FaExchangeAlt } from 'react-icons/fa';
import { Receipt, Calendar, Store, Tag, DollarSign, Edit, Trash2, TrendingUp, TrendingDown } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import * as XLSX from 'xlsx';
import ReceiptScanner from '../components/ReceiptScanner';
import { useUI } from '../context/UIContext';

const AdminFinance = () => {
    const { showToast, confirmAction } = useUI();
    const [activeTab, setActiveTab] = useState('expenses'); // 'expenses' | 'income'
    const [expenses, setExpenses] = useState([]);
    const [income, setIncome] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isScannerOpen, setIsScannerOpen] = useState(false);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingItem, setEditingItem] = useState(null);
    const [invoiceData, setInvoiceData] = useState({
        invoiceNumber: `INV-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000)}`,
        date: new Date().toISOString().split('T')[0],
        recipientName: '',
        recipientAddress: '',
        items: [{ description: 'Consultation', quantity: 1, price: 100 }],
        showBankDetails: true,
        bankName: 'Barclays',
        sortCode: '20-00-00',
        accountNumber: '12345678',
        footerNote: 'Thank you for your business!',
    });

    const handleInvoiceItemChange = (index, field, value) => {
        const newItems = [...invoiceData.items];
        newItems[index][field] = value;
        setInvoiceData({ ...invoiceData, items: newItems });
    };

    const addInvoiceItem = () => {
        setInvoiceData({
            ...invoiceData,
            items: [...invoiceData.items, { description: '', quantity: 1, price: 0 }]
        });
    };

    const removeInvoiceItem = (index) => {
        const newItems = invoiceData.items.filter((_, i) => i !== index);
        setInvoiceData({ ...invoiceData, items: newItems });
    };

    const calculateTotal = () => {
        return invoiceData.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    };

    const handlePrintInvoice = () => {
        window.print();
    };

    // Load data on mount
    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [expRes, incRes] = await Promise.all([
                fetch('/api/expenses'),
                fetch('/api/income')
            ]);

            const expData = await expRes.json();
            const incData = await incRes.json();

            if (expData.message === 'success') setExpenses(expData.data);
            if (incData.message === 'success') setIncome(incData.data);

        } catch (error) {
            console.error("Failed to load finance data", error);
            showToast("Failed to load data", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleScanComplete = (data) => {
        setIsScannerOpen(false);
        if (activeTab !== 'expenses') {
            setActiveTab('expenses'); // Switch to expenses if scanning
            showToast('Switched to Expenses tab for receipt', 'info');
        }
        // Pre-fill form with scanned data
        setEditingItem({
            merchant: data.merchant || '',
            date: data.date || new Date().toISOString().split('T')[0],
            amount: data.amount || 0,
            category: data.category || 'Other',
            description: data.description || '',
            isNew: true
        });
        setIsFormOpen(true);
        showToast('Receipt scanned successfully! Please Review.', 'success');
    };

    const handleSaveTransaction = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);

        const isExpense = activeTab === 'expenses';
        const endpoint = isExpense ? '/api/expenses' : '/api/income';

        const transactionData = {
            date: formData.get('date'),
            amount: parseFloat(formData.get('amount')),
            category: formData.get('category'),
            description: formData.get('description'),
        };

        if (isExpense) {
            transactionData.merchant = formData.get('merchant');
        } else {
            transactionData.source = formData.get('source');
        }

        try {
            let res;
            if (editingItem?.id && !editingItem.isNew) {
                // Update
                res = await fetch(`${endpoint}/${editingItem.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(transactionData)
                });
                if (res.ok) showToast(`${isExpense ? 'Expense' : 'Income'} updated`, 'success');
            } else {
                // New
                res = await fetch(endpoint, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(transactionData)
                });
                if (res.ok) showToast(`${isExpense ? 'Expense' : 'Income'} added`, 'success');
            }

            if (!res.ok) throw new Error('Failed to save');

            fetchData(); // Refresh all
            setIsFormOpen(false);
            setEditingItem(null);
        } catch (err) {
            console.error(err);
            showToast('Failed to save transaction', 'error');
        }
    };

    const handleDelete = (id) => {
        const isExpense = activeTab === 'expenses';
        confirmAction(
            `Are you sure you want to delete this ${isExpense ? 'expense' : 'income'} record?`,
            async () => {
                try {
                    await fetch(`/api/${isExpense ? 'expenses' : 'income'}/${id}`, { method: 'DELETE' });
                    if (isExpense) {
                        setExpenses(prev => prev.filter(e => e.id !== id));
                    } else {
                        setIncome(prev => prev.filter(i => i.id !== id));
                    }
                    showToast('Record deleted', 'success');
                } catch (err) {
                    showToast('Failed to delete', 'error');
                }
            },
            `Delete ${isExpense ? 'Expense' : 'Income'}`,
            true
        );
    };

    // Filter Logic
    const currentData = activeTab === 'expenses' ? expenses : income;
    const filteredData = currentData.filter(item => {
        const searchContent = (activeTab === 'expenses' ? item.merchant : item.source) + ' ' + item.description + ' ' + item.category;
        return searchContent.toLowerCase().includes(searchTerm.toLowerCase());
    });

    // Stats Calculation
    const totalExpenses = expenses.reduce((sum, item) => sum + item.amount, 0);
    const totalIncome = income.reduce((sum, item) => sum + item.amount, 0);
    const netBalance = totalIncome - totalExpenses;

    // Chart Data Preparation (Monthly)
    const chartData = useMemo(() => {
        const dataMap = {};

        // Helper to get Year-Month key
        const getKey = (dateStr) => {
            if (!dateStr) return 'Unknown';
            return dateStr.substring(0, 7); // YYYY-MM
        };

        expenses.forEach(e => {
            const key = getKey(e.date);
            if (!dataMap[key]) dataMap[key] = { month: key, income: 0, expense: 0 };
            dataMap[key].expense += e.amount;
        });

        income.forEach(i => {
            const key = getKey(i.date);
            if (!dataMap[key]) dataMap[key] = { month: key, income: 0, expense: 0 };
            dataMap[key].income += i.amount;
        });

        return Object.values(dataMap).sort((a, b) => a.month.localeCompare(b.month));
    }, [expenses, income]);

    const handleExportProfitLoss = () => {
        // 1. Prepare Summary Data
        const summaryData = [
            ['Profit and Loss Statement'],
            ['Generated On', new Date().toLocaleDateString()],
            [''],
            ['Total Income', totalIncome],
            ['Total Expenses', totalExpenses],
            ['Net Profit/Loss', netBalance],
            [''],
            ['Breakdown by Category (Income)'],
            ...Object.entries(income.reduce((acc, curr) => {
                acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
                return acc;
            }, {})).map(([cat, amt]) => [cat, amt]),
            [''],
            ['Breakdown by Category (Expenses)'],
            ...Object.entries(expenses.reduce((acc, curr) => {
                acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
                return acc;
            }, {})).map(([cat, amt]) => [cat, amt]),
        ];

        // 2. Prepare Detailed Data
        const allTransactions = [
            ...income.map(i => ({ ...i, type: 'Income', merchant: i.source })),
            ...expenses.map(e => ({ ...e, type: 'Expense', merchant: e.merchant }))
        ].sort((a, b) => new Date(b.date) - new Date(a.date));

        const detailData = [
            ['ID', 'Date', 'Type', 'Source/Merchant', 'Category', 'Description', 'Amount'],
            ...allTransactions.map(t => [
                t.id,
                t.date,
                t.type,
                t.merchant,
                t.category,
                t.description,
                t.amount
            ])
        ];

        // 3. Create Workbook
        const wb = XLSX.utils.book_new();
        const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
        const wsDetail = XLSX.utils.aoa_to_sheet(detailData);

        // Auto-width for detail columns
        const wscols = [{ wch: 12 }, { wch: 10 }, { wch: 20 }, { wch: 15 }, { wch: 30 }, { wch: 10 }];
        wsDetail['!cols'] = wscols;

        XLSX.utils.book_append_sheet(wb, wsSummary, "P&L Summary");
        XLSX.utils.book_append_sheet(wb, wsDetail, "All Transactions");

        // 4. Save
        XLSX.writeFile(wb, "Rotary_Finance_PnL_Report.xlsx");
        showToast('Profit & Loss Report Exported!', 'success');
    };

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '50px' }}>
            {/* Header */}
            {/* Header */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '30px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
                        <div>
                            <h1 style={{ fontSize: '2rem', fontWeight: 700, color: '#111827', lineHeight: 1.2 }}>Financial Reports</h1>
                            <p style={{ color: '#6b7280', fontSize: '0.95rem' }}>Track expenses & income.</p>
                        </div>

                        {/* Tab Switcher */}
                        <div style={{ background: '#f3f4f6', padding: '4px', borderRadius: '12px', display: 'flex', gap: '4px', alignSelf: 'flex-start' }} className="no-print">
                            <button
                                onClick={() => setActiveTab('expenses')}
                                style={{
                                    padding: '8px 20px',
                                    background: activeTab === 'expenses' ? 'white' : 'transparent',
                                    borderRadius: '10px',
                                    border: 'none',
                                    color: activeTab === 'expenses' ? '#1f2937' : '#6b7280',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    boxShadow: activeTab === 'expenses' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                                    transition: 'all 0.2s',
                                    fontSize: '0.9rem'
                                }}
                            >
                                Expenses
                            </button>
                            <button
                                onClick={() => setActiveTab('income')}
                                style={{
                                    padding: '8px 20px',
                                    background: activeTab === 'income' ? 'white' : 'transparent',
                                    borderRadius: '10px',
                                    border: 'none',
                                    color: activeTab === 'income' ? '#10b981' : '#6b7280',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    boxShadow: activeTab === 'income' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                                    transition: 'all 0.2s',
                                    fontSize: '0.9rem'
                                }}
                            >
                                Income
                            </button>
                            <button
                                onClick={() => setActiveTab('invoices')}
                                style={{
                                    padding: '8px 20px',
                                    background: activeTab === 'invoices' ? 'white' : 'transparent',
                                    borderRadius: '10px',
                                    border: 'none',
                                    color: activeTab === 'invoices' ? 'var(--accent-primary)' : '#6b7280',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    boxShadow: activeTab === 'invoices' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                                    transition: 'all 0.2s',
                                    fontSize: '0.9rem'
                                }}
                            >
                                Invoices
                            </button>
                        </div>
                    </div>
                </div>

                {/* Actions Row - Responsive (Hide on invoices tab or adjust) */}
                {activeTab !== 'invoices' && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }} className="no-print">

                        <div style={{ flex: 1, minWidth: '280px', background: 'white', padding: '12px 16px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '10px', border: '1px solid #e5e7eb', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                            <FaSearch color="#9ca3af" />
                            <input
                                type="text"
                                placeholder={`Search ${activeTab}...`}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{ border: 'none', outline: 'none', width: '100%', fontSize: '0.95rem' }}
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                            <button onClick={handleExportProfitLoss} style={{ padding: '12px 20px', background: 'white', border: '1px solid #e5e7eb', borderRadius: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: '#4b5563', minWidth: '140px', justifyContent: 'center' }}>
                                <FaFileInvoiceDollar /> Export P&L
                            </button>

                            <button onClick={() => { setEditingItem(null); setIsFormOpen(true); }} style={{ padding: '12px 20px', background: 'white', border: '1px solid #e5e7eb', borderRadius: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: '#374151', minWidth: '140px', justifyContent: 'center' }}>
                                <FaPlus /> Add {activeTab === 'expenses' ? 'Exp.' : 'Inc.'}
                            </button>

                            {/* Desktop Scan Button */}
                            {activeTab === 'expenses' && (
                                <button className="desktop-only-btn" onClick={() => setIsScannerOpen(true)} style={{ padding: '12px 20px', background: 'var(--accent-primary)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(0, 91, 170, 0.2)' }}>
                                    <Receipt size={20} /> Scan Receipt
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Mobile Scan FAB (Floating Action Button) */}
            {activeTab === 'expenses' && (
                <button
                    onClick={() => setIsScannerOpen(true)}
                    style={{
                        position: 'fixed',
                        bottom: '30px',
                        right: '30px',
                        width: '64px',
                        height: '64px',
                        borderRadius: '50%',
                        background: 'var(--accent-primary)',
                        color: 'white',
                        border: 'none',
                        boxShadow: '0 10px 25px -5px rgba(0, 91, 170, 0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 90,
                        cursor: 'pointer'
                    }}
                    className="mobile-fab"
                >
                    <Receipt size={28} />
                </button>
            )}

            <style>{`
                @media (max-width: 768px) {
                    .desktop-only-btn { display: none !important; }
                }
                @media (min-width: 769px) {
                    .mobile-fab { display: none !important; }
                }
            `}</style>

            {/* Styles for Printing and Invoice Layout */}
            <style>{`
                @media print {
                    .no-print { display: none !important; }
                    .invoice-preview-container { 
                        box-shadow: none !important; 
                        border: none !important; 
                        width: 100% !important; 
                        margin: 0 !important; 
                        padding: 0 !important;
                        position: absolute;
                        top: 0;
                        left: 0;
                    }
                    body { background: white; }
                    .invoice-editor { display: none !important; }
                    .page-container { padding: 0 !important; margin: 0 !important; max-width: none !important; }
                }
                .invoice-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 30px;
                }
                @media (max-width: 1024px) {
                    .invoice-grid { grid-template-columns: 1fr; }
                }
            `}</style>

            {activeTab !== 'invoices' ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    {/* Stats Overview */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '40px' }} className="no-print">
                        {/* Income Card */}
                        <div style={{ background: 'white', padding: '24px', borderRadius: '16px', border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', gap: '20px' }}>
                            <div style={{ padding: '16px', background: '#ecfdf5', borderRadius: '12px', color: '#10b981' }}>
                                <FaMoneyBillWave size={24} />
                            </div>
                            <div>
                                <div style={{ fontSize: '0.9rem', color: '#6b7280', fontWeight: 600 }}>Total Income</div>
                                <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#111827' }}>£{totalIncome.toFixed(2)}</div>
                            </div>
                        </div>

                        {/* Expenses Card */}
                        <div style={{ background: 'white', padding: '24px', borderRadius: '16px', border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', gap: '20px' }}>
                            <div style={{ padding: '16px', background: '#eff6ff', borderRadius: '12px', color: '#3b82f6' }}>
                                <FaWallet size={24} />
                            </div>
                            <div>
                                <div style={{ fontSize: '0.9rem', color: '#6b7280', fontWeight: 600 }}>Total Expenses</div>
                                <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#111827' }}>£{totalExpenses.toFixed(2)}</div>
                            </div>
                        </div>

                        {/* Net Balance Card */}
                        <div style={{ background: 'white', padding: '24px', borderRadius: '16px', border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', gap: '20px' }}>
                            <div style={{ padding: '16px', background: netBalance >= 0 ? '#f0f9ff' : '#fef2f2', borderRadius: '12px', color: netBalance >= 0 ? '#0ea5e9' : '#ef4444' }}>
                                {netBalance >= 0 ? <TrendingUp size={24} /> : <TrendingDown size={24} />}
                            </div>
                            <div>
                                <div style={{ fontSize: '0.9rem', color: '#6b7280', fontWeight: 600 }}>Net Balance</div>
                                <div style={{ fontSize: '1.8rem', fontWeight: 700, color: netBalance >= 0 ? '#111827' : '#ef4444' }}>
                                    {netBalance < 0 ? '-' : '+'}£{Math.abs(netBalance).toFixed(2)}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Chart Section */}
                    <div style={{ background: 'white', padding: '24px', borderRadius: '16px', border: '1px solid #e5e7eb', marginBottom: '40px', height: '400px' }} className="no-print">
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#111827', marginBottom: '20px' }}>Cash Flow Analysis</h3>
                        <ResponsiveContainer width="100%" height="90%">
                            <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#6b7280' }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280' }} />
                                <Tooltip
                                    contentStyle={{ background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                    cursor={{ fill: '#f3f4f6' }}
                                />
                                <Legend />
                                <Bar dataKey="income" name="Income" fill="#10b981" radius={[4, 4, 0, 0]} barSize={30} />
                                <Bar dataKey="expense" name="Expense" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={30} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* List */}
                    <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #e5e7eb', overflow: 'hidden' }} className="no-print">
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                                <tr>
                                    <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '0.85rem', fontWeight: 600, color: '#6b7280' }}>
                                        {activeTab === 'expenses' ? 'MERCHANT' : 'SOURCE'}
                                    </th>
                                    <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '0.85rem', fontWeight: 600, color: '#6b7280' }}>DATE</th>
                                    <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '0.85rem', fontWeight: 600, color: '#6b7280' }}>CATEGORY</th>
                                    <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '0.85rem', fontWeight: 600, color: '#6b7280' }}>AMOUNT</th>
                                    <th style={{ padding: '16px 24px', textAlign: 'right', fontSize: '0.85rem', fontWeight: 600, color: '#6b7280' }}>ACTIONS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredData.map((item) => (
                                    <tr key={item.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                        <td style={{ padding: '16px 24px' }}>
                                            <div style={{ fontWeight: 600, color: '#111827' }}>
                                                {activeTab === 'expenses' ? item.merchant : item.source}
                                            </div>
                                            <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>{item.description}</div>
                                        </td>
                                        <td style={{ padding: '16px 24px', color: '#374151' }}>{item.date}</td>
                                        <td style={{ padding: '16px 24px' }}>
                                            <span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, background: '#f3f4f6', color: '#4b5563' }}>
                                                {item.category}
                                            </span>
                                        </td>
                                        <td style={{ padding: '16px 24px', fontWeight: 600, color: activeTab === 'expenses' ? '#111827' : '#10b981' }}>
                                            £{item.amount.toFixed(2)}
                                        </td>
                                        <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                                                <button onClick={() => { setEditingItem(item); setIsFormOpen(true); }} style={{ padding: '8px', background: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', color: '#4b5563', cursor: 'pointer' }}>
                                                    <Edit size={16} />
                                                </button>
                                                <button onClick={() => handleDelete(item.id)} style={{ padding: '8px', background: '#fef2f2', border: '1px solid #fee2e2', borderRadius: '8px', color: '#ef4444', cursor: 'pointer' }}>
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {filteredData.length === 0 && (
                            <div style={{ padding: '40px', textAlign: 'center', color: '#9ca3af' }}>No records found.</div>
                        )}
                    </div>

                    {/* Modals */}
                    {isScannerOpen && <ReceiptScanner onScanComplete={handleScanComplete} onClose={() => setIsScannerOpen(false)} />}
                    <AnimatePresence>
                        {isFormOpen && (
                            <motion.div
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300 }}
                            >
                                <motion.div
                                    initial={{ scale: 0.95 }} animate={{ scale: 1 }}
                                    style={{ background: 'white', borderRadius: '20px', width: '100%', maxWidth: '500px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}
                                >
                                    <div style={{ padding: '24px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>
                                            {editingItem?.id && !editingItem.isNew ? 'Edit' : 'Add'} {activeTab === 'expenses' ? 'Expense' : 'Income'}
                                        </h2>
                                        <button onClick={() => setIsFormOpen(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#9ca3af' }}>&times;</button>
                                    </div>
                                    <form onSubmit={handleSaveTransaction} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                        {/* Form Fields... (Using same logic as before but simplified for brevity of replacement if OK, essentially re-pasting the form content) */}
                                        {/* Since I am replacing the block, I must keep valid JSX. I will include the form fields as they were. */}
                                        <div>
                                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                                                <Store size={16} /> {activeTab === 'expenses' ? 'Merchant' : 'Source'}
                                            </label>
                                            <input name={activeTab === 'expenses' ? "merchant" : "source"} defaultValue={activeTab === 'expenses' ? editingItem?.merchant : editingItem?.source} required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db' }} />
                                        </div>
                                        <div>
                                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}><Calendar size={16} /> Date</label>
                                            <input name="date" type="date" defaultValue={editingItem?.date} required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db' }} />
                                        </div>
                                        <div>
                                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}><DollarSign size={16} /> Amount</label>
                                            <input name="amount" type="number" step="0.01" defaultValue={editingItem?.amount} required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db' }} />
                                        </div>
                                        <div>
                                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}><Tag size={16} /> Category</label>
                                            <select name="category" defaultValue={editingItem?.category || 'Other'} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db' }}>
                                                {activeTab === 'expenses' ? (
                                                    <>
                                                        <option value="Food">Food</option>
                                                        <option value="Transport">Transport</option>
                                                        <option value="Supplies">Supplies</option>
                                                        <option value="Utilities">Utilities</option>
                                                        <option value="Other">Other</option>
                                                    </>
                                                ) : (
                                                    <>
                                                        <option value="Donation">Donation</option>
                                                        <option value="Event">Event</option>
                                                        <option value="Membership">Membership</option>
                                                        <option value="Grant">Grant</option>
                                                        <option value="Other">Other</option>
                                                    </>
                                                )}
                                            </select>
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Description</label>
                                            <textarea name="description" rows="3" defaultValue={editingItem?.description} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db' }} />
                                        </div>
                                        <button type="submit" style={{ padding: '12px', borderRadius: '8px', border: 'none', background: activeTab === 'expenses' ? 'var(--accent-primary)' : '#10b981', color: 'white', fontWeight: 600, cursor: 'pointer' }}>
                                            Save {activeTab === 'expenses' ? 'Expense' : 'Income'}
                                        </button>
                                    </form>
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            ) : (
                <div className="invoice-grid">
                    {/* Invoice Editor */}
                    <div className="invoice-editor" style={{ background: 'white', padding: '24px', borderRadius: '16px', border: '1px solid #e5e7eb', height: 'fit-content' }}>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '20px' }}>Invoice Details</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div style={{ display: 'flex', gap: '15px' }}>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Invoice Number</label>
                                    <input value={invoiceData.invoiceNumber} onChange={(e) => setInvoiceData({ ...invoiceData, invoiceNumber: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db' }} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Date</label>
                                    <input type="date" value={invoiceData.date} onChange={(e) => setInvoiceData({ ...invoiceData, date: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db' }} />
                                </div>
                            </div>

                            <div style={{ padding: '15px', background: '#f9fafb', borderRadius: '12px' }}>
                                <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '10px' }}>Recipient Info</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    <input placeholder="Client / Recipient Name" value={invoiceData.recipientName} onChange={(e) => setInvoiceData({ ...invoiceData, recipientName: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db' }} />
                                    <textarea placeholder="Address Line 1&#10;City, Postcode" rows="3" value={invoiceData.recipientAddress} onChange={(e) => setInvoiceData({ ...invoiceData, recipientAddress: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db' }} />
                                </div>
                            </div>

                            <div style={{ padding: '15px', background: '#f9fafb', borderRadius: '12px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                    <h3 style={{ fontSize: '0.95rem', fontWeight: 600 }}>Items</h3>
                                    <button onClick={addInvoiceItem} style={{ background: 'white', border: '1px solid #d1d5db', padding: '4px 10px', borderRadius: '6px', fontSize: '0.8rem', cursor: 'pointer' }}>+ Add Item</button>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    {invoiceData.items.map((item, idx) => (
                                        <div key={idx} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                            <input placeholder="Desc" value={item.description} onChange={(e) => handleInvoiceItemChange(idx, 'description', e.target.value)} style={{ flex: 2, padding: '8px', borderRadius: '6px', border: '1px solid #d1d5db' }} />
                                            <input type="number" placeholder="Qty" value={item.quantity} onChange={(e) => handleInvoiceItemChange(idx, 'quantity', parseInt(e.target.value) || 0)} style={{ width: '60px', padding: '8px', borderRadius: '6px', border: '1px solid #d1d5db' }} />
                                            <input type="number" placeholder="Price" value={item.price} onChange={(e) => handleInvoiceItemChange(idx, 'price', parseFloat(e.target.value) || 0)} style={{ width: '80px', padding: '8px', borderRadius: '6px', border: '1px solid #d1d5db' }} />
                                            <button onClick={() => removeInvoiceItem(idx)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}><Trash2 size={16} /></button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div style={{ padding: '15px', background: '#f9fafb', borderRadius: '12px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                    <h3 style={{ fontSize: '0.95rem', fontWeight: 600 }}>Bank Details</h3>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span style={{ fontSize: '0.8rem' }}>{invoiceData.showBankDetails ? 'Show' : 'Hide'}</span>
                                        <input type="checkbox" checked={invoiceData.showBankDetails} onChange={(e) => setInvoiceData({ ...invoiceData, showBankDetails: e.target.checked })} />
                                    </div>
                                </div>
                                {invoiceData.showBankDetails && (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                        <input placeholder="Bank Name" value={invoiceData.bankName} onChange={(e) => setInvoiceData({ ...invoiceData, bankName: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db' }} />
                                        <div style={{ display: 'flex', gap: '10px' }}>
                                            <input placeholder="Sort Code" value={invoiceData.sortCode} onChange={(e) => setInvoiceData({ ...invoiceData, sortCode: e.target.value })} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db' }} />
                                            <input placeholder="Account No" value={invoiceData.accountNumber} onChange={(e) => setInvoiceData({ ...invoiceData, accountNumber: e.target.value })} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db' }} />
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div style={{ padding: '15px', background: '#f9fafb', borderRadius: '12px' }}>
                                <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '10px' }}>Footer Note</h3>
                                <textarea value={invoiceData.footerNote} onChange={(e) => setInvoiceData({ ...invoiceData, footerNote: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db' }} />
                            </div>

                            <button onClick={handlePrintInvoice} style={{ padding: '15px', background: 'var(--accent-primary)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                                <FaFileInvoiceDollar /> Print / Save as PDF
                            </button>
                        </div>
                    </div>

                    {/* Invoice Preview */}
                    <div className="invoice-preview-container" style={{ background: 'white', padding: '40px', borderRadius: '16px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', minHeight: '800px', display: 'flex', flexDirection: 'column' }}>
                        {/* Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px' }}>
                            <div>
                                <h1 style={{ color: '#005baa', fontSize: '2rem', fontWeight: 800, margin: 0 }}>Caterham Rotary</h1>
                                <p style={{ color: '#f7a81b', fontWeight: 700, margin: '5px 0 0 0', textTransform: 'uppercase', letterSpacing: '1px' }}>Service Above Self</p>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <h2 style={{ fontSize: '2.5rem', fontWeight: 900, color: '#e5e7eb', margin: 0, lineHeight: 1 }}>INVOICE</h2>
                                <p style={{ color: '#374151', fontWeight: 600, marginTop: '10px' }}>#{invoiceData.invoiceNumber}</p>
                                <p style={{ color: '#6b7280' }}>Date: {new Date(invoiceData.date).toLocaleDateString()}</p>
                            </div>
                        </div>

                        {/* Addresses */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '50px' }}>
                            <div>
                                <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: '#9ca3af', fontWeight: 700, marginBottom: '8px' }}>From:</h4>
                                <p style={{ fontWeight: 600, color: '#111827' }}>Caterham Rotary Club</p>
                                <p style={{ color: '#4b5563', lineHeight: 1.5 }}>
                                    Surrey National Golf Club<br />
                                    Rook Lane, Chaldon<br />
                                    Caterham, CR3 5AA
                                </p>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: '#9ca3af', fontWeight: 700, marginBottom: '8px' }}>Bill To:</h4>
                                <p style={{ fontWeight: 600, color: '#111827' }}>{invoiceData.recipientName || 'Recipient Name'}</p>
                                <p style={{ color: '#4b5563', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
                                    {invoiceData.recipientAddress || 'Recipient Address'}
                                </p>
                            </div>
                        </div>

                        {/* Items Table */}
                        <div style={{ flex: 1 }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '30px' }}>
                                <thead>
                                    <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                                        <th style={{ textAlign: 'left', padding: '15px 0', color: '#374151', fontSize: '0.9rem' }}>Description</th>
                                        <th style={{ textAlign: 'center', padding: '15px 0', color: '#374151', fontSize: '0.9rem', width: '80px' }}>Qty</th>
                                        <th style={{ textAlign: 'right', padding: '15px 0', color: '#374151', fontSize: '0.9rem', width: '120px' }}>Price</th>
                                        <th style={{ textAlign: 'right', padding: '15px 0', color: '#374151', fontSize: '0.9rem', width: '120px' }}>Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {invoiceData.items.map((item, idx) => (
                                        <tr key={idx} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                            <td style={{ padding: '15px 0', color: '#4b5563' }}>{item.description || 'Item description'}</td>
                                            <td style={{ padding: '15px 0', textAlign: 'center', color: '#4b5563' }}>{item.quantity}</td>
                                            <td style={{ padding: '15px 0', textAlign: 'right', color: '#4b5563' }}>£{parseFloat(item.price).toFixed(2)}</td>
                                            <td style={{ padding: '15px 0', textAlign: 'right', fontWeight: 600, color: '#111827' }}>£{(item.quantity * item.price).toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '2px solid #e5e7eb', paddingTop: '20px' }}>
                                <div style={{ textAlign: 'right' }}>
                                    <span style={{ fontSize: '1.2rem', fontWeight: 700, color: '#111827' }}>Total: £{calculateTotal().toFixed(2)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Footer Info */}
                        <div style={{ marginTop: 'auto', paddingTop: '40px', borderTop: '1px solid #e5e7eb' }}>
                            {invoiceData.showBankDetails && (
                                <div style={{ marginBottom: '20px' }}>
                                    <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#374151', marginBottom: '8px' }}>Bank Details for Payment:</h4>
                                    <p style={{ color: '#4b5563', fontSize: '0.9rem' }}>
                                        Bank: <span style={{ fontWeight: 600 }}>{invoiceData.bankName}</span><br />
                                        Sort Code: <span style={{ fontWeight: 600 }}>{invoiceData.sortCode}</span> &nbsp;|&nbsp;
                                        Account No: <span style={{ fontWeight: 600 }}>{invoiceData.accountNumber}</span>
                                    </p>
                                </div>
                            )}
                            <p style={{ textAlign: 'center', color: '#6b7280', fontSize: '0.9rem', fontStyle: 'italic' }}>
                                {invoiceData.footerNote}
                            </p>
                            <p style={{ textAlign: 'center', color: '#9ca3af', fontSize: '0.8rem', marginTop: '10px' }}>
                                Caterham Rotary Club - Thank you for your support.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminFinance;

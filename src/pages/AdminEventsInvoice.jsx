import React, { useState } from 'react';
import { Plus, Trash2, Printer, Save, Download } from 'lucide-react';

const AdminEventsInvoice = () => {
    // --- State (Maintained) ---
    const [invoiceData, setInvoiceData] = useState({
        date: new Date().toLocaleDateString('en-GB'),
        invoiceNumber: 'ROT-2025-001',
        billTo: "Client Name\nAddress Line 1\nPostcode",
        items: [
            { description: 'Sponsorship Package', qty: 1, rate: 500.00 }
        ]
    });

    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useState(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // --- Derived State ---
    const subTotal = invoiceData.items.reduce((acc, item) => acc + (item.qty * item.rate), 0);
    const total = subTotal;

    // --- Handlers ---
    const handleInputChange = (field, value) => setInvoiceData(prev => ({ ...prev, [field]: value }));

    const handleItemChange = (index, field, value) => {
        const newItems = [...invoiceData.items];
        newItems[index][field] = value;
        setInvoiceData(prev => ({ ...prev, items: newItems }));
    };

    const addItem = () => {
        setInvoiceData(prev => ({
            ...prev,
            items: [...prev.items, { description: '', qty: 1, rate: 0 }]
        }));
    };

    const removeItem = (index) => {
        if (invoiceData.items.length > 1) {
            setInvoiceData(prev => ({ ...prev, items: prev.items.filter((_, i) => i !== index) }));
        } else {
            handleItemChange(0, 'description', '');
            handleItemChange(0, 'qty', 1);
            handleItemChange(0, 'rate', 0);
        }
    };

    const handleDownload = () => {
        window.print();
    };

    const handleSave = async () => {
        try {
            const response = await fetch('/api/bunny-run/invoices', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    invoice_number: invoiceData.invoiceNumber, // Changed from invoiceData.number
                    company_name: invoiceData.billTo.split('\n')[0], // Extract company name from billTo
                    contact_name: invoiceData.billTo.split('\n')[0], // Assuming contact name is same as company for now
                    email: '', // No email field in current state
                    phone: '', // No phone field in current state
                    amount: total,
                    items: JSON.stringify(invoiceData.items),
                    description: 'Generated via Invoice Tool',
                    status: 'pending',
                    due_date: invoiceData.date // Using invoice date as due date for now
                })
            });
            if (response.ok) {
                alert('Invoice saved to database history.');
            } else {
                const err = await response.json();
                alert('Error saving: ' + (err.error || 'Unknown error'));
            }
        } catch (error) {
            console.error('Save failed:', error);
            alert('Failed to save invoice.');
        }
    };

    return (
        <div className="admin-wrapper" style={{ paddingBottom: '5rem' }}>
            {/* 1. Header (Hidden during Print) */}
            <header className="admin-page-header">
                <div>
                    <h1 className="admin-page-title">Event Invoicing</h1>
                    <p className="admin-page-subtitle">Generate professional VAT-style invoices for sponsors and partners.</p>
                </div>
                <div className="admin-header-actions">
                    <button onClick={handleSave} className="btn-secondary" style={{ background: '#10b981', color: 'white', borderColor: '#10b981' }}>
                        <Save size={18} /> Save to History
                    </button>
                    <button onClick={handleDownload} className="btn-primary">
                        <Printer size={18} /> Print / Save PDF
                    </button>
                </div>
            </header>

            {/* 2. Visual Container for the Invoice Page */}
            <div className="admin-card" style={{ maxWidth: '850px', margin: '0 auto', overflowX: 'auto' }}>
                <div className="admin-card-content" id="invoice-page" style={{
                    padding: isMobile ? '1rem' : '3rem',
                    minHeight: '1000px',
                    position: 'relative',
                    width: '100%',
                    minWidth: isMobile ? '100%' : '800px'
                }}>

                    {/* Invoice Header */}
                    <div style={{
                        display: 'flex',
                        flexDirection: isMobile ? 'column' : 'row',
                        justifyContent: 'space-between',
                        marginBottom: '3rem',
                        borderBottom: '2px solid #f1f5f9',
                        paddingBottom: '2rem',
                        gap: isMobile ? '1.5rem' : '0'
                    }}>
                        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                            {/* Logo */}
                            <div style={{ width: isMobile ? '60px' : '80px', height: isMobile ? '60px' : '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', borderRadius: '50%', flexShrink: 0 }}>
                                <span style={{ fontSize: isMobile ? '1.5rem' : '2rem' }}>⚙️</span>
                            </div>
                            <div>
                                <h2 style={{ margin: 0, color: '#0f172a', fontSize: isMobile ? '1.25rem' : '1.5rem', textTransform: 'uppercase', letterSpacing: '-0.5px', lineHeight: 1.2 }}>Rotary Club of Caterham</h2>
                                <p style={{ margin: '4px 0', color: '#64748b', fontSize: '0.9rem' }}>Registered Charity No: 263629</p>
                            </div>
                        </div>
                        <div style={{ textAlign: isMobile ? 'left' : 'right' }}>
                            <h1 style={{ fontSize: isMobile ? '2rem' : '2.5rem', margin: '0 0 1rem 0', color: '#eaeff5', fontWeight: '800' }}>INVOICE</h1>
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'auto auto',
                                gap: '0.5rem 1rem',
                                alignItems: 'center',
                                justifyContent: isMobile ? 'start' : 'end'
                            }}>
                                <label className="text-sm font-bold text-gray-400 uppercase">Date</label>
                                <input
                                    type="text"
                                    value={invoiceData.date}
                                    onChange={(e) => handleInputChange('date', e.target.value)}
                                    className="admin-input"
                                    style={{ textAlign: 'right', padding: '0.25rem 0.5rem', width: '120px' }}
                                />
                                <label className="text-sm font-bold text-gray-400 uppercase">Invoice #</label>
                                <input
                                    type="text"
                                    value={invoiceData.invoiceNumber}
                                    onChange={(e) => handleInputChange('invoiceNumber', e.target.value)}
                                    className="admin-input"
                                    style={{ textAlign: 'right', padding: '0.25rem 0.5rem', width: '120px' }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Billing Details */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: isMobile ? '1fr' : '1.5fr 1fr',
                        gap: isMobile ? '2rem' : '4rem',
                        marginBottom: '3rem'
                    }}>
                        <div>
                            <h3 className="text-sm font-bold text-gray-500 uppercase mb-2 border-b pb-1">Bill To</h3>
                            <textarea
                                value={invoiceData.billTo}
                                onChange={(e) => handleInputChange('billTo', e.target.value)}
                                className="admin-input"
                                style={{
                                    width: '100%', minHeight: isMobile ? '100px' : '120px', resize: 'none', lineHeight: '1.6', fontSize: '1rem',
                                    border: '1px solid transparent', background: 'transparent'
                                }}
                                onFocus={(e) => { e.target.style.background = '#f8fafc'; e.target.style.borderColor = '#e2e8f0'; }}
                                onBlur={(e) => { e.target.style.background = 'transparent'; e.target.style.borderColor = 'transparent'; }}
                            />
                        </div>
                        <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '0.75rem' }}>
                            <h3 className="text-sm font-bold text-gray-800 uppercase mb-3">Payment Instructions</h3>
                            <p className="text-sm font-medium mb-3">Payable to: Caterham Rotary Club</p>
                            <div className="text-sm text-gray-600 space-y-1">
                                <div className="flex justify-between"><span>Bank:</span> <strong>NatWest</strong></div>
                                <div className="flex justify-between"><span>Sort Code:</span> <strong>60-05-09</strong></div>
                                <div className="flex justify-between"><span>Account:</span> <strong>12345678</strong></div>
                                <div className="mt-2 text-xs italic text-gray-400">Ref: Please use Invoice #</div>
                            </div>
                        </div>
                    </div>

                    {/* Items Table */}
                    <div style={{ width: '100%', overflowX: 'auto', marginBottom: '1.5rem', WebkitOverflowScrolling: 'touch' }}>
                        <table style={{ width: '100%', minWidth: '600px', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: '#0f172a', color: 'white' }}>
                                    <th style={{ padding: '0.8rem 1rem', textAlign: 'left', borderRadius: '6px 0 0 6px', fontSize: '0.85rem', textTransform: 'uppercase' }}>Description</th>
                                    <th style={{ padding: '0.8rem 1rem', textAlign: 'center', width: '80px', fontSize: '0.85rem', textTransform: 'uppercase' }}>Qty</th>
                                    <th style={{ padding: '0.8rem 1rem', textAlign: 'right', width: '120px', fontSize: '0.85rem', textTransform: 'uppercase' }}>Rate (£)</th>
                                    <th style={{ padding: '0.8rem 1rem', textAlign: 'right', width: '120px', borderRadius: '0 6px 6px 0', fontSize: '0.85rem', textTransform: 'uppercase' }}>Amount</th>
                                    <th className="no-print" style={{ width: '40px' }}></th>
                                </tr>
                            </thead>
                            <tbody>
                                {invoiceData.items.map((item, idx) => (
                                    <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                        <td style={{ padding: '0.5rem' }}>
                                            <input
                                                type="text"
                                                value={item.description}
                                                onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                                                placeholder="Item description..."
                                                className="admin-input"
                                                style={{ border: 'none', padding: '0.5rem', width: '100%' }}
                                            />
                                        </td>
                                        <td style={{ padding: '0.5rem' }}>
                                            <input
                                                type="number"
                                                value={item.qty}
                                                onChange={(e) => handleItemChange(idx, 'qty', parseInt(e.target.value) || 0)}
                                                className="admin-input"
                                                style={{ border: 'none', textAlign: 'center', width: '100%' }}
                                            />
                                        </td>
                                        <td style={{ padding: '0.5rem' }}>
                                            <input
                                                type="number"
                                                value={item.rate}
                                                onChange={(e) => handleItemChange(idx, 'rate', parseFloat(e.target.value) || 0)}
                                                className="admin-input"
                                                style={{ border: 'none', textAlign: 'right', width: '100%' }}
                                            />
                                        </td>
                                        <td style={{ padding: '0.5rem', textAlign: 'right', fontWeight: 'bold', color: '#1f2937' }}>
                                            £{(item.qty * item.rate).toFixed(2)}
                                        </td>
                                        <td className="no-print" style={{ padding: '0.5rem', textAlign: 'center' }}>
                                            <button onClick={() => removeItem(idx)} style={{ color: '#f87171', background: 'none', border: 'none', cursor: 'pointer' }}>
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="no-print mb-8">
                        <button onClick={addItem} className="btn-secondary text-sm">
                            <Plus size={14} /> Add Line Item
                        </button>
                    </div>

                    {/* Totals */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem', marginTop: '2rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', width: '100%', maxWidth: '250px', gap: '2rem', padding: '0.5rem 0' }}>
                            <span style={{ color: '#64748b' }}>Subtotal:</span>
                            <span style={{ fontWeight: '600' }}>£{subTotal.toFixed(2)}</span>
                        </div>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'flex-end',
                            width: '100%',
                            maxWidth: '250px',
                            gap: '2rem',
                            padding: '1rem 0',
                            borderTop: '2px solid #0f172a',
                            fontSize: isMobile ? '1.1rem' : '1.25rem',
                            color: '#0f172a'
                        }}>
                            <span style={{ fontWeight: 'bold' }}>TOTAL:</span>
                            <span style={{ fontWeight: '800' }}>£{total.toFixed(2)}</span>
                        </div>
                    </div>

                    {/* Footer */}
                    <div style={{ marginTop: '4rem', padding: '2rem 0', borderTop: '1px solid #f1f5f9', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
                        <p style={{ marginBottom: '0.5rem' }}>Payment is due within 30 days. Thank you for your generous support of Caterham Rotary!</p>
                        <p style={{ fontWeight: 'bold', uppercase: 'true', letterSpacing: '0.1em', color: '#cbd5e1' }}>SERVICE ABOVE SELF</p>
                    </div>

                </div>
            </div>

            {/* Print Styles Overrides */}
            <style>{`
                @media print {
                    .no-print, .admin-wrapper > header { display: none !important; }
                    body { background: white; -webkit-print-color-adjust: exact; }
                    .admin-wrapper { padding: 0; margin: 0; max-width: none; }
                    .admin-card { box-shadow: none !important; border: none !important; margin: 0 !important; max-width: none !important; }
                    .admin-card-content { padding: 0 !important; }
                    /* Ensure inputs print as text */
                    input, textarea { border: none !important; resize: none; padding: 0; }
                }
            `}</style>
        </div>
    );
};

export default AdminEventsInvoice;

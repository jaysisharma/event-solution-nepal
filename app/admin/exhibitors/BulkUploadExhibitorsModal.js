'use client';

import React, { useState, useRef, useMemo } from 'react';
import * as XLSX from 'xlsx';
import styles from './exhibitorsAdmin.module.css';
import { bulkCreateExhibitors } from './actions';
import {
    X,
    Upload,
    FileSpreadsheet,
    FileText,
    Check,
    AlertCircle,
    Loader2,
    Trash2,
    Sparkles,
    Layers,
    Store,
    Calendar
} from 'lucide-react';

export default function BulkUploadExhibitorsModal({
    isOpen,
    onClose,
    initialEventSlug = null,
    initialYear = null,
    initialEditionId = null,
    events = [],
    onSuccess = null
}) {
    const fileInputRef = useRef(null);

    // Selected target event and edition
    const [selectedEventSlug, setSelectedEventSlug] = useState(initialEventSlug || (events[0]?.slug || ''));
    const currentEvent = useMemo(() => {
        return events.find(e => e.slug === selectedEventSlug) || events[0] || null;
    }, [events, selectedEventSlug]);

    const editionsForEvent = useMemo(() => {
        return currentEvent?.editions || [];
    }, [currentEvent]);

    const [selectedYear, setSelectedYear] = useState(() => {
        if (initialYear) return initialYear;
        if (editionsForEvent.length > 0) return editionsForEvent[0].year;
        return '2026';
    });

    // Input mode: 'paste' (comma/newline text) or 'file' (Excel / CSV)
    const [inputMode, setInputMode] = useState('paste');
    const [rawText, setRawText] = useState('');
    const [fileName, setFileName] = useState('');
    const [isParsingFile, setIsParsingFile] = useState(false);

    // Default category to apply to new exhibitors
    const [defaultCategory, setDefaultCategory] = useState('Festive & Consumer Trade');

    // Parsed list of exhibitors: array of { name, booth, contactPerson, contact, category }
    const [parsedExhibitors, setParsedExhibitors] = useState([]);

    // Submission states
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [statusMessage, setStatusMessage] = useState(null);

    // Reset or initialize on open
    React.useEffect(() => {
        if (isOpen) {
            if (initialEventSlug) setSelectedEventSlug(initialEventSlug);
            if (initialYear) setSelectedYear(initialYear);
            setStatusMessage(null);
        }
    }, [isOpen, initialEventSlug, initialYear]);

    // Update year if event changes and previous year is not in new event's editions
    React.useEffect(() => {
        if (editionsForEvent.length > 0) {
            const hasYear = editionsForEvent.some(e => e.year === selectedYear);
            if (!hasYear) {
                setSelectedYear(editionsForEvent[0].year);
            }
        }
    }, [editionsForEvent, selectedYear]);

    // Parse comma or newline separated text
    const handleParseText = (textToParse = rawText) => {
        if (!textToParse.trim()) {
            setParsedExhibitors([]);
            return;
        }

        const lines = textToParse.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
        const results = [];

        // Check if user pasted a tab-delimited or multi-column table (e.g. from Excel or email)
        const hasTabs = lines.some(l => l.includes('\t'));

        if (hasTabs) {
            for (const line of lines) {
                const cols = line.split('\t').map(c => c.trim());
                if (cols.length === 0) continue;

                // Ignore table header row if detected
                const lineLower = line.toLowerCase();
                if (lineLower.includes('stall no') && lineLower.includes('name')) continue;

                // Flexible extraction from tabular paste:
                // If columns match format: [S.N, Stall No, Stall Type, Size, Booked By, Name, Contact Person, Contact Number]
                if (cols.length >= 6 && (cols[2]?.toLowerCase().includes('stall') || cols[4]?.toLowerCase().includes('booked') || !isNaN(parseInt(cols[0])))) {
                    const booth = cols[1] || '';
                    const name = cols[5] || cols[4] || cols[1];
                    const contactPerson = cols[6] || '';
                    const contact = cols[7] || '';
                    if (name && !name.toLowerCase().includes('stall') && name !== 'Name') {
                        results.push({ name, booth, contactPerson, contact });
                        continue;
                    }
                }

                // Generic 2-column or 3-column tab data: [Name, Booth, Contact]
                const name = cols[0] || '';
                const booth = cols[1] || '';
                const contactPerson = cols[2] || '';
                const contact = cols[3] || '';
                if (name && name.toLowerCase() !== 'name' && name.toLowerCase() !== 'company') {
                    results.push({ name, booth, contactPerson, contact });
                }
            }
        } else {
            // Normal comma or line-separated list
            // Check if there are commas in lines
            let tokens = [];
            for (const line of lines) {
                if (line.includes(',')) {
                    const subTokens = line.split(',').map(s => s.trim()).filter(Boolean);
                    tokens.push(...subTokens);
                } else {
                    tokens.push(line);
                }
            }

            for (const item of tokens) {
                const trimmed = item.trim();
                // Ignore obvious header text
                if (!trimmed || trimmed.toLowerCase() === 'name' || trimmed.toLowerCase() === 'exhibitor name') continue;
                results.push({
                    name: trimmed,
                    booth: '',
                    contactPerson: '',
                    contact: ''
                });
            }
        }

        setParsedExhibitors(results);
    };

    // Parse Excel (.xlsx, .xls) or CSV file
    const handleFileUpload = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setFileName(file.name);
        setIsParsingFile(true);
        setStatusMessage(null);

        const reader = new FileReader();
        reader.onload = (evt) => {
            try {
                const data = new Uint8Array(evt.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                
                // Read as array of rows
                const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

                if (!rows || rows.length === 0) {
                    setStatusMessage({ type: 'error', text: 'The selected file is empty.' });
                    setIsParsingFile(false);
                    return;
                }

                // Identify header row (find row containing 'name' or 'exhibitor' or 'company')
                let headerRowIndex = -1;
                let colIndices = {
                    name: -1,
                    booth: -1,
                    contactPerson: -1,
                    contact: -1,
                    category: -1
                };

                for (let r = 0; r < Math.min(rows.length, 10); r++) {
                    const row = rows[r];
                    if (!Array.isArray(row)) continue;

                    for (let c = 0; c < row.length; c++) {
                        const cellVal = String(row[c] || '').trim().toLowerCase();
                        if (cellVal.match(/^(exhibitor\s*name|company\s*name|name|brand|company|exhibitor)$/i)) {
                            colIndices.name = c;
                            headerRowIndex = r;
                        } else if (cellVal.match(/(stall\s*no|stall|booth\s*no|booth)/i) && colIndices.booth === -1) {
                            colIndices.booth = c;
                        } else if (cellVal.match(/(contact\s*person|person|representative)/i) && colIndices.contactPerson === -1) {
                            colIndices.contactPerson = c;
                        } else if (cellVal.match(/(contact\s*no|contact\s*number|phone|mobile|tel)/i) && colIndices.contact === -1) {
                            colIndices.contact = c;
                        } else if (cellVal.match(/(category|sector|industry)/i) && colIndices.category === -1) {
                            colIndices.category = c;
                        }
                    }

                    if (headerRowIndex !== -1 && colIndices.name !== -1) {
                        break;
                    }
                }

                // If no named header row was found, default to first non-empty text column
                if (colIndices.name === -1) {
                    headerRowIndex = 0;
                    // Find first column with strings
                    for (let c = 0; c < (rows[0]?.length || 1); c++) {
                        if (typeof rows[0][c] === 'string' && rows[0][c].trim()) {
                            colIndices.name = c;
                            break;
                        }
                    }
                    if (colIndices.name === -1) colIndices.name = 0;
                }

                const extracted = [];
                const startRow = headerRowIndex + 1;

                for (let r = startRow; r < rows.length; r++) {
                    const row = rows[r];
                    if (!row || !Array.isArray(row)) continue;

                    const rawName = String(row[colIndices.name] || '').trim();
                    if (!rawName) continue;

                    // Skip repeated headers
                    if (rawName.toLowerCase() === 'name' || rawName.toLowerCase() === 'exhibitor') continue;

                    const booth = colIndices.booth !== -1 ? String(row[colIndices.booth] || '').trim() : '';
                    const contactPerson = colIndices.contactPerson !== -1 ? String(row[colIndices.contactPerson] || '').trim() : '';
                    const contact = colIndices.contact !== -1 ? String(row[colIndices.contact] || '').trim() : '';
                    const category = colIndices.category !== -1 ? String(row[colIndices.category] || '').trim() : '';

                    extracted.push({
                        name: rawName,
                        booth,
                        contactPerson,
                        contact,
                        category
                    });
                }

                setParsedExhibitors(extracted);
                setStatusMessage({
                    type: 'success',
                    text: `Successfully parsed ${extracted.length} exhibitors from ${file.name}.`
                });
            } catch (err) {
                console.error("Excel parse error:", err);
                setStatusMessage({ type: 'error', text: 'Failed to read file: ' + err.message });
            } finally {
                setIsParsingFile(false);
            }
        };

        reader.onerror = () => {
            setStatusMessage({ type: 'error', text: 'Error reading file.' });
            setIsParsingFile(false);
        };

        reader.readAsArrayBuffer(file);
    };

    // Remove single item from parsed list before saving
    const handleRemoveItem = (index) => {
        setParsedExhibitors(prev => prev.filter((_, i) => i !== index));
    };

    // Update single item in preview
    const handleUpdateItem = (index, field, value) => {
        setParsedExhibitors(prev => {
            const next = [...prev];
            next[index] = { ...next[index], [field]: value };
            return next;
        });
    };

    // Submit batch to Server Action
    const handleSubmit = async () => {
        if (parsedExhibitors.length === 0) {
            setStatusMessage({ type: 'error', text: 'Please add exhibitors before saving.' });
            return;
        }

        const targetEventSlug = selectedEventSlug || initialEventSlug;
        const targetYear = selectedYear || initialYear;

        if (!targetEventSlug || !targetYear) {
            setStatusMessage({ type: 'error', text: 'Please select an event series and edition year.' });
            return;
        }

        setIsSubmitting(true);
        setStatusMessage(null);

        try {
            const res = await bulkCreateExhibitors({
                editionId: initialEditionId,
                eventSlug: targetEventSlug,
                year: targetYear,
                exhibitors: parsedExhibitors,
                defaultCategory
            });

            if (res.success) {
                setStatusMessage({
                    type: 'success',
                    text: `Success! Added ${res.count} exhibitors to ${targetEventSlug} (${targetYear}).`
                });

                // Clear input
                setRawText('');
                setFileName('');
                setParsedExhibitors([]);

                if (onSuccess) {
                    onSuccess(res);
                }

                // Close modal after brief delay
                setTimeout(() => {
                    onClose();
                }, 1400);
            } else {
                setStatusMessage({ type: 'error', text: res.error || 'Failed to upload exhibitors' });
            }
        } catch (err) {
            setStatusMessage({ type: 'error', text: err.message || 'An unexpected error occurred' });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div
                className={styles.modalDialog}
                style={{ maxWidth: '780px', width: '92%' }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className={styles.modalHeader}>
                    <div>
                        <h2 className={styles.modalTitle} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Upload size={20} color="#2563eb" />
                            Bulk Upload Exhibitors
                        </h2>
                        <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '3px 0 0' }}>
                            Quickly add multiple exhibitors via comma/text paste or Excel (.xlsx / .csv) file.
                        </p>
                    </div>
                    <button type="button" onClick={onClose} className={styles.modalCloseBtn}>
                        <X size={18} />
                    </button>
                </div>

                <div className={styles.modalBody} style={{ gap: '1rem' }}>
                    {/* Event & Edition Target Picker (if multiple events available or not pre-locked) */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '0.75rem',
                        padding: '0.85rem 1rem',
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px'
                    }}>
                        <div>
                            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                                <Layers size={13} color="#2563eb" /> Target Exhibition
                            </label>
                            {initialEventSlug && events.length === 0 ? (
                                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0f172a' }}>
                                    {initialEventSlug}
                                </div>
                            ) : (
                                <select
                                    value={selectedEventSlug}
                                    onChange={(e) => setSelectedEventSlug(e.target.value)}
                                    className={styles.select}
                                    style={{ width: '100%', fontSize: '0.85rem', padding: '0.45rem 0.65rem' }}
                                >
                                    {events.map((ev) => (
                                        <option key={ev.slug} value={ev.slug}>
                                            {ev.title}
                                        </option>
                                    ))}
                                </select>
                            )}
                        </div>

                        <div>
                            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                                <Calendar size={13} color="#059669" /> Edition Year
                            </label>
                            {editionsForEvent.length > 0 ? (
                                <select
                                    value={selectedYear}
                                    onChange={(e) => setSelectedYear(e.target.value)}
                                    className={styles.select}
                                    style={{ width: '100%', fontSize: '0.85rem', padding: '0.45rem 0.65rem' }}
                                >
                                    {editionsForEvent.map((ed) => (
                                        <option key={ed.year} value={ed.year}>
                                            Edition {ed.year} ({ed.dates || 'Scheduled'})
                                        </option>
                                    ))}
                                </select>
                            ) : (
                                <input
                                    type="text"
                                    value={selectedYear}
                                    onChange={(e) => setSelectedYear(e.target.value)}
                                    className={styles.input}
                                    placeholder="2026"
                                    style={{ width: '100%', fontSize: '0.85rem', padding: '0.45rem 0.65rem' }}
                                />
                            )}
                        </div>

                        <div>
                            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                                <Store size={13} color="#7c3aed" /> Default Category
                            </label>
                            <input
                                type="text"
                                value={defaultCategory}
                                onChange={(e) => setDefaultCategory(e.target.value)}
                                placeholder="Festive & Consumer Trade"
                                className={styles.input}
                                style={{ width: '100%', fontSize: '0.85rem', padding: '0.45rem 0.65rem' }}
                            />
                        </div>
                    </div>

                    {/* Input Mode Selector Tabs */}
                    <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', gap: '0.5rem' }}>
                        <button
                            type="button"
                            onClick={() => setInputMode('paste')}
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '0.55rem 1rem',
                                border: 'none',
                                borderBottom: inputMode === 'paste' ? '2px solid #2563eb' : '2px solid transparent',
                                background: 'transparent',
                                color: inputMode === 'paste' ? '#2563eb' : '#64748b',
                                fontWeight: inputMode === 'paste' ? 700 : 500,
                                fontSize: '0.85rem',
                                cursor: 'pointer'
                            }}
                        >
                            <FileText size={15} />
                            Paste Comma / List of Names
                        </button>

                        <button
                            type="button"
                            onClick={() => setInputMode('file')}
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '0.55rem 1rem',
                                border: 'none',
                                borderBottom: inputMode === 'file' ? '2px solid #2563eb' : '2px solid transparent',
                                background: 'transparent',
                                color: inputMode === 'file' ? '#2563eb' : '#64748b',
                                fontWeight: inputMode === 'file' ? 700 : 500,
                                fontSize: '0.85rem',
                                cursor: 'pointer'
                            }}
                        >
                            <FileSpreadsheet size={15} />
                            Upload Excel (.xlsx, .xls) or CSV
                        </button>
                    </div>

                    {/* Mode 1: Paste Text */}
                    {inputMode === 'paste' && (
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#334155' }}>
                                    Paste exhibitor names (separated by commas or newlines):
                                </label>
                                {rawText && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setRawText('');
                                            setParsedExhibitors([]);
                                        }}
                                        style={{ fontSize: '0.75rem', color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}
                                    >
                                        Clear Text
                                    </button>
                                )}
                            </div>
                            <textarea
                                rows={6}
                                value={rawText}
                                onChange={(e) => {
                                    setRawText(e.target.value);
                                    handleParseText(e.target.value);
                                }}
                                placeholder="Paste names here, e.g.:&#10;UDHAMI GHAR, SARANGI BEDSHEET, DIAMOND KNITLAND, ARKSH GROUP&#10;or copy & paste columns directly from Excel / Google Sheets"
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    fontSize: '0.85rem',
                                    fontFamily: 'monospace',
                                    border: '1px solid #cbd5e1',
                                    borderRadius: '6px',
                                    outline: 'none',
                                    resize: 'vertical',
                                    backgroundColor: '#ffffff',
                                    color: '#0f172a'
                                }}
                            />
                            <p style={{ fontSize: '0.72rem', color: '#64748b', margin: '4px 0 0' }}>
                                Tip: You can paste comma-separated names, one per line, or copy entire table rows from Excel.
                            </p>
                        </div>
                    )}

                    {/* Mode 2: Excel / CSV File Upload */}
                    {inputMode === 'file' && (
                        <div>
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                style={{
                                    border: '2px dashed #cbd5e1',
                                    borderRadius: '8px',
                                    padding: '2rem 1.5rem',
                                    textAlign: 'center',
                                    cursor: 'pointer',
                                    backgroundColor: '#f8fafc',
                                    transition: 'all 0.15s ease'
                                }}
                            >
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".xlsx, .xls, .csv"
                                    onChange={handleFileUpload}
                                    style={{ display: 'none' }}
                                />
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                                    <FileSpreadsheet size={36} color="#059669" />
                                    <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#0f172a' }}>
                                        {fileName ? fileName : 'Click to select or drag Excel file (.xlsx, .xls, .csv)'}
                                    </div>
                                    <p style={{ fontSize: '0.75rem', color: '#64748b', margin: 0 }}>
                                        Automatically detects columns: Name, Stall No, Contact Person, Phone Number
                                    </p>
                                </div>
                            </div>
                            {isParsingFile && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px', fontSize: '0.8rem', color: '#2563eb' }}>
                                    <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
                                    <span>Reading and parsing file...</span>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Preview Table of Parsed Exhibitors */}
                    {parsedExhibitors.length > 0 && (
                        <div>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                marginBottom: '0.5rem',
                                padding: '0.4rem 0.6rem',
                                background: '#eff6ff',
                                border: '1px solid #bfdbfe',
                                borderRadius: '6px'
                            }}>
                                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 700, color: '#1e40af' }}>
                                    <Sparkles size={14} color="#2563eb" />
                                    <span>{parsedExhibitors.length} Exhibitor{parsedExhibitors.length > 1 ? 's' : ''} Ready for Import</span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setParsedExhibitors([])}
                                    style={{ fontSize: '0.75rem', color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}
                                >
                                    Remove All
                                </button>
                            </div>

                            <div style={{
                                maxHeight: '240px',
                                overflowY: 'auto',
                                border: '1px solid #e2e8f0',
                                borderRadius: '6px',
                                background: '#ffffff'
                            }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                                    <thead style={{ position: 'sticky', top: 0, background: '#f8fafc', borderBottom: '1px solid #e2e8f0', zIndex: 1 }}>
                                        <tr>
                                            <th style={{ padding: '6px 10px', textAlign: 'left', width: '40px', color: '#64748b' }}>#</th>
                                            <th style={{ padding: '6px 10px', textAlign: 'left', color: '#64748b' }}>Exhibitor Name</th>
                                            <th style={{ padding: '6px 10px', textAlign: 'left', width: '100px', color: '#64748b' }}>Stall</th>
                                            <th style={{ padding: '6px 10px', textAlign: 'left', color: '#64748b' }}>Contact</th>
                                            <th style={{ padding: '6px 10px', textAlign: 'center', width: '40px', color: '#64748b' }}>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {parsedExhibitors.map((ex, idx) => (
                                            <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                                <td style={{ padding: '6px 10px', color: '#94a3b8', fontWeight: 600 }}>
                                                    {idx + 1}
                                                </td>
                                                <td style={{ padding: '6px 10px' }}>
                                                    <input
                                                        type="text"
                                                        value={ex.name}
                                                        onChange={(e) => handleUpdateItem(idx, 'name', e.target.value)}
                                                        style={{
                                                            width: '100%',
                                                            border: '1px solid #cbd5e1',
                                                            borderRadius: '4px',
                                                            padding: '3px 6px',
                                                            fontSize: '0.8rem',
                                                            fontWeight: 600,
                                                            color: '#0f172a'
                                                        }}
                                                    />
                                                </td>
                                                <td style={{ padding: '6px 10px' }}>
                                                    <input
                                                        type="text"
                                                        value={ex.booth || ''}
                                                        onChange={(e) => handleUpdateItem(idx, 'booth', e.target.value)}
                                                        placeholder="Stall No"
                                                        style={{
                                                            width: '100%',
                                                            border: '1px solid #cbd5e1',
                                                            borderRadius: '4px',
                                                            padding: '3px 6px',
                                                            fontSize: '0.75rem'
                                                        }}
                                                    />
                                                </td>
                                                <td style={{ padding: '6px 10px' }}>
                                                    <input
                                                        type="text"
                                                        value={ex.contact || ex.contactPerson || ''}
                                                        onChange={(e) => handleUpdateItem(idx, 'contact', e.target.value)}
                                                        placeholder="Phone / Person"
                                                        style={{
                                                            width: '100%',
                                                            border: '1px solid #cbd5e1',
                                                            borderRadius: '4px',
                                                            padding: '3px 6px',
                                                            fontSize: '0.75rem'
                                                        }}
                                                    />
                                                </td>
                                                <td style={{ padding: '6px 10px', textAlign: 'center' }}>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveItem(idx)}
                                                        style={{
                                                            background: 'none',
                                                            border: 'none',
                                                            color: '#ef4444',
                                                            cursor: 'pointer',
                                                            padding: '2px'
                                                        }}
                                                        title="Remove from batch"
                                                    >
                                                        <Trash2 size={13} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Status Feedback Message */}
                    {statusMessage && (
                        <div style={{
                            padding: '0.65rem 0.9rem',
                            borderRadius: '6px',
                            fontSize: '0.8rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            background: statusMessage.type === 'success' ? '#ecfdf5' : '#fef2f2',
                            color: statusMessage.type === 'success' ? '#065f46' : '#991b1b',
                            border: `1px solid ${statusMessage.type === 'success' ? '#a7f3d0' : '#fecaca'}`
                        }}>
                            {statusMessage.type === 'success' ? <Check size={16} color="#10b981" /> : <AlertCircle size={16} color="#ef4444" />}
                            <span>{statusMessage.text}</span>
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className={styles.modalFooter}>
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isSubmitting}
                        className={styles.btnSecondary}
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={isSubmitting || parsedExhibitors.length === 0}
                        className={styles.btnPrimary}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
                                <span>Uploading {parsedExhibitors.length} Exhibitors...</span>
                            </>
                        ) : (
                            <>
                                <Check size={15} />
                                <span>Save & Import {parsedExhibitors.length > 0 ? `(${parsedExhibitors.length})` : ''}</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

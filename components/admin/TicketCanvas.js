"use client";
import React, { useState, useRef, useEffect } from 'react';
import { Settings, Type, Palette, QrCode as QrIcon } from 'lucide-react';

const TicketCanvas = ({ templateImage, initialConfig, onChange }) => {
    // Default configuration for new events
    const defaultFields = [
        { id: 'name', label: 'User Name', x: 100, y: 100, fontSize: 48, color: '#000000', show: true },
        { id: 'number', label: 'Phone Number', x: 100, y: 160, fontSize: 32, color: '#333333', show: true },
        { id: 'address', label: 'Address', x: 100, y: 200, fontSize: 24, color: '#555555', show: false },
        { id: 'title', label: 'Job Title / Role', x: 100, y: 240, fontSize: 24, color: '#555555', show: false },
        { id: 'organization', label: 'Organization', x: 100, y: 280, fontSize: 28, color: '#000000', show: false },
        { id: 'website', label: 'Website', x: 100, y: 320, fontSize: 20, color: '#555555', show: false },
        { id: 'email', label: 'Email', x: 100, y: 360, fontSize: 24, color: '#333333', show: false },
        { id: 'ticketId', label: 'Ticket ID', x: 500, y: 100, fontSize: 24, color: '#888888', show: true },
        { id: 'qr', label: 'VCard QR Code', x: 800, y: 300, fontSize: 200, color: '#000000', show: true },
    ];

    // Merge initialConfig with defaults to ensure new fields (like qr) appear for existing events
    const getInitialFields = () => {
        if (!initialConfig || initialConfig.length === 0) return defaultFields;

        // Return initialConfig + any missing defaults
        // (e.g. if 'qr' was added later, we append it)
        const existingIds = new Set(initialConfig.map(f => f.id));
        const missingFields = defaultFields.filter(f => !existingIds.has(f.id));
        return [...initialConfig, ...missingFields];
    };

    // We store REAL coordinates relative to natural image size (e.g., 1920x1080)
    const [fields, setFields] = useState(getInitialFields);

    const [selectedField, setSelectedField] = useState(null);
    const containerRef = useRef(null);
    const imgRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);

    // Scale: Real / Display
    const [scale, setScale] = useState(1);
    const [naturalSize, setNaturalSize] = useState({ w: 0, h: 0 });

    const PREVIEW_WIDTH = 600;

    // Remove onChange from dependency to prevent loop
    useEffect(() => {
        if (onChange) {
            onChange(JSON.stringify(fields));
        }
    }, [fields]);

    const handleImageLoad = (e) => {
        const natW = e.target.naturalWidth;
        const natH = e.target.naturalHeight;
        setNaturalSize({ w: natW, h: natH });

        // Calculate initial scale
        if (containerRef.current) {
            const domW = containerRef.current.offsetWidth;
            if (domW > 0) {
                setScale(natW / domW);
            }
        }
    };

    // Update scale on resize
    useEffect(() => {
        const handleResize = () => {
            if (containerRef.current && naturalSize.w > 0) {
                const domW = containerRef.current.offsetWidth;
                if (domW > 0) {
                    setScale(naturalSize.w / domW);
                }
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [naturalSize.w]);

    const handleDragStart = (e, field) => {
        e.preventDefault();
        setSelectedField(field);
        setIsDragging(true);
    };

    const handleDrag = (e) => {
        if (!isDragging || !selectedField || !containerRef.current) return;

        const rect = containerRef.current.getBoundingClientRect();
        const domX = (e.clientX - rect.left);
        const domY = (e.clientY - rect.top);

        // Convert DOM coordinates BACK to Real Coordinates
        const realX = Math.round(domX * scale);
        const realY = Math.round(domY * scale);

        // Update field position
        setFields(prev => prev.map(f => f.id === selectedField.id ? { ...f, x: realX, y: realY } : f));
    };

    const handleDragEnd = () => {
        setIsDragging(false);
    };

    const updateField = (id, key, value) => {
        setFields(prev => prev.map(f => f.id === id ? { ...f, [key]: value } : f));
    };

    const toggleField = (id) => {
        setFields(prev => prev.map(f => f.id === id ? { ...f, show: !f.show } : f));
    };

    // Helper for mouse events on container
    const onMouseMove = (e) => {
        if (isDragging) handleDrag(e);
    };

    if (!templateImage) return <div style={{ padding: '20px', background: '#f8fafc', borderRadius: '8px', textAlign: 'center', color: '#64748b' }}>Upload a template image first to unlock customization.</div>;

    return (
        <div style={{ marginTop: '20px', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', background: 'white' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '16px', color: '#1e293b' }}>Ticket Customization (WYSIWYG)</h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '24px' }}>

                {/* Visual Editor */}
                <div
                    ref={containerRef}
                    style={{
                        position: 'relative',
                        width: '100%',
                        maxWidth: `${PREVIEW_WIDTH}px`,
                        border: '1px dashed #cbd5e1',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        cursor: isDragging ? 'grabbing' : 'default',
                        userSelect: 'none'
                    }}
                    onMouseMove={onMouseMove}
                    onMouseUp={handleDragEnd}
                    onMouseLeave={handleDragEnd}
                >
                    <img
                        ref={imgRef}
                        src={templateImage}
                        alt="Preview"
                        style={{ width: '100%', display: 'block', pointerEvents: 'none' }}
                        onLoad={handleImageLoad}
                    />

                    {fields.filter(f => f.show).map(field => {
                        // Display logic: Downscale Real Coords (or use %) to DOM

                        // Just ensure naturalSize is loaded
                        if (naturalSize.w === 0) return null;

                        const domLeft = field.x / scale;
                        const domTop = field.y / scale;
                        const domFontSize = field.fontSize / scale; // acts as Width/Height for QR

                        return (
                            <div
                                key={field.id}
                                onMouseDown={(e) => handleDragStart(e, field)}
                                style={{
                                    position: 'absolute',
                                    left: `${domLeft}px`,
                                    top: `${domTop}px`,
                                    // Custom styling for QR code vs Text
                                    fontSize: field.id !== 'qr' ? `${domFontSize}px` : undefined,
                                    width: field.id === 'qr' ? `${domFontSize}px` : 'auto',
                                    height: field.id === 'qr' ? `${domFontSize}px` : 'auto',
                                    color: field.color,
                                    fontWeight: 'bold',
                                    cursor: 'grab',
                                    border: selectedField?.id === field.id ? '2px dashed #3b82f6' : '1px dashed transparent',
                                    padding: '2px',
                                    backgroundColor: selectedField?.id === field.id ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                                    whiteSpace: 'nowrap',
                                    transform: 'translate(-50%, -50%)', // Center anchor match
                                    lineHeight: 1,
                                    userSelect: 'none',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                {field.id === 'qr' ? (
                                    <div style={{ width: '100%', height: '100%', background: 'white', border: '1px solid #ccc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <QrIcon size={domFontSize * 0.6} color="black" />
                                    </div>
                                ) : (
                                    field.id === 'name' ? 'Jane Doe' :
                                        field.id === 'number' ? '+977 9800000000' :
                                            field.id === 'ticketId' ? 'T-1234' :
                                                field.id === 'title' ? 'Event Manager' :
                                                    field.id === 'organization' ? 'Event Solutions Pvt Ltd' :
                                                        field.id === 'website' ? 'www.eventsolutions.com' :
                                                            field.id === 'email' ? 'jane@example.com' :
                                                                'Jwagal, Lalitpur'
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Sidebar Controls */}
                <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', height: 'fit-content' }}>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '12px', color: '#475569' }}>Elements</h4>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {fields.map(field => (
                            <div key={field.id} style={{ background: 'white', padding: '10px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', fontWeight: 500, color: '#334155' }}>
                                        <input type="checkbox" checked={field.show} onChange={() => toggleField(field.id)} />
                                        {field.label}
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() => setSelectedField(field)}
                                        style={{ color: selectedField?.id === field.id ? '#3b82f6' : '#94a3b8', background: 'none', border: 'none', cursor: 'pointer' }}
                                    >
                                        <Settings size={16} />
                                    </button>
                                </div>

                                {field.show && selectedField?.id === field.id && (
                                    <div style={{ marginTop: '8px', padding: '8px', background: '#f1f5f9', borderRadius: '4px' }}>
                                        <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                                            <div style={{ flex: 1 }}>
                                                <label style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    {field.id === 'qr' ? <Settings size={12} /> : <Type size={12} />}
                                                    {field.id === 'qr' ? ' Size (px)' : ' Font Size (px)'}
                                                </label>
                                                <input
                                                    type="number"
                                                    value={field.fontSize}
                                                    onChange={(e) => updateField(field.id, 'fontSize', parseInt(e.target.value) || 0)}
                                                    style={{ width: '100%', padding: '4px', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '0.8rem' }}
                                                />
                                            </div>
                                            {field.id !== 'qr' && (
                                                <div style={{ flex: 1 }}>
                                                    <label style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}><Palette size={12} /> Color</label>
                                                    <input
                                                        type="color"
                                                        value={field.color}
                                                        onChange={(e) => updateField(field.id, 'color', e.target.value)}
                                                        style={{ width: '100%', padding: '0', border: 'none', height: '26px', cursor: 'pointer' }}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    <div style={{ marginTop: '16px', fontSize: '0.75rem', color: '#94a3b8', lineHeight: '1.4' }}>
                        * <strong>FYI:</strong> The editor scales your inputs to match the full-resolution ticket image.
                        <br />
                        * Drag items to position.
                        <br />
                        * Click gear icon to adjust size/style.
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TicketCanvas;

"use client";
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
    ArrowLeft,
    MoreHorizontal,
    X,
    Phone,
    Mail,
    Globe,
    ArrowUpRight,
    User,
    MapPin,
    Copy,
    Check,
    Play
} from 'lucide-react';
import styles from './ExhibitorDetail.module.css';
import { useTheme } from '@/context/ThemeContext';

export default function ExhibitorDetailClient({ event, edition, exhibitor }) {
    const { theme } = useTheme();
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [copiedEmail, setCopiedEmail] = useState(false);
    const [expandedPhoto, setExpandedPhoto] = useState(null);
    const [isVideoPlaying, setIsVideoPlaying] = useState(false);
    const videoRef = useRef(null);
    const menuRef = useRef(null);

    // Close details popover when clicking outside or pressing Escape
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === "Escape") {
                setDetailsOpen(false);
                setExpandedPhoto(null);
            }
        };

        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setDetailsOpen(false);
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        if (detailsOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [detailsOpen]);

    const handleCopyEmail = (email) => {
        navigator.clipboard.writeText(email);
        setCopiedEmail(true);
        setTimeout(() => setCopiedEmail(false), 2000);
    };

    const toggleVideo = () => {
        if (!videoRef.current) return;
        if (videoRef.current.paused) {
            videoRef.current.play();
            setIsVideoPlaying(true);
        } else {
            videoRef.current.pause();
            setIsVideoPlaying(false);
        }
    };

    const contactPerson = exhibitor.contactPerson || "Exhibition Representative";

    return (
        <main className={`${styles.main} ${theme === 'dark' ? styles.dark : ''}`}>
            <div className={styles.container}>
                {/* Top Bar with Back Link & 3-Dot Details Menu */}
                <div className={styles.topNavigation}>
                    <Link
                        href={`/exhibitors/${event.slug}/${edition.year}`}
                        className={styles.backLink}
                    >
                        <ArrowLeft size={16} />
                        <span>Back to {event.title} ({edition.year})</span>
                    </Link>

                    {/* 3-Dot Details Action Menu */}
                    <div className={styles.actionMenuContainer} ref={menuRef}>
                        <button
                            type="button"
                            onClick={() => setDetailsOpen(!detailsOpen)}
                            className={`${styles.detailsBtn} ${detailsOpen ? styles.detailsBtnActive : ''}`}
                            aria-label="Exhibitor Contact & Info"
                            title="Contact & Info Details"
                            aria-expanded={detailsOpen}
                        >
                            <span className={styles.detailsBtnLabel}>Details</span>
                            <MoreHorizontal size={20} />
                        </button>

                        {/* 3-Dot Details Dropdown / Popover Sheet */}
                        {detailsOpen && (
                            <div className={styles.detailsSheet}>
                                <div className={styles.sheetHeader}>
                                    <div className={styles.sheetHeaderTitleGroup}>
                                        <span className={styles.sheetKicker}>Exhibitor Info</span>
                                        <h4 className={styles.sheetTitle}>{exhibitor.name}</h4>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setDetailsOpen(false)}
                                        className={styles.sheetCloseBtn}
                                        aria-label="Close details"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>

                                <div className={styles.sheetBody}>
                                    {/* Contact Person */}
                                    <div className={styles.infoRow}>
                                        <div className={styles.infoIconWrapper}>
                                            <User size={18} />
                                        </div>
                                        <div className={styles.infoTextGroup}>
                                            <span className={styles.infoLabel}>Contact Person</span>
                                            <span className={styles.infoValue}>{contactPerson}</span>
                                        </div>
                                    </div>

                                    {/* Phone Number */}
                                    {exhibitor.contact && (
                                        <div className={styles.infoRow}>
                                            <div className={styles.infoIconWrapper}>
                                                <Phone size={18} />
                                            </div>
                                            <div className={styles.infoTextGroup}>
                                                <span className={styles.infoLabel}>Phone Number</span>
                                                <a href={`tel:${exhibitor.contact}`} className={styles.infoLink}>
                                                    {exhibitor.contact}
                                                </a>
                                            </div>
                                        </div>
                                    )}

                                    {/* Website Link */}
                                    {exhibitor.website && (
                                        <div className={styles.infoRow}>
                                            <div className={styles.infoIconWrapper}>
                                                <Globe size={18} />
                                            </div>
                                            <div className={styles.infoTextGroup}>
                                                <span className={styles.infoLabel}>Official Website</span>
                                                <a
                                                    href={exhibitor.website}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className={styles.infoLink}
                                                >
                                                    <span>{exhibitor.website.replace(/^https?:\/\//, '')}</span>
                                                    <ArrowUpRight size={13} />
                                                </a>
                                            </div>
                                        </div>
                                    )}

                                    {/* Email Address */}
                                    {exhibitor.email && (
                                        <div className={styles.infoRow}>
                                            <div className={styles.infoIconWrapper}>
                                                <Mail size={18} />
                                            </div>
                                            <div className={styles.infoTextGroup}>
                                                <span className={styles.infoLabel}>Email</span>
                                                <div className={styles.emailRow}>
                                                    <a href={`mailto:${exhibitor.email}`} className={styles.infoLink}>
                                                        {exhibitor.email}
                                                    </a>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleCopyEmail(exhibitor.email)}
                                                        className={styles.copyBtn}
                                                        title="Copy email"
                                                    >
                                                        {copiedEmail ? <Check size={13} color="#10b981" /> : <Copy size={13} />}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Booth / Location if present */}
                                    {exhibitor.booth && (
                                        <div className={styles.infoRow}>
                                            <div className={styles.infoIconWrapper}>
                                                <MapPin size={18} />
                                            </div>
                                            <div className={styles.infoTextGroup}>
                                                <span className={styles.infoLabel}>Exhibition Booth</span>
                                                <span className={styles.infoValue}>{exhibitor.booth}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Page Title & Badges */}
                <header className={styles.header}>
                    <div className={styles.titleWrapper}>
                        <div className={styles.metaRow}>
                            <span className={styles.kicker}>
                                {event.title} // {edition.year}
                            </span>
                            {exhibitor.category && (
                                <span className={styles.categoryBadge}>{exhibitor.category}</span>
                            )}
                        </div>
                        <h1 className={styles.pageTitle}>{exhibitor.name}</h1>
                        {exhibitor.tagline && (
                            <p className={styles.tagline}>{exhibitor.tagline}</p>
                        )}
                    </div>
                </header>

                {/* Media Section: Left side 60% Video, Right side 40% Image(s) */}
                {(() => {
                    const hasVideo = Boolean(exhibitor.video && exhibitor.video.url);
                    const hasPhotos = Boolean(exhibitor.photos && exhibitor.photos.length > 0);

                    return (
                        <div className={hasVideo && hasPhotos ? styles.mediaSplitGrid : styles.mediaContainerSingle}>
                            {/* Left 60%: Showcase Video */}
                            {hasVideo && (
                                <section className={styles.videoSection}>
                                    <h2 className={styles.sectionHeading}>Showcase Video</h2>
                                    <div className={styles.videoStage} onClick={toggleVideo}>
                                        <video
                                            ref={videoRef}
                                            src={exhibitor.video.url}
                                            poster={exhibitor.video.poster}
                                            controls={isVideoPlaying}
                                            playsInline
                                            preload="metadata"
                                            className={styles.videoElement}
                                            onPlay={() => setIsVideoPlaying(true)}
                                            onPause={() => setIsVideoPlaying(false)}
                                        >
                                            Your browser does not support HTML5 video.
                                        </video>

                                        {!isVideoPlaying && (
                                            <div className={styles.videoPlayOverlay}>
                                                <div className={styles.playOrb}>
                                                    <Play size={24} className={styles.playIcon} />
                                                </div>
                                                <span className={styles.playLabel}>Play Reel</span>
                                            </div>
                                        )}
                                    </div>
                                </section>
                            )}

                            {/* Right 40%: Images Gallery */}
                            {hasPhotos && (
                                <section className={styles.photosSection}>
                                    <h2 className={styles.sectionHeading}>Exhibition Gallery</h2>
                                    {hasVideo ? (
                                        <div className={styles.photosSideStack}>
                                            {/* Primary Featured Photo */}
                                            <div
                                                className={styles.photoCardPrimary}
                                                onClick={() => setExpandedPhoto(exhibitor.photos[0])}
                                                title="Click to view full image"
                                            >
                                                <Image
                                                    src={exhibitor.photos[0]}
                                                    alt={`${exhibitor.name} Featured Photo`}
                                                    fill
                                                    sizes="(max-width: 1024px) 100vw, 40vw"
                                                    className={styles.photoImg}
                                                />
                                                <div className={styles.photoBadge}>
                                                    <span>01</span>
                                                </div>
                                            </div>

                                            {/* Sub Photos Grid if more than 1 photo */}
                                            {exhibitor.photos.length > 1 && (
                                                <div className={styles.photosSubGrid}>
                                                    {exhibitor.photos.slice(1).map((photoUrl, idx) => (
                                                        <div
                                                            key={idx + 1}
                                                            className={styles.photoCardSecondary}
                                                            onClick={() => setExpandedPhoto(photoUrl)}
                                                            title="Click to view full image"
                                                        >
                                                            <Image
                                                                src={photoUrl}
                                                                alt={`${exhibitor.name} Photo ${idx + 2}`}
                                                                fill
                                                                sizes="(max-width: 1024px) 50vw, 20vw"
                                                                className={styles.photoImg}
                                                            />
                                                            <div className={styles.photoBadge}>
                                                                <span>0{idx + 2}</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        /* Full grid when no video */
                                        <div className={styles.photosGrid}>
                                            {exhibitor.photos.map((photoUrl, idx) => (
                                                <div
                                                    key={idx}
                                                    className={styles.photoCard}
                                                    onClick={() => setExpandedPhoto(photoUrl)}
                                                    title="Click to view full image"
                                                >
                                                    <Image
                                                        src={photoUrl}
                                                        alt={`${exhibitor.name} Photo ${idx + 1}`}
                                                        fill
                                                        sizes="(max-width: 768px) 100vw, 33vw"
                                                        className={styles.photoImg}
                                                    />
                                                    <div className={styles.photoBadge}>
                                                        <span>0{idx + 1}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </section>
                            )}
                        </div>
                    );
                })()}
            </div>

            {/* Lightbox Modal */}
            {expandedPhoto && (
                <div
                    className={styles.lightboxBackdrop}
                    onClick={() => setExpandedPhoto(null)}
                >
                    <div className={styles.lightboxContent} onClick={(e) => e.stopPropagation()}>
                        <button
                            type="button"
                            className={styles.lightboxCloseBtn}
                            onClick={() => setExpandedPhoto(null)}
                            aria-label="Close image"
                        >
                            <X size={20} />
                        </button>
                        <Image
                            src={expandedPhoto}
                            alt="Full Exhibition Photo"
                            width={1280}
                            height={800}
                            className={styles.lightboxImg}
                        />
                    </div>
                </div>
            )}
        </main>
    );
}

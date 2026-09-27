import React from 'react';
import Image from 'next/image';

export default function ExhibitorLogo({ id, name, logo, className = '' }) {
    if (logo) {
        return (
            <div className={className} style={{ position: 'relative', width: '100%', height: '100%' }}>
                <Image
                    src={logo}
                    alt={`${name} Logo`}
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    style={{ objectFit: 'contain' }}
                />
            </div>
        );
    }

    // Bespoke vector logo marks for each exhibitor id
    switch (id) {
        // Stock Clearance 2025 Exhibitors
        case 'nepal-brand-clearance':
            return (
                <svg viewBox="0 0 200 80" className={className} fill="currentColor" aria-label={name}>
                    <rect x="15" y="15" width="50" height="50" rx="12" fill="#EB1F26" fillOpacity="0.12" stroke="#EB1F26" strokeWidth="2.5" />
                    <path d="M28 50L40 28L52 50M33 44H47" stroke="#EB1F26" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                    <text x="78" y="38" fontFamily="var(--font-poppins, sans-serif)" fontSize="15" fontWeight="800" fill="currentColor" letterSpacing="0.02em">NEPAL BRAND</text>
                    <text x="78" y="54" fontFamily="monospace" fontSize="9" fontWeight="700" fill="#EB1F26" letterSpacing="0.16em">CLEARANCE ALLIANCE</text>
                </svg>
            );

        case 'ktm-footwear-outlet':
            return (
                <svg viewBox="0 0 200 80" className={className} fill="currentColor" aria-label={name}>
                    <rect x="15" y="15" width="50" height="50" rx="12" fill="#054F9E" fillOpacity="0.12" stroke="#054F9E" strokeWidth="2.5" />
                    <path d="M26 44C30 44 34 38 42 34C48 31 54 36 54 44H26Z" fill="#054F9E" />
                    <path d="M24 47H56" stroke="#054F9E" strokeWidth="3" strokeLinecap="round" />
                    <text x="78" y="38" fontFamily="var(--font-poppins, sans-serif)" fontSize="15" fontWeight="800" fill="currentColor" letterSpacing="0.02em">KTM FOOTWEAR</text>
                    <text x="78" y="54" fontFamily="monospace" fontSize="9" fontWeight="700" fill="#054F9E" letterSpacing="0.14em">FACTORY OUTLET</text>
                </svg>
            );

        case 'smartliving-appliances':
            return (
                <svg viewBox="0 0 200 80" className={className} fill="currentColor" aria-label={name}>
                    <rect x="15" y="15" width="50" height="50" rx="12" fill="#0ea5e9" fillOpacity="0.12" stroke="#0ea5e9" strokeWidth="2.5" />
                    <path d="M40 25L54 37V53H26V37L40 25Z" stroke="#0ea5e9" strokeWidth="2.5" fill="none" strokeLinejoin="round" />
                    <circle cx="40" cy="42" r="3" fill="#0ea5e9" />
                    <text x="78" y="38" fontFamily="var(--font-poppins, sans-serif)" fontSize="15" fontWeight="800" fill="currentColor" letterSpacing="0.02em">SMART LIVING</text>
                    <text x="78" y="54" fontFamily="monospace" fontSize="9" fontWeight="700" fill="#0ea5e9" letterSpacing="0.14em">HOME & APPLIANCES</text>
                </svg>
            );

        case 'himalayan-furnishings':
            return (
                <svg viewBox="0 0 200 80" className={className} fill="currentColor" aria-label={name}>
                    <rect x="15" y="15" width="50" height="50" rx="12" fill="#d97706" fillOpacity="0.12" stroke="#d97706" strokeWidth="2.5" />
                    <path d="M30 48V36C30 32 34 29 40 29C46 29 50 32 50 36V48" stroke="#d97706" strokeWidth="2.5" fill="none" />
                    <path d="M26 43H54M32 48V53M48 48V53" stroke="#d97706" strokeWidth="2.5" strokeLinecap="round" />
                    <text x="78" y="38" fontFamily="var(--font-poppins, sans-serif)" fontSize="15" fontWeight="800" fill="currentColor" letterSpacing="0.02em">HIMALAYAN</text>
                    <text x="78" y="54" fontFamily="monospace" fontSize="9" fontWeight="700" fill="#d97706" letterSpacing="0.14em">FURNISHINGS STUDIO</text>
                </svg>
            );

        case 'urban-trends-apparel':
            return (
                <svg viewBox="0 0 200 80" className={className} fill="currentColor" aria-label={name}>
                    <rect x="15" y="15" width="50" height="50" rx="12" fill="#8b5cf6" fillOpacity="0.12" stroke="#8b5cf6" strokeWidth="2.5" />
                    <path d="M40 27L48 41H32L40 27ZM40 37L52 53H28L40 37Z" stroke="#8b5cf6" strokeWidth="2" fill="none" strokeLinejoin="round" />
                    <text x="78" y="38" fontFamily="var(--font-poppins, sans-serif)" fontSize="15" fontWeight="800" fill="currentColor" letterSpacing="0.02em">URBAN TRENDS</text>
                    <text x="78" y="54" fontFamily="monospace" fontSize="9" fontWeight="700" fill="#8b5cf6" letterSpacing="0.14em">APPAREL & ACTIVE</text>
                </svg>
            );

        case 'kitchenpro-cookware':
            return (
                <svg viewBox="0 0 200 80" className={className} fill="currentColor" aria-label={name}>
                    <rect x="15" y="15" width="50" height="50" rx="12" fill="#f97316" fillOpacity="0.12" stroke="#f97316" strokeWidth="2.5" />
                    <path d="M28 42C28 49 33 53 40 53C47 53 52 49 52 42H28Z" fill="#f97316" />
                    <path d="M35 34C35 30 38 27 40 27C42 27 45 30 45 34" stroke="#f97316" strokeWidth="2" strokeLinecap="round" />
                    <text x="78" y="38" fontFamily="var(--font-poppins, sans-serif)" fontSize="15" fontWeight="800" fill="currentColor" letterSpacing="0.02em">KITCHEN PRO</text>
                    <text x="78" y="54" fontFamily="monospace" fontSize="9" fontWeight="700" fill="#f97316" letterSpacing="0.14em">COOKWARE & TABLE</text>
                </svg>
            );

        case 'everest-sports-gear':
            return (
                <svg viewBox="0 0 200 80" className={className} fill="currentColor" aria-label={name}>
                    <rect x="15" y="15" width="50" height="50" rx="12" fill="#10b981" fillOpacity="0.12" stroke="#10b981" strokeWidth="2.5" />
                    <path d="M26 51L37 32L45 44L50 36L55 51H26Z" fill="#10b981" />
                    <text x="78" y="38" fontFamily="var(--font-poppins, sans-serif)" fontSize="15" fontWeight="800" fill="currentColor" letterSpacing="0.02em">EVEREST SPORTS</text>
                    <text x="78" y="54" fontFamily="monospace" fontSize="9" fontWeight="700" fill="#10b981" letterSpacing="0.14em">EQUIPMENT & GEAR</text>
                </svg>
            );

        case 'radiance-beauty-cosmetics':
            return (
                <svg viewBox="0 0 200 80" className={className} fill="currentColor" aria-label={name}>
                    <rect x="15" y="15" width="50" height="50" rx="12" fill="#ec4899" fillOpacity="0.12" stroke="#ec4899" strokeWidth="2.5" />
                    <circle cx="40" cy="40" r="12" stroke="#ec4899" strokeWidth="2.5" fill="none" />
                    <path d="M40 24V28M40 52V56M24 40H28M52 40H56" stroke="#ec4899" strokeWidth="2.5" strokeLinecap="round" />
                    <text x="78" y="38" fontFamily="var(--font-poppins, sans-serif)" fontSize="15" fontWeight="800" fill="currentColor" letterSpacing="0.02em">RADIANCE</text>
                    <text x="78" y="54" fontFamily="monospace" fontSize="9" fontWeight="700" fill="#ec4899" letterSpacing="0.14em">BEAUTY & ORGANIC</text>
                </svg>
            );

        case 'nomad-luggage-travel':
            return (
                <svg viewBox="0 0 200 80" className={className} fill="currentColor" aria-label={name}>
                    <rect x="15" y="15" width="50" height="50" rx="12" fill="#6366f1" fillOpacity="0.12" stroke="#6366f1" strokeWidth="2.5" />
                    <rect x="29" y="32" width="22" height="19" rx="3" stroke="#6366f1" strokeWidth="2.5" fill="none" />
                    <path d="M35 32V27H45V32M33 51V53M47 51V53" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" />
                    <text x="78" y="38" fontFamily="var(--font-poppins, sans-serif)" fontSize="15" fontWeight="800" fill="currentColor" letterSpacing="0.02em">NOMAD TRAVEL</text>
                    <text x="78" y="54" fontFamily="monospace" fontSize="9" fontWeight="700" fill="#6366f1" letterSpacing="0.14em">LUGGAGE & GEAR</text>
                </svg>
            );

        case 'elite-digital-gadgets':
            return (
                <svg viewBox="0 0 200 80" className={className} fill="currentColor" aria-label={name}>
                    <rect x="15" y="15" width="50" height="50" rx="12" fill="#06b6d4" fillOpacity="0.12" stroke="#06b6d4" strokeWidth="2.5" />
                    <path d="M30 40H34L37 31L43 49L46 40H50" stroke="#06b6d4" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                    <text x="78" y="38" fontFamily="var(--font-poppins, sans-serif)" fontSize="15" fontWeight="800" fill="currentColor" letterSpacing="0.02em">ELITE DIGITAL</text>
                    <text x="78" y="54" fontFamily="monospace" fontSize="9" fontWeight="700" fill="#06b6d4" letterSpacing="0.14em">AUDIO & GADGETS</text>
                </svg>
            );

        // Global Expo 2022 Exhibitors
        case 'himalayan-tech-horizons':
            return (
                <svg viewBox="0 0 200 80" className={className} fill="currentColor" aria-label={name}>
                    <rect x="15" y="15" width="50" height="50" rx="12" fill="#3b82f6" fillOpacity="0.12" stroke="#3b82f6" strokeWidth="2.5" />
                    <path d="M40 26L52 47H28L40 26Z" stroke="#3b82f6" strokeWidth="2.5" fill="none" />
                    <circle cx="40" cy="40" r="3" fill="#3b82f6" />
                    <text x="78" y="38" fontFamily="var(--font-poppins, sans-serif)" fontSize="15" fontWeight="800" fill="currentColor" letterSpacing="0.02em">HIMALAYAN TECH</text>
                    <text x="78" y="54" fontFamily="monospace" fontSize="9" fontWeight="700" fill="#3b82f6" letterSpacing="0.14em">HORIZONS</text>
                </svg>
            );

        case 'nepal-herbal-essences':
            return (
                <svg viewBox="0 0 200 80" className={className} fill="currentColor" aria-label={name}>
                    <rect x="15" y="15" width="50" height="50" rx="12" fill="#16a34a" fillOpacity="0.12" stroke="#16a34a" strokeWidth="2.5" />
                    <path d="M40 26C32 26 28 34 28 42C34 42 42 38 42 30V26Z" fill="#16a34a" />
                    <path d="M40 26C48 26 52 34 52 42C46 42 38 38 38 30V26Z" fill="#16a34a" opacity="0.75" />
                    <text x="78" y="38" fontFamily="var(--font-poppins, sans-serif)" fontSize="15" fontWeight="800" fill="currentColor" letterSpacing="0.02em">NEPAL HERBAL</text>
                    <text x="78" y="54" fontFamily="monospace" fontSize="9" fontWeight="700" fill="#16a34a" letterSpacing="0.14em">ORGANIC ESSENCES</text>
                </svg>
            );

        case 'mount-everest-adventure':
            return (
                <svg viewBox="0 0 200 80" className={className} fill="currentColor" aria-label={name}>
                    <rect x="15" y="15" width="50" height="50" rx="12" fill="#dc2626" fillOpacity="0.12" stroke="#dc2626" strokeWidth="2.5" />
                    <path d="M26 51L38 29L47 43L50 38L55 51H26Z" fill="#dc2626" />
                    <text x="78" y="38" fontFamily="var(--font-poppins, sans-serif)" fontSize="15" fontWeight="800" fill="currentColor" letterSpacing="0.02em">MT. EVEREST</text>
                    <text x="78" y="54" fontFamily="monospace" fontSize="9" fontWeight="700" fill="#dc2626" letterSpacing="0.14em">ADVENTURE GEAR</text>
                </svg>
            );

        case 'lumbini-artisan-crafts':
            return (
                <svg viewBox="0 0 200 80" className={className} fill="currentColor" aria-label={name}>
                    <rect x="15" y="15" width="50" height="50" rx="12" fill="#eab308" fillOpacity="0.12" stroke="#eab308" strokeWidth="2.5" />
                    <circle cx="40" cy="40" r="13" stroke="#eab308" strokeWidth="2" fill="none" strokeDasharray="3 3" />
                    <circle cx="40" cy="40" r="5" fill="#eab308" />
                    <text x="78" y="38" fontFamily="var(--font-poppins, sans-serif)" fontSize="15" fontWeight="800" fill="currentColor" letterSpacing="0.02em">LUMBINI CRAFT</text>
                    <text x="78" y="54" fontFamily="monospace" fontSize="9" fontWeight="700" fill="#eab308" letterSpacing="0.14em">ARTISAN COLLECTIVE</text>
                </svg>
            );

        case 'ktm-coffee-roasters':
            return (
                <svg viewBox="0 0 200 80" className={className} fill="currentColor" aria-label={name}>
                    <rect x="15" y="15" width="50" height="50" rx="12" fill="#78350f" fillOpacity="0.12" stroke="#78350f" strokeWidth="2.5" />
                    <path d="M28 35H48V46C48 50 44 53 38 53C32 53 28 50 28 46V35Z" stroke="#78350f" strokeWidth="2.5" fill="none" />
                    <path d="M48 38H52C54 38 55 39 55 41C55 43 54 44 52 44H48" stroke="#78350f" strokeWidth="2" />
                    <text x="78" y="38" fontFamily="var(--font-poppins, sans-serif)" fontSize="15" fontWeight="800" fill="currentColor" letterSpacing="0.02em">KTM COFFEE</text>
                    <text x="78" y="54" fontFamily="monospace" fontSize="9" fontWeight="700" fill="#78350f" letterSpacing="0.14em">VALLEY ROASTERS</text>
                </svg>
            );

        case 'annapurna-green-energy':
            return (
                <svg viewBox="0 0 200 80" className={className} fill="currentColor" aria-label={name}>
                    <rect x="15" y="15" width="50" height="50" rx="12" fill="#059669" fillOpacity="0.12" stroke="#059669" strokeWidth="2.5" />
                    <circle cx="40" cy="40" r="12" stroke="#059669" strokeWidth="2" fill="none" />
                    <path d="M40 28V52M28 40H52" stroke="#059669" strokeWidth="2" strokeLinecap="round" />
                    <text x="78" y="38" fontFamily="var(--font-poppins, sans-serif)" fontSize="15" fontWeight="800" fill="currentColor" letterSpacing="0.02em">ANNAPURNA</text>
                    <text x="78" y="54" fontFamily="monospace" fontSize="9" fontWeight="700" fill="#059669" letterSpacing="0.14em">GREEN ENERGY</text>
                </svg>
            );

        case 'gorkha-traditional-textiles':
            return (
                <svg viewBox="0 0 200 80" className={className} fill="currentColor" aria-label={name}>
                    <rect x="15" y="15" width="50" height="50" rx="12" fill="#be123c" fillOpacity="0.12" stroke="#be123c" strokeWidth="2.5" />
                    <path d="M30 30L50 50M50 30L30 50" stroke="#be123c" strokeWidth="2.5" strokeLinecap="round" />
                    <text x="78" y="38" fontFamily="var(--font-poppins, sans-serif)" fontSize="15" fontWeight="800" fill="currentColor" letterSpacing="0.02em">GORKHA TEXTILES</text>
                    <text x="78" y="54" fontFamily="monospace" fontSize="9" fontWeight="700" fill="#be123c" letterSpacing="0.14em">TRADITIONAL WEAVE</text>
                </svg>
            );

        case 'pashupati-heritage-ceramics':
            return (
                <svg viewBox="0 0 200 80" className={className} fill="currentColor" aria-label={name}>
                    <rect x="15" y="15" width="50" height="50" rx="12" fill="#ca8a04" fillOpacity="0.12" stroke="#ca8a04" strokeWidth="2.5" />
                    <path d="M32 30H48L44 48H36L32 30Z" stroke="#ca8a04" strokeWidth="2.5" fill="none" strokeLinejoin="round" />
                    <text x="78" y="38" fontFamily="var(--font-poppins, sans-serif)" fontSize="15" fontWeight="800" fill="currentColor" letterSpacing="0.02em">PASHUPATI</text>
                    <text x="78" y="54" fontFamily="monospace" fontSize="9" fontWeight="700" fill="#ca8a04" letterSpacing="0.14em">HERITAGE CERAMICS</text>
                </svg>
            );

        case 'terai-agro-tech':
            return (
                <svg viewBox="0 0 200 80" className={className} fill="currentColor" aria-label={name}>
                    <rect x="15" y="15" width="50" height="50" rx="12" fill="#65a30d" fillOpacity="0.12" stroke="#65a30d" strokeWidth="2.5" />
                    <path d="M40 52V28M40 38C34 38 31 34 31 30M40 44C46 44 49 40 49 36" stroke="#65a30d" strokeWidth="2.5" strokeLinecap="round" />
                    <text x="78" y="38" fontFamily="var(--font-poppins, sans-serif)" fontSize="15" fontWeight="800" fill="currentColor" letterSpacing="0.02em">TERAI AGRO</text>
                    <text x="78" y="54" fontFamily="monospace" fontSize="9" fontWeight="700" fill="#65a30d" letterSpacing="0.14em">TECH SOLUTIONS</text>
                </svg>
            );

        case 'pokhara-acoustic-instruments':
            return (
                <svg viewBox="0 0 200 80" className={className} fill="currentColor" aria-label={name}>
                    <rect x="15" y="15" width="50" height="50" rx="12" fill="#4f46e5" fillOpacity="0.12" stroke="#4f46e5" strokeWidth="2.5" />
                    <circle cx="37" cy="43" r="7" stroke="#4f46e5" strokeWidth="2.5" fill="none" />
                    <path d="M44 43V27L53 30V43" stroke="#4f46e5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <text x="78" y="38" fontFamily="var(--font-poppins, sans-serif)" fontSize="15" fontWeight="800" fill="currentColor" letterSpacing="0.02em">POKHARA SOUND</text>
                    <text x="78" y="54" fontFamily="monospace" fontSize="9" fontWeight="700" fill="#4f46e5" letterSpacing="0.14em">ACOUSTIC GUILDS</text>
                </svg>
            );

        // Default Elegant Monogram Logo
        default: {
            const initials = name
                .split(' ')
                .map((w) => w[0])
                .filter(Boolean)
                .slice(0, 2)
                .join('')
                .toUpperCase() || 'EX';

            return (
                <svg viewBox="0 0 200 80" className={className} fill="currentColor" aria-label={name}>
                    <rect x="15" y="15" width="50" height="50" rx="12" fill="#EB1F26" fillOpacity="0.1" stroke="#EB1F26" strokeWidth="2" />
                    <text x="40" y="47" fontFamily="var(--font-poppins, sans-serif)" fontSize="19" fontWeight="800" fill="#EB1F26" textAnchor="middle">{initials}</text>
                    <text x="78" y="42" fontFamily="var(--font-poppins, sans-serif)" fontSize="14" fontWeight="800" fill="currentColor" letterSpacing="0.02em">{name.slice(0, 16).toUpperCase()}</text>
                    <text x="78" y="55" fontFamily="monospace" fontSize="8.5" fontWeight="700" fill="#64748b" letterSpacing="0.12em">EXHIBITOR CORP</text>
                </svg>
            );
        }
    }
}

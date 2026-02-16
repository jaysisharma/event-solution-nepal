/**
 * Attempts to parse a sortable date from a flexible string.
 * Handles "Jan 15, 2026" or ranges like "Jan 15 - Jan 19, 2026".
 * Returns a Date object or null.
 */
export function parseSortDate(dateStr) {
    if (!dateStr) return null;

    // Check if it's already a clean ISO date (YYYY-MM-DD)
    if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const d = new Date(dateStr);
        return isNaN(d.getTime()) ? null : d;
    }

    // Remove "From " or "from " if present at start
    let cleaned = dateStr.replace(/^(from|From)\s+/, '');

    // Try to take the first part of a range (split by " - " or " to ")
    // We use spaces around the hyphen to avoid breaking ISO dates
    const firstPart = cleaned.split(/\s+[-–]\s+|(?:\s+to\s+)/i)[0].trim();

    // If firstPart is just "Jan 15" and there's a year later in the string, append the year
    const yearMatch = cleaned.match(/\d{4}/);
    let dateToParse = firstPart;
    if (!firstPart.match(/\d{4}/) && yearMatch) {
        dateToParse = `${firstPart}, ${yearMatch[0]}`;
    }

    const parsed = new Date(dateToParse);
    return isNaN(parsed.getTime()) ? null : parsed;
}

/**
 * Checks if an event is completed based on month, date string, and year.
 */
export function isEventCompleted(month, dateStr, year) {
    if (!month || !dateStr || !year) return false;

    // dateStr might be "15" or "15 - 19"
    const firstDate = dateStr.split(/\s*[-–]\s*|(?:\s+to\s+)/i)[0].trim();
    const eventDate = new Date(`${month} ${firstDate}, ${year}`);

    if (isNaN(eventDate.getTime())) return false;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return eventDate < today;
}

/**
 * Formats a date string for display (e.g., "Mar 13, 2026").
 * Returns the original string if it's a range or custom text.
 */
export function formatDisplayDate(dateStr) {
    if (!dateStr) return '';

    const lowerStr = dateStr.toLowerCase();
    // Range patterns or custom text that should be displayed exactly as entered
    const isRange = lowerStr.includes(' - ') ||
        lowerStr.includes(' to ') ||
        lowerStr.startsWith('from ') ||
        (dateStr.split(/\s*[-–]\s*|(?:\s+to\s+)/i).length > 1 && !dateStr.match(/^\d{4}-\d{2}-\d{2}/));

    const date = new Date(dateStr);
    // If it's a valid date and not a range, format it nicely
    if (!isNaN(date.getTime()) && !isRange) {
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    }

    return dateStr; // Return as is for ranges or custom text
}

/**
 * Determines the effective status for sorting logic.
 */
export function getHeroEffectiveStatus(slide, now = new Date()) {
    // Priority: Try parsing the display string first to catch manual overrides
    const parsed = parseSortDate(slide.eventDate);
    if (parsed) return parsed < now ? 'COMPLETED' : 'UPCOMING';

    // Fallback to sortDate if exists
    if (slide.sortDate) {
        const sDate = new Date(slide.sortDate);
        return sDate < now ? 'COMPLETED' : 'UPCOMING';
    }

    return slide.status || 'UPCOMING';
}

/**
 * Geberates a stable sort date for hero slides.
 */
export function getHeroSortableDate(slide) {
    // Priority: Display string
    const parsed = parseSortDate(slide.eventDate);
    if (parsed) return parsed;

    // Fallback: DB field
    if (slide.sortDate) return new Date(slide.sortDate);

    return slide.status === 'COMPLETED' ? new Date(0) : new Date(2100, 0, 1);
}

/**
 * Complex sorting logic for hero slides to ensure stability and priority.
 */
export function sortHeroSlides(slides, now = new Date()) {
    return [...slides].sort((a, b) => {
        const statusA = getHeroEffectiveStatus(a, now);
        const statusB = getHeroEffectiveStatus(b, now);

        // 1. Status priority (UPCOMING before COMPLETED)
        if (statusA === 'UPCOMING' && statusB === 'COMPLETED') return -1;
        if (statusA === 'COMPLETED' && statusB === 'UPCOMING') return 1;

        // 2. Featured priority (within the status group)
        if (a.isFeatured && !b.isFeatured) return -1;
        if (!a.isFeatured && b.isFeatured) return 1;

        // 3. Date priority
        const dateA = getHeroSortableDate(a);
        const dateB = getHeroSortableDate(b);

        if (statusA === 'UPCOMING') {
            const diff = dateA.getTime() - dateB.getTime();
            if (diff !== 0) return diff;
        } else {
            const diff = dateB.getTime() - dateA.getTime();
            if (diff !== 0) return diff;
        }

        // 4. Final stable fallback (ID or index)
        return (a.id || 0) - (b.id || 0);
    });
}

export function isEventCompleted(monthStr, dateStr, yearStr) {
    const currentYear = new Date().getFullYear();
    const monthMap = {
        "JAN": 0, "FEB": 1, "MAR": 2, "APR": 3, "MAY": 4, "JUN": 5,
        "JUL": 6, "AUG": 7, "SEP": 8, "OCT": 9, "NOV": 10, "DEC": 11,
        "JANUARY": 0, "FEBRUARY": 1, "MARCH": 2, "APRIL": 3, "MAY": 4, "JUNE": 5,
        "JULY": 6, "AUGUST": 7, "SEPTEMBER": 8, "OCTOBER": 9, "NOVEMBER": 10, "DECEMBER": 11
    };

    if (!monthStr || !dateStr) return false;

    const m = monthStr.toUpperCase().trim().substring(0, 3);
    const d = parseInt(dateStr);
    const y = yearStr ? parseInt(yearStr) : currentYear;

    // Safety check
    if (monthMap[m] === undefined || isNaN(d)) return false;

    const eventDate = new Date(y, monthMap[m], d);
    // Set event to end of that day (23:59:59)
    eventDate.setHours(23, 59, 59, 999);

    // If current time > event end time, it is completed
    return new Date() > eventDate;
}

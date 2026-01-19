export const ITALIAN_TIMEZONE = 'Europe/Rome';

/**
 * Returns the current date in Italy in YYYY-MM-DD format.
 * Safe to use for initializing date pickers and default values.
 */
export function getTodayItaly(): string {
    return new Date().toLocaleDateString('en-CA', {
        timeZone: ITALIAN_TIMEZONE,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
}

/**
 * Returns the current ISO string but adjusted to Italian time perspective regarding "Today".
 * Useful for timestamps where visual consistency matters more than strict UTC.
 * However, for DB 'timestamptz', standard .toISOString() (UTC) is usually best.
 */
export function getNowItaly(): Date {
    // Create a date object that conceptually represents current time in Italy
    // Note: Manipulating date objects to "fake" timezones is tricky. 
    // Usually best to stick to strings for display-logic keying.
    const now = new Date();
    const invDate = new Date(now.toLocaleString('en-US', {
        timeZone: ITALIAN_TIMEZONE
    }));
    return invDate;
}

/**
 * Formats a given date string or object to Italian local date string
 */
export function formatItalianDate(date: string | Date): string {
    const d = new Date(date);
    return d.toLocaleDateString('it-IT', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        timeZone: ITALIAN_TIMEZONE
    });
}

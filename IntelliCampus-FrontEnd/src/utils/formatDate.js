export function formatHireDate(value) {
    if (!value) return null;

    const str = String(value).trim();
    if (!str) return null;
    if (str.includes('/')) return str;

    // ISO / date strings (e.g. "2026-07-05" or "2026-07-05T00:00:00")
    if (str.includes('-') || str.includes('T')) {
        const d = new Date(str);
        if (!isNaN(d.getTime())) {
            return d.toLocaleDateString('en-GB', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
            });
        }
    }

    // Pre-formatted strings like "05 07 2026"
    return str.replace(/\s+/g, '/');
}

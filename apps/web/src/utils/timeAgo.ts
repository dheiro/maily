export function formatEmailDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  
  // Ensure the date is valid
  if (isNaN(date.getTime())) return '';

  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.round(diffMs / 1000);
  const diffMin = Math.round(diffSec / 60);

  // Future dates fallback to time only (just in case clock drifts)
  if (diffSec < 0) {
    return date.toLocaleTimeString('en', { hour: 'numeric', minute: '2-digit', hour12: true });
  }

  // < 60 seconds ago
  if (diffSec < 60) {
    return new Intl.RelativeTimeFormat('en', { numeric: 'auto' }).format(-diffSec, 'second');
  }

  // < 60 minutes ago
  if (diffMin < 60) {
    return new Intl.RelativeTimeFormat('en', { numeric: 'auto' }).format(-diffMin, 'minute');
  }

  // Same calendar day → show time
  if (date.getDate() === now.getDate()
    && date.getMonth() === now.getMonth()
    && date.getFullYear() === now.getFullYear()) {
    return date.toLocaleTimeString('en', { hour: 'numeric', minute: '2-digit', hour12: true });
  }

  // Same year → "Jul 13" (Gmail style is usually Mon DD)
  if (date.getFullYear() === now.getFullYear()) {
    return date.toLocaleDateString('en', { day: 'numeric', month: 'short' });
  }

  // Previous years → "13/7/25" (non-padded d/m/yy)
  const d = date.getDate();
  const m = date.getMonth() + 1;
  const yy = String(date.getFullYear()).slice(-2);
  return `${d}/${m}/${yy}`;
}

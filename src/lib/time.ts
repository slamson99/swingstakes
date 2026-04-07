export function formatAEST(date: Date | string | number): string {
  const d = new Date(date);
  
  return new Intl.DateTimeFormat('en-AU', {
    timeZone: 'Australia/Sydney',
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(d) + ' AEST';
}

export function formatAESTShort(date: Date | string | number): string {
  const d = new Date(date);
  return new Intl.DateTimeFormat('en-AU', {
    timeZone: 'Australia/Sydney',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(d) + ' AEST';
}

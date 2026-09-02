export function formatClubDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const date = new Date(`${value}T12:00:00Z`);
  return new Intl.DateTimeFormat('en-IE', { timeZone: 'Europe/Dublin', weekday: 'short', day: 'numeric', month: 'short' }).format(date).replace(',', '');
}

export function formatClubTime(value: string, timeTbc = false) {
  if (timeTbc) return 'TBC';
  const match = /^(\d{2}):(\d{2})$/.exec(value);
  if (!match) return value;
  const hour = Number(match[1]);
  const displayHour = hour % 12 || 12;
  return `${displayHour}.${match[2]} ${hour >= 12 ? 'pm' : 'am'}`;
}

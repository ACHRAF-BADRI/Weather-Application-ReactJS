const locale = (lang) => (lang === 'fr' ? 'fr-FR' : 'en-GB');

// WeatherAPI gives local dates as "YYYY-MM-DD"; noon avoids timezone day shifts.
export function formatDay(isoDate, lang, options = { weekday: 'short', day: 'numeric', month: 'short' }) {
  return new Intl.DateTimeFormat(locale(lang), options).format(new Date(`${isoDate}T12:00:00`));
}

// "YYYY-MM-DD HH:mm" local time string -> "14:00"
export function formatHour(localTime) {
  return localTime.slice(11, 16);
}

export const round = (n) => Math.round(n);

export const iconUrl = (icon) => (icon?.startsWith('//') ? `https:${icon}` : icon);

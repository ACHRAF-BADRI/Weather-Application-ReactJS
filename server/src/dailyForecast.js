// 7-day daily forecast. WeatherAPI's free plan stops at 3 days, so days 4-7 come from
// Open-Meteo (https://open-meteo.com: free, no API key, CC BY 4.0 attribution).
// Days 1-3 keep WeatherAPI's data so they match the city cards and the hourly strip.
import { TtlCache } from './cache.js';

export const FORECAST_DAYS = 7;
const cache = new TtlCache(200);

// WMO weather code → [WeatherAPI icon code (to reuse the same icon set), English, French]
const WMO = {
  0: [113, 'Clear', 'Ensoleillé'],
  1: [116, 'Mostly clear', 'Plutôt dégagé'],
  2: [116, 'Partly cloudy', 'Partiellement nuageux'],
  3: [122, 'Overcast', 'Couvert'],
  45: [248, 'Fog', 'Brouillard'],
  48: [260, 'Freezing fog', 'Brouillard givrant'],
  51: [266, 'Light drizzle', 'Bruine légère'],
  53: [266, 'Drizzle', 'Bruine'],
  55: [266, 'Heavy drizzle', 'Forte bruine'],
  56: [281, 'Freezing drizzle', 'Bruine verglaçante'],
  57: [284, 'Heavy freezing drizzle', 'Forte bruine verglaçante'],
  61: [296, 'Light rain', 'Pluie légère'],
  63: [302, 'Rain', 'Pluie'],
  65: [308, 'Heavy rain', 'Forte pluie'],
  66: [311, 'Freezing rain', 'Pluie verglaçante'],
  67: [314, 'Heavy freezing rain', 'Forte pluie verglaçante'],
  71: [326, 'Light snow', 'Neige légère'],
  73: [332, 'Snow', 'Neige'],
  75: [338, 'Heavy snow', 'Fortes chutes de neige'],
  77: [350, 'Snow grains', 'Grésil'],
  80: [353, 'Light showers', 'Averses légères'],
  81: [356, 'Showers', 'Averses'],
  82: [359, 'Violent showers', 'Fortes averses'],
  85: [368, 'Snow showers', 'Averses de neige'],
  86: [371, 'Heavy snow showers', 'Fortes averses de neige'],
  95: [389, 'Thunderstorm', 'Orage'],
  96: [389, 'Thunderstorm with hail', 'Orage avec grêle'],
  99: [389, 'Severe thunderstorm with hail', 'Violent orage avec grêle'],
};

function condition(code, lang) {
  const [icon, en, fr] = WMO[code] ?? WMO[3];
  return { text: lang === 'fr' ? fr : en, icon: `//cdn.weatherapi.com/weather/64x64/day/${icon}.png` };
}

async function openMeteoDays(lat, lon) {
  const key = `${lat},${lon}`;
  const cached = cache.get(key);
  if (cached) return cached;

  const url = new URL('https://api.open-meteo.com/v1/forecast');
  url.search = new URLSearchParams({
    latitude: lat,
    longitude: lon,
    daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max',
    forecast_days: String(FORECAST_DAYS),
    timezone: 'auto',
  }).toString();

  const response = await fetch(url, { signal: AbortSignal.timeout(8000) });
  if (!response.ok) throw new Error(`Open-Meteo ${response.status}`);
  const { daily } = await response.json();
  const days = daily.time.map((date, i) => ({
    date,
    code: daily.weather_code[i],
    max: daily.temperature_2m_max[i],
    min: daily.temperature_2m_min[i],
    precip: daily.precipitation_sum[i] ?? 0,
    chanceOfRain: daily.precipitation_probability_max[i] ?? 0,
  }));
  cache.set(key, days, 60 * 60 * 1000);
  return days;
}

/**
 * Merge WeatherAPI's forecast (first days) with Open-Meteo (remaining days).
 * If Open-Meteo is unavailable, returns WeatherAPI's days only.
 * @returns {Promise<Array<{date,max,min,precip,chanceOfRain,condition:{text,icon},source}>>}
 */
export async function buildDailyForecast(weatherData, lang) {
  const days = weatherData.forecast.forecastday.map(({ date, day }) => ({
    date,
    max: day.maxtemp_c,
    min: day.mintemp_c,
    precip: day.totalprecip_mm,
    chanceOfRain: day.daily_chance_of_rain,
    condition: { text: day.condition.text, icon: day.condition.icon },
    source: 'weatherapi',
  }));

  try {
    const { lat, lon } = weatherData.location;
    const known = new Set(days.map((d) => d.date));
    const extra = (await openMeteoDays(lat, lon))
      .filter((d) => d.date > days[days.length - 1].date && !known.has(d.date))
      .map(({ code, ...d }) => ({ ...d, condition: condition(code, lang), source: 'open-meteo' }));
    days.push(...extra);
  } catch (error) {
    console.warn('[open-meteo] extended forecast unavailable:', error.message);
  }
  return days.slice(0, FORECAST_DAYS);
}

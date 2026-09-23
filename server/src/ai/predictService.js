import { weatherApi } from '../weatherApi.js';
import { TtlCache } from '../cache.js';
import { predict } from './forecastModel.js';
import { buildInsight } from './insights.js';

const HISTORY_DAYS = 7;
const HOUR = 60 * 60 * 1000;
const cache = new TtlCache(200);

const toDay = (fd, source) => ({
  date: fd.date,
  max: fd.day.maxtemp_c,
  min: fd.day.mintemp_c,
  precip: fd.day.totalprecip_mm,
  chanceOfRain: source === 'forecast' ? fd.day.daily_chance_of_rain : undefined,
  source,
});

function isoDaysAgo(localDate, n) {
  const date = new Date(`${localDate}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() - n);
  return date.toISOString().slice(0, 10);
}

export async function getPrediction(q, lang) {
  const cacheKey = `${q.toLowerCase()}|${lang}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const forecastData = await weatherApi('forecast', { q, days: 3, lang });
  const { location, current } = forecastData;
  const today = location.localtime.slice(0, 10);

  // Past days are immutable, so cache them for a long time. Some WeatherAPI plans
  // limit history; the model still works with whatever days succeed.
  const history = await Promise.allSettled(
    Array.from({ length: HISTORY_DAYS }, (_, i) =>
      weatherApi('history', { q: `${location.lat},${location.lon}`, dt: isoDaysAgo(today, HISTORY_DAYS - i) }, 12 * HOUR),
    ),
  );
  const observed = history
    .filter((r) => r.status === 'fulfilled' && r.value.forecast?.forecastday?.[0])
    .map((r) => toDay(r.value.forecast.forecastday[0], 'history'));
  const forecast = forecastData.forecast.forecastday.map((fd) => toDay(fd, 'forecast'));

  const prediction = predict([...observed, ...forecast], 4);
  const currentSummary = {
    tempC: current.temp_c,
    feelsLikeC: current.feelslike_c,
    condition: current.condition.text,
    humidity: current.humidity,
    windKph: current.wind_kph,
    uv: current.uv,
  };

  const insight = await buildInsight(
    { city: `${location.name}, ${location.country}`, current: currentSummary, observed, forecast, prediction },
    lang,
  );

  const result = {
    location: { name: location.name, country: location.country },
    generatedAt: new Date().toISOString(),
    observed,
    forecast,
    ...prediction,
    insight,
  };
  cache.set(cacheKey, result, HOUR);
  return result;
}

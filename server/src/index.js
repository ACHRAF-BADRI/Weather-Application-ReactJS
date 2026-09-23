import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import { config } from './config.js';
import { weatherApi, HttpError } from './weatherApi.js';
import { getPrediction } from './ai/predictService.js';
import { aiEnabled } from './ai/insights.js';
import { contactEnabled, validateContact, sendContactEmail } from './contact.js';
import { buildDailyForecast } from './dailyForecast.js';

const app = express();
app.set('trust proxy', 1); // Render runs behind a proxy; needed for per-IP rate limiting
app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => callback(null, !origin || config.allowedOrigins.includes(origin)),
    methods: ['GET', 'POST'],
  }),
);

const limiter = (limit) => rateLimit({ windowMs: 15 * 60 * 1000, limit, standardHeaders: 'draft-7', legacyHeaders: false });
app.use('/api/', limiter(300));

function readQuery(req) {
  const q = typeof req.query.q === 'string' ? req.query.q.trim() : '';
  if (!q || q.length > 100) throw new HttpError(400, 'Query parameter "q" is required (max 100 chars)');
  const lang = req.query.lang === 'fr' ? 'fr' : 'en';
  return { q, lang };
}

app.get('/api/health', (req, res) => {
  res.json({ ok: true, ai: aiEnabled, contact: contactEnabled });
});

// Current conditions + hourly data (WeatherAPI) + `daily`: a 7-day forecast.
app.get('/api/weather', async (req, res) => {
  const { q, lang } = readQuery(req);
  const data = await weatherApi('forecast', { q, days: 3, lang, aqi: 'no', alerts: 'no' });
  res.json({ ...data, daily: await buildDailyForecast(data, lang) });
});

app.get('/api/search', async (req, res) => {
  const { q } = readQuery(req);
  const results = q.length < 2 ? [] : await weatherApi('search', { q }, 24 * 60 * 60 * 1000);
  res.json(results.map(({ id, name, region, country, lat, lon }) => ({ id, name, region, country, lat, lon })));
});

// AI calls cost more, so they get a tighter limit.
app.get('/api/predict', limiter(40), async (req, res) => {
  const { q, lang } = readQuery(req);
  res.json(await getPrediction(q, lang));
});

// Contact form → email to the site owner. Strict limit to discourage spam.
app.post('/api/contact', limiter(5), express.json({ limit: '20kb' }), async (req, res) => {
  const { data, errors } = validateContact(req.body);
  if (errors.length) return res.status(400).json({ error: 'Invalid fields', fields: errors });
  if (!data.isBot) await sendContactEmail(data); // bots get a fake success
  res.json({ ok: true });
});

app.use((req, res) => res.status(404).json({ error: 'Not found' }));

// Express 5 forwards rejected promises from async handlers here.
app.use((err, req, res, next) => {
  // HttpError carries its own status; body-parser errors (bad JSON, too large) come with a 4xx status.
  const clientError = !(err instanceof HttpError) && err.status >= 400 && err.status < 500;
  const status = err instanceof HttpError || clientError ? err.status : 500;
  if (status >= 500) console.error(err);
  const message = err instanceof HttpError ? err.message : clientError ? 'Invalid request body' : 'Internal server error';
  res.status(status).json({ error: message });
});

app.listen(config.port, () => {
  console.log(`Weather API listening on port ${config.port} (AI insights: ${aiEnabled ? 'Claude' : 'rule-based'})`);
  console.log(`Allowed origins: ${config.allowedOrigins.join(', ')}`);
  console.log(`Contact form emails: ${contactEnabled ? `enabled → ${config.contact.toEmail}` : 'disabled (set RESEND_API_KEY and CONTACT_TO_EMAIL)'}`);
});

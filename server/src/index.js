import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import { config } from './config.js';
import { weatherApi, HttpError } from './weatherApi.js';
import { getPrediction } from './ai/predictService.js';
import { aiEnabled } from './ai/insights.js';

const app = express();
app.set('trust proxy', 1); // Render runs behind a proxy; needed for per-IP rate limiting
app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => callback(null, !origin || config.allowedOrigins.includes(origin)),
    methods: ['GET'],
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
  res.json({ ok: true, ai: aiEnabled });
});

// Current conditions + 3-day forecast (with hourly data) in one call.
app.get('/api/weather', async (req, res) => {
  const { q, lang } = readQuery(req);
  res.json(await weatherApi('forecast', { q, days: 3, lang, aqi: 'no', alerts: 'no' }));
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

app.use((req, res) => res.status(404).json({ error: 'Not found' }));

// Express 5 forwards rejected promises from async handlers here.
app.use((err, req, res, next) => {
  const status = err instanceof HttpError ? err.status : 500;
  if (status >= 500) console.error(err);
  res.status(status).json({ error: status >= 500 && !(err instanceof HttpError) ? 'Internal server error' : err.message });
});

app.listen(config.port, () => {
  console.log(`Weather API listening on port ${config.port} (AI insights: ${aiEnabled ? 'Claude' : 'rule-based'})`);
  console.log(`Allowed origins: ${config.allowedOrigins.join(', ')}`);
});

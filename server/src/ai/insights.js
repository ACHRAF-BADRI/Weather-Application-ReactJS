// Turns the numbers into a short, human summary + practical tips.
// Uses Groq (fast open-weight model hosting) when GROQ_API_KEY is set;
// otherwise (or on any failure) falls back to deterministic rule-based text
// so the feature always works.
import { config } from '../config.js';

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';

export const aiEnabled = Boolean(config.groqApiKey);

const SYSTEM_PROMPT = `You write the "AI insight" panel of a consumer weather app.
You receive JSON with a city's current conditions, the 7-day forecast, and a
statistical model's temperature/rain predictions for the following days (with confidence).
Write for a general audience in the requested language ("en" = English, "fr" = French).
Respond with only a JSON object shaped exactly like {"summary": string, "tips": string[]}.
- summary: 2-3 sentences describing what the coming week looks like and how sure we are.
  Mention that later days are model estimates when their confidence is low.
- tips: 2 to 4 short, practical suggestions (clothing, outdoor plans, hydration, umbrella...),
  each under 90 characters, grounded only in the data provided.
Use °C. Do not invent data that is not in the input.`;

class GroqError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

async function groqInsight(payload, lang) {
  const response = await fetch(GROQ_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${config.groqApiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: config.aiModel,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: JSON.stringify({ language: lang, ...payload }) },
      ],
    }),
    signal: AbortSignal.timeout(15000),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new GroqError(response.status, `Groq ${response.status}: ${body.slice(0, 200)}`);
  }

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content;
  if (!text) throw new Error('No content in Groq response');

  const parsed = JSON.parse(text);
  return { source: 'groq', summary: parsed.summary, tips: parsed.tips.slice(0, 4) };
}

const TEXT = {
  en: {
    warming: 'Temperatures are trending up over the coming days.',
    cooling: 'Temperatures are trending down over the coming days.',
    stable: 'Temperatures should stay fairly stable over the coming days.',
    range: (min, max) => `Expect roughly ${min}°C to ${max}°C.`,
    lowConfidence: 'Later days are model estimates, so treat them as a rough guide.',
    umbrella: 'Rain is likely on some days: keep an umbrella handy.',
    hot: 'Hot days ahead: stay hydrated and avoid the midday sun.',
    cold: 'Chilly temperatures: a warm jacket will help.',
    mild: 'Mild weather: light layers should be comfortable.',
    windy: 'It is windy right now: secure loose items outdoors.',
    uv: 'High UV today: sunscreen and sunglasses recommended.',
  },
  fr: {
    warming: 'Les températures sont orientées à la hausse dans les prochains jours.',
    cooling: 'Les températures sont orientées à la baisse dans les prochains jours.',
    stable: 'Les températures devraient rester assez stables dans les prochains jours.',
    range: (min, max) => `Comptez environ ${min}°C à ${max}°C.`,
    lowConfidence: 'Les derniers jours sont des estimations du modèle : à prendre comme une tendance.',
    umbrella: 'De la pluie est probable certains jours : gardez un parapluie à portée de main.',
    hot: 'Journées chaudes à venir : hydratez-vous et évitez le soleil de midi.',
    cold: 'Températures fraîches : une veste chaude sera utile.',
    mild: 'Temps doux : des couches légères devraient suffire.',
    windy: 'Le vent souffle fort en ce moment : attachez les objets à l’extérieur.',
    uv: 'UV élevés aujourd’hui : crème solaire et lunettes recommandées.',
  },
};

export function ruleInsight({ current, forecast, prediction }, lang) {
  const t = TEXT[lang] || TEXT.en;
  const all = [...forecast, ...prediction.predicted];
  const min = Math.round(Math.min(...all.map((d) => d.min)));
  const max = Math.round(Math.max(...all.map((d) => d.max)));

  const summary = [t[prediction.trend], t.range(min, max)];
  if (prediction.predicted.some((d) => d.confidence < 60)) summary.push(t.lowConfidence);

  const tips = [];
  const rainy = forecast.some((d) => d.chanceOfRain >= 50) || prediction.predicted.some((d) => d.rainChance >= 50);
  if (rainy) tips.push(t.umbrella);
  tips.push(max >= 28 ? t.hot : max <= 10 ? t.cold : t.mild);
  if (current.windKph >= 30) tips.push(t.windy);
  if (current.uv >= 6) tips.push(t.uv);

  return { source: 'rules', summary: summary.join(' '), tips };
}

export async function buildInsight(payload, lang) {
  if (config.groqApiKey) {
    try {
      return await groqInsight(payload, lang);
    } catch (error) {
      if (error instanceof GroqError && error.status === 401) console.error('[ai] invalid GROQ_API_KEY');
      else if (error instanceof GroqError && error.status === 429) console.warn('[ai] rate limited, using rules');
      else if (error instanceof GroqError) console.error(`[ai] Groq API error ${error.status}: ${error.message}`);
      else console.error('[ai] insight failed:', error.message);
    }
  }
  return ruleInsight(payload, lang);
}

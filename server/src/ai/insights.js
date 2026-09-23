// Turns the numbers into a short, human summary + practical tips.
// Uses Claude when ANTHROPIC_API_KEY is set; otherwise (or on any failure)
// falls back to deterministic rule-based text so the feature always works.
import Anthropic from '@anthropic-ai/sdk';
import { config } from '../config.js';

const client = config.anthropicApiKey ? new Anthropic({ apiKey: config.anthropicApiKey }) : null;

export const aiEnabled = Boolean(client);

const SYSTEM_PROMPT = `You write the "AI insight" panel of a consumer weather app.
You receive JSON with a city's current conditions, the provider's 3-day forecast, and a
statistical model's temperature/rain predictions for the following days (with confidence).
Write for a general audience in the requested language ("en" = English, "fr" = French).
- summary: 2-3 sentences describing what the coming week looks like and how sure we are.
  Mention that later days are model estimates when their confidence is low.
- tips: 2 to 4 short, practical suggestions (clothing, outdoor plans, hydration, umbrella...),
  each under 90 characters, grounded only in the data provided.
Use °C. Do not invent data that is not in the input.`;

const INSIGHT_SCHEMA = {
  type: 'object',
  properties: {
    summary: { type: 'string' },
    tips: { type: 'array', items: { type: 'string' } },
  },
  required: ['summary', 'tips'],
  additionalProperties: false,
};

async function claudeInsight(payload, lang) {
  const response = await client.beta.messages.create({
    model: config.aiModel,
    max_tokens: 16000,
    // On a safety decline, let the API retry on its recommended fallback model.
    betas: ['server-side-fallback-2026-07-01'],
    fallbacks: 'default',
    output_config: { effort: 'low', format: { type: 'json_schema', schema: INSIGHT_SCHEMA } },
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: JSON.stringify({ language: lang, ...payload }) }],
  });

  if (response.stop_reason === 'refusal') throw new Error('Model declined the request');
  const text = response.content.find((block) => block.type === 'text')?.text;
  if (!text) throw new Error(`No text in response (stop_reason: ${response.stop_reason})`);

  const parsed = JSON.parse(text);
  return { source: 'claude', summary: parsed.summary, tips: parsed.tips.slice(0, 4) };
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
  if (client) {
    try {
      return await claudeInsight(payload, lang);
    } catch (error) {
      if (error instanceof Anthropic.RateLimitError) console.warn('[ai] rate limited, using rules');
      else if (error instanceof Anthropic.AuthenticationError) console.error('[ai] invalid ANTHROPIC_API_KEY');
      else if (error instanceof Anthropic.APIError) console.error(`[ai] API error ${error.status}: ${error.message}`);
      else console.error('[ai] insight failed:', error.message);
    }
  }
  return ruleInsight(payload, lang);
}

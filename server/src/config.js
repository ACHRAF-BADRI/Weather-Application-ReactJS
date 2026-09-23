// Single source of truth for configuration and secrets.
// Values come from environment variables: locally from server/.env,
// in production from the Render dashboard. Never hard-code keys anywhere else.
import 'dotenv/config';

function required(name) {
  const value = process.env[name]?.trim();
  if (!value) {
    console.error(`[config] Missing required environment variable: ${name}. See server/.env.example`);
    process.exit(1);
  }
  return value;
}

function list(value, fallback) {
  return (value || fallback)
    .split(',')
    .map((item) => item.trim().replace(/\/$/, ''))
    .filter(Boolean);
}

export const config = {
  port: Number(process.env.PORT) || 4000,
  weatherApiKey: required('WEATHER_API_KEY'),

  // Optional: enables Claude-written insights. Without it the app still
  // returns the statistical prediction plus rule-based advice.
  anthropicApiKey: process.env.ANTHROPIC_API_KEY?.trim() || null,
  aiModel: process.env.AI_MODEL?.trim() || 'claude-opus-5',

  // Comma-separated list of front-end origins allowed to call this API.
  allowedOrigins: list(process.env.ALLOWED_ORIGINS, 'http://localhost:3000'),
};

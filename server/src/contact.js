// Contact form: validates the visitor's message and emails it to the site owner
// through Resend (https://resend.com). The destination address and the API key come
// from config.js (environment variables), never from the code.
import { config } from './config.js';
import { HttpError } from './weatherApi.js';

const LIMITS = { name: 100, email: 254, message: 5000 };
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const contactEnabled = Boolean(config.contact.resendApiKey && config.contact.toEmail);

const clean = (value) => (typeof value === 'string' ? value.trim() : '');

export function validateContact(body) {
  const data = {
    name: clean(body?.name).replace(/[\r\n]+/g, ' '),
    email: clean(body?.email),
    message: clean(body?.message),
    // Honeypot: hidden from humans, bots tend to fill it in.
    isBot: clean(body?.website) !== '',
  };
  const errors = [];
  if (!data.name || data.name.length > LIMITS.name) errors.push('name');
  if (!EMAIL_RE.test(data.email) || data.email.length > LIMITS.email) errors.push('email');
  if (!data.message || data.message.length > LIMITS.message) errors.push('message');
  return { data, errors };
}

const escapeHtml = (text) =>
  text.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

export function buildEmail({ name, email, message }, sentAt = new Date()) {
  const date = sentAt.toLocaleString('fr-FR', { timeZone: 'Europe/Paris', dateStyle: 'full', timeStyle: 'short' });
  const subject = `[Weather App] Nouveau message de ${name}`;

  const text = [
    'Nouveau message reçu depuis le formulaire de contact de Weather App.',
    '',
    `Nom : ${name}`,
    `Email : ${email}`,
    `Date : ${date}`,
    '',
    'Message :',
    message,
    '',
    `Répondez directement à cet email pour écrire à ${name}.`,
  ].join('\n');

  const html = `<!doctype html>
<html><body style="margin:0;padding:24px;background:#f1f5f9;font-family:Arial,Helvetica,sans-serif;color:#0f172a">
  <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e2e8f0">
    <div style="padding:20px 24px;background-color:#0ea5e9;background-image:linear-gradient(135deg,#0ea5e9,#6366f1);color:#ffffff">
      <div style="font-size:13px;opacity:.9">☀ Weather App · Formulaire de contact</div>
      <div style="font-size:20px;font-weight:bold;margin-top:4px">Nouveau message de ${escapeHtml(name)}</div>
    </div>
    <div style="padding:24px">
      <table style="font-size:14px;border-collapse:collapse;width:100%">
        <tr><td style="color:#64748b;padding:4px 12px 4px 0;width:60px">Nom</td><td style="padding:4px 0"><strong>${escapeHtml(name)}</strong></td></tr>
        <tr><td style="color:#64748b;padding:4px 12px 4px 0">Email</td><td style="padding:4px 0"><a href="mailto:${escapeHtml(email)}" style="color:#0284c7">${escapeHtml(email)}</a></td></tr>
        <tr><td style="color:#64748b;padding:4px 12px 4px 0">Date</td><td style="padding:4px 0">${escapeHtml(date)}</td></tr>
      </table>
      <div style="margin-top:20px;padding:16px;background:#f8fafc;border-left:4px solid #0ea5e9;border-radius:8px;font-size:15px;line-height:1.6;white-space:pre-wrap">${escapeHtml(message)}</div>
      <p style="margin-top:20px;font-size:13px;color:#64748b">Répondez directement à cet email pour écrire à ${escapeHtml(name)}.</p>
    </div>
  </div>
</body></html>`;

  return { subject, text, html };
}

export async function sendContactEmail(data) {
  if (!contactEnabled) throw new HttpError(503, 'Contact form is not configured');

  const { subject, text, html } = buildEmail(data);
  let response;
  try {
    response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${config.contact.resendApiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: config.contact.fromEmail,
        to: [config.contact.toEmail],
        reply_to: data.email, // "Reply" in your mailbox answers the visitor directly
        subject,
        text,
        html,
      }),
      signal: AbortSignal.timeout(10_000),
    });
  } catch {
    throw new HttpError(502, 'Email provider unreachable');
  }

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    console.error(`[contact] Resend error ${response.status}:`, body?.message || body);
    throw new HttpError(502, 'Could not send the message');
  }
}

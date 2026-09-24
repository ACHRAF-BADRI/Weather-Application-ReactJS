import { test } from 'node:test';
import assert from 'node:assert/strict';

process.env.WEATHER_API_KEY ||= 'test-key';
const { validateContact, buildEmail } = await import('../src/contact.js');

const valid = { name: 'Jean Dupont', email: 'jean@example.com', message: 'Bonjour !' };

test('accepts a valid message and trims fields', () => {
  const { data, errors } = validateContact({ ...valid, name: '  Jean Dupont ' });
  assert.deepEqual(errors, []);
  assert.equal(data.name, 'Jean Dupont');
  assert.equal(data.isBot, false);
});

test('rejects missing or invalid fields', () => {
  assert.deepEqual(validateContact({}).errors, ['name', 'email', 'message']);
  assert.deepEqual(validateContact({ ...valid, email: 'not-an-email' }).errors, ['email']);
  assert.deepEqual(validateContact({ ...valid, message: 'x'.repeat(5001) }).errors, ['message']);
});

test('flags bots that fill the honeypot', () => {
  assert.equal(validateContact({ ...valid, website: 'http://spam' }).data.isBot, true);
});

test('newlines in the name cannot inject extra header lines', () => {
  assert.equal(validateContact({ ...valid, name: 'Eve\r\nBcc: x@y.z' }).data.name, 'Eve Bcc: x@y.z');
});

test('email has a clear subject and escapes user HTML', () => {
  const { subject, html, text } = buildEmail({ ...valid, message: '<script>alert(1)</script>' });
  assert.equal(subject, '[Weather App] Nouveau message de Jean Dupont');
  assert.ok(!html.includes('<script>'));
  assert.ok(html.includes('&lt;script&gt;'));
  assert.ok(text.includes('jean@example.com'));
});

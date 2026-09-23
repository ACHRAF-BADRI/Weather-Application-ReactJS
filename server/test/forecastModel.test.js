import { test } from 'node:test';
import assert from 'node:assert/strict';
import { holtDamped, predict } from '../src/ai/forecastModel.js';

const day = (date, max, min, precip = 0) => ({ date, max, min, precip });

test('flat series predicts a flat, stable future', () => {
  const days = Array.from({ length: 7 }, (_, i) => day(`2026-09-0${i + 1}`, 20, 10));
  const result = predict(days, 3);
  assert.equal(result.trend, 'stable');
  for (const p of result.predicted) {
    assert.equal(p.max, 20);
    assert.equal(p.min, 10);
  }
});

test('rising series is detected as warming and keeps rising, but damped', () => {
  const days = Array.from({ length: 8 }, (_, i) => day(`2026-09-0${i + 1}`, 15 + i, 5 + i));
  const { trend, predicted } = predict(days, 4);
  assert.equal(trend, 'warming');
  assert.ok(predicted[0].max > 22);

  // Damped trend: each daily step is smaller than the previous one (unrounded values).
  const model = holtDamped(days.map((d) => d.max));
  const values = [1, 2, 3, 4, 5].map((h) => model.forecast(h));
  const steps = values.slice(1).map((v, i) => v - values[i]);
  for (let i = 1; i < steps.length; i++) assert.ok(steps[i] < steps[i - 1]);
});

test('uncertainty band widens and confidence drops with the horizon', () => {
  const days = [22, 19, 24, 18, 23, 20, 25].map((t, i) => day(`2026-09-0${i + 1}`, t, t - 10));
  const { predicted } = predict(days, 4);
  const width = (p) => p.maxRange[1] - p.maxRange[0];
  assert.ok(width(predicted[3]) > width(predicted[0]));
  assert.ok(predicted[3].confidence < predicted[0].confidence);
});

test('dates continue after the last day, across month boundaries', () => {
  const days = [day('2026-09-29', 20, 10), day('2026-09-30', 20, 10)];
  assert.deepEqual(predict(days, 2).predicted.map((p) => p.date), ['2026-10-01', '2026-10-02']);
});

test('rain chance follows recent wet days and stays within bounds', () => {
  const wet = Array.from({ length: 6 }, (_, i) => day(`2026-09-0${i + 1}`, 18, 12, 8));
  const dry = Array.from({ length: 6 }, (_, i) => day(`2026-09-0${i + 1}`, 28, 16, 0));
  assert.ok(predict(wet, 1).predicted[0].rainChance >= 90);
  assert.ok(predict(dry, 1).predicted[0].rainChance <= 10);
});

test('holtDamped rejects an empty series', () => {
  assert.throws(() => holtDamped([]));
});

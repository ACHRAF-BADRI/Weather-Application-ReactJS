// Statistical prediction model: Holt's damped-trend exponential smoothing.
// It learns the level and trend of recent daily temperatures (past observations
// + provider forecast) and extends them beyond the provider's forecast horizon,
// with an uncertainty band that widens the further out it predicts.

const ALPHA = 0.5; // level smoothing
const BETA = 0.3; // trend smoothing
const PHI = 0.8; // trend damping: the trend fades out instead of growing forever
const Z_80 = 1.28; // 80% prediction interval
const MIN_SIGMA = 1; // never claim better than ±1°C one day ahead

const round1 = (n) => Math.round(n * 10) / 10;
const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n));

export function holtDamped(series) {
  if (series.length === 0) throw new Error('Empty series');
  let level = series[0];
  let trend = series.length > 1 ? series[1] - series[0] : 0;
  const errors = [];

  for (let t = 1; t < series.length; t++) {
    const expected = level + PHI * trend;
    errors.push(series[t] - expected);
    const prevLevel = level;
    level = ALPHA * series[t] + (1 - ALPHA) * expected;
    trend = BETA * (level - prevLevel) + (1 - BETA) * PHI * trend;
  }

  const rmse = errors.length ? Math.sqrt(errors.reduce((s, e) => s + e * e, 0) / errors.length) : 0;
  const sigma = Math.max(MIN_SIGMA, rmse);

  return {
    level,
    trend,
    sigma,
    forecast(h) {
      let damp = 0;
      for (let k = 1; k <= h; k++) damp += PHI ** k;
      return level + damp * trend;
    },
  };
}

// Probability of a wet day, weighting recent days more, drifting back toward
// the period average as the horizon grows.
function rainChance(days, h) {
  const values = days.map((d) => (d.chanceOfRain != null ? d.chanceOfRain / 100 : d.precip >= 1 ? 1 : 0));
  let weighted = 0;
  let weights = 0;
  values.forEach((v, i) => {
    const w = 0.8 ** (values.length - 1 - i);
    weighted += v * w;
    weights += w;
  });
  const recent = weighted / weights;
  const overall = values.reduce((s, v) => s + v, 0) / values.length;
  const pull = 0.85 ** h;
  return clamp(recent * pull + overall * (1 - pull), 0.05, 0.95);
}

function addDays(isoDate, n) {
  const date = new Date(`${isoDate}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + n);
  return date.toISOString().slice(0, 10);
}

/**
 * @param {Array<{date:string,max:number,min:number,precip:number,chanceOfRain?:number}>} days
 *   chronological daily data (observed history, then provider forecast)
 * @param {number} horizon number of extra days to predict after the last one
 */
export function predict(days, horizon = 4) {
  if (days.length < 2) throw new Error('Need at least two days of data');

  const maxModel = holtDamped(days.map((d) => d.max));
  const minModel = holtDamped(days.map((d) => d.min));
  const lastDate = days[days.length - 1].date;

  const predicted = [];
  for (let h = 1; h <= horizon; h++) {
    let max = maxModel.forecast(h);
    let min = minModel.forecast(h);
    if (min > max) [min, max] = [max, min];
    const spreadMax = Z_80 * maxModel.sigma * Math.sqrt(h);
    const spreadMin = Z_80 * minModel.sigma * Math.sqrt(h);
    predicted.push({
      date: addDays(lastDate, h),
      max: round1(max),
      min: round1(min),
      maxRange: [round1(max - spreadMax), round1(max + spreadMax)],
      minRange: [round1(min - spreadMin), round1(min + spreadMin)],
      rainChance: Math.round(rainChance(days, h) * 100),
      confidence: Math.round(clamp(0.92 - 0.09 * h - 0.03 * maxModel.sigma, 0.3, 0.92) * 100),
    });
  }

  const trendPerDay = (maxModel.trend + minModel.trend) / 2;
  const trend = trendPerDay > 0.3 ? 'warming' : trendPerDay < -0.3 ? 'cooling' : 'stable';

  return {
    method: 'holt-damped-trend',
    trend,
    trendPerDay: round1(trendPerDay),
    predicted,
  };
}

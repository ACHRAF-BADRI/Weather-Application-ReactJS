import { api } from '@/lib/api';
import { useI18n } from '@/lib/i18n';
import { useFetch } from '@/lib/useFetch';
import { formatDay, round } from '@/lib/format';
import TempChart from './TempChart';

const TREND_STYLE = {
  warming: 'bg-amber-400/15 text-warn',
  cooling: 'bg-sky-400/15 text-accent',
  stable: 'bg-emerald-400/15 text-success',
};
const TREND_ICON = { warming: '↗', cooling: '↘', stable: '→' };

export default function AIPrediction({ q }) {
  const { t, lang } = useI18n();
  const { data, error, loading, retry } = useFetch((signal) => api.predict(q, lang, { signal }), [q, lang]);

  return (
    <section className="glass relative overflow-hidden p-5 sm:p-6">
      <div aria-hidden className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-fuchsia-500/20 blur-3xl" />

      <header className="relative mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-semibold">
            <span className="grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-br from-fuchsia-400 to-indigo-500 text-sm">✦</span>
            {t('ai.title')}
          </h2>
          <p className="mt-1 text-sm text-subtle">{t('ai.subtitle')}</p>
        </div>
        {data && (
          <span className={`rounded-full px-3 py-1 text-sm font-medium ${TREND_STYLE[data.trend]}`}>
            {TREND_ICON[data.trend]} {t(`ai.trend.${data.trend}`)} ·{' '}
            {t('ai.perDay', { value: `${data.trendPerDay > 0 ? '+' : ''}${data.trendPerDay}` })}
          </span>
        )}
      </header>

      {loading && !data && (
        <div className="relative space-y-3" role="status">
          <p className="text-sm text-ai">
            <span className="mr-2 inline-block h-2 w-2 animate-pulse rounded-full bg-fuchsia-300" />
            {t('ai.loading')}
          </p>
          <div className="skeleton h-48 w-full" />
          <div className="skeleton h-16 w-full" />
        </div>
      )}

      {error && (
        <div className="relative flex flex-wrap items-center gap-3 text-sm text-muted">
          {t('ai.error')}
          <button type="button" className="btn-ghost" onClick={retry}>
            {t('card.retry')}
          </button>
        </div>
      )}

      {data && (
        <div className={`relative space-y-6 transition-opacity ${loading ? 'opacity-60' : ''}`}>
          <TempChart
            observed={data.observed}
            forecast={data.forecast}
            predicted={data.predicted}
            lang={lang}
            labels={{
              aria: t('ai.title'),
              observed: t('ai.observed'),
              forecast: t('ai.forecast'),
              predicted: t('ai.predicted'),
            }}
          />

          <ul className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {data.predicted.map((day) => (
              <li key={day.date} className="rounded-2xl border border-ai/20 bg-ai/[0.06] p-4">
                <p className="text-sm font-medium capitalize text-ai">{formatDay(day.date, lang)}</p>
                <p className="mt-1 text-2xl font-light">
                  {round(day.max)}° <span className="text-base text-subtle">/ {round(day.min)}°</span>
                </p>
                <p className="mt-1 text-xs text-subtle">
                  {t('ai.range')}: {round(day.maxRange[0])}–{round(day.maxRange[1])}°
                </p>
                <p className="mt-2 text-xs text-accent">
                  💧 {t('ai.rainChance')} {day.rainChance}%
                </p>
                <div className="mt-2">
                  <div className="flex justify-between text-[11px] text-subtle">
                    <span>{t('ai.confidence')}</span>
                    <span>{day.confidence}%</span>
                  </div>
                  <div className="mt-1 h-1.5 rounded-full bg-tint/10">
                    <div className="h-full rounded-full bg-gradient-to-r from-fuchsia-400 to-indigo-400" style={{ width: `${day.confidence}%` }} />
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <div className="rounded-2xl bg-shade/25 p-4 sm:p-5">
            <p className="leading-relaxed text-fg-soft">{data.insight.summary}</p>
            {data.insight.tips.length > 0 && (
              <>
                <h3 className="label mb-2 mt-4">{t('ai.tips')}</h3>
                <ul className="space-y-1.5 text-sm text-muted">
                  {data.insight.tips.map((tip) => (
                    <li key={tip} className="flex gap-2">
                      <span className="text-ai">•</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </>
            )}
            <p className="mt-4 text-xs text-faint">
              {data.insight.source === 'claude' ? t('ai.sourceClaude') : t('ai.sourceRules')} · {t('ai.disclaimer')}
            </p>
          </div>
        </div>
      )}
    </section>
  );
}

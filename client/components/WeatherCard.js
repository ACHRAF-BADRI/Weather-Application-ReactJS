import Link from 'next/link';
import { api } from '@/lib/api';
import { useI18n } from '@/lib/i18n';
import { useFetch } from '@/lib/useFetch';
import { iconUrl, round } from '@/lib/format';

export function cityHref(city) {
  return `/city/?q=${encodeURIComponent(city.q)}&name=${encodeURIComponent(city.name)}`;
}

function CardSkeleton() {
  return (
    <div className="glass h-[232px] p-5">
      <div className="skeleton h-5 w-1/2" />
      <div className="skeleton mt-2 h-4 w-1/3" />
      <div className="skeleton mt-6 h-14 w-2/5" />
      <div className="skeleton mt-6 h-10 w-full" />
    </div>
  );
}

export default function WeatherCard({ city, onRemove }) {
  const { t, lang } = useI18n();
  const { data, error, loading, retry } = useFetch((signal) => api.weather(city.q, lang, { signal }), [city.q, lang]);

  const removeButton = (
    <button
      type="button"
      onClick={() => onRemove(city)}
      aria-label={t('card.remove', { city: city.name })}
      className="absolute right-3 top-3 z-10 grid h-8 w-8 place-items-center rounded-full text-subtle transition hover:bg-tint/10 hover:text-fg"
    >
      ✕
    </button>
  );

  if (loading && !data) return <CardSkeleton />;

  if (error) {
    return (
      <div className="glass relative flex h-[232px] flex-col items-center justify-center gap-3 p-5 text-center">
        {removeButton}
        <p className="font-semibold">{city.name}</p>
        <p className="text-sm text-subtle">{error.status === 0 ? t('errors.network') : t('card.error')}</p>
        <button type="button" className="btn-ghost" onClick={retry}>
          {t('card.retry')}
        </button>
      </div>
    );
  }

  const { location, current, forecast } = data;
  const today = forecast.forecastday[0].day;

  return (
    <article className="glass group relative animate-fade-up p-5 transition hover:-translate-y-1 hover:border-tint/20 hover:bg-tint/[0.09]">
      {removeButton}
      <Link href={cityHref(city)} className="block">
        <header className="pr-8">
          <h2 className="truncate text-lg font-semibold text-fg">{location.name}</h2>
          <p className="truncate text-sm text-subtle">{[location.region, location.country].filter(Boolean).join(', ')}</p>
        </header>

        <div className="mt-3 flex items-center justify-between">
          <div>
            <p className="text-5xl font-light tracking-tight text-fg">{round(current.temp_c)}°</p>
            <p className="mt-1 text-sm text-muted">{current.condition.text}</p>
          </div>
          <img src={iconUrl(current.condition.icon)} alt="" width={72} height={72} className="h-[72px] w-[72px] drop-shadow-lg" />
        </div>

        <dl className="mt-4 grid grid-cols-3 gap-2 rounded-2xl bg-shade/20 p-3 text-center text-sm">
          <div>
            <dt className="label">
              {t('card.high')} / {t('card.low')}
            </dt>
            <dd className="mt-0.5 font-medium">
              {round(today.maxtemp_c)}° / {round(today.mintemp_c)}°
            </dd>
          </div>
          <div>
            <dt className="label">{t('card.humidity')}</dt>
            <dd className="mt-0.5 font-medium">{current.humidity}%</dd>
          </div>
          <div>
            <dt className="label">{t('card.wind')}</dt>
            <dd className="mt-0.5 font-medium">{round(current.wind_kph)} km/h</dd>
          </div>
        </dl>
      </Link>
    </article>
  );
}

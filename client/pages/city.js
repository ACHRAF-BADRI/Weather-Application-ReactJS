import Head from 'next/head';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { api } from '@/lib/api';
import { useI18n } from '@/lib/i18n';
import { useFetch } from '@/lib/useFetch';
import { formatHour, iconUrl, round } from '@/lib/format';
import HourlyStrip from '@/components/HourlyStrip';
import ForecastList from '@/components/ForecastList';
import AIPrediction from '@/components/AIPrediction';

const CityMap = dynamic(() => import('@/components/CityMap'), {
  ssr: false,
  loading: () => <div className="skeleton h-full w-full rounded-3xl" />,
});

function Stat({ label, value }) {
  return (
    <div className="rounded-2xl bg-shade/20 p-3">
      <dt className="label">{label}</dt>
      <dd className="mt-1 text-lg font-medium">{value}</dd>
    </div>
  );
}

export default function CityPage() {
  const { t, lang } = useI18n();
  const router = useRouter();
  const q = typeof router.query.q === 'string' ? router.query.q : '';
  const { data, error, loading, retry } = useFetch((signal) => api.weather(q, lang, { signal }), [q, lang], router.isReady && !!q);

  const back = (
    <Link href="/" className="btn-ghost mb-6">
      ← {t('city.back')}
    </Link>
  );

  if (router.isReady && !q) {
    return (
      <>
        {back}
        <p className="glass p-8 text-center">{t('city.notFound')}</p>
      </>
    );
  }

  if (error) {
    return (
      <>
        {back}
        <div className="glass flex flex-col items-center gap-4 p-8 text-center">
          <p>{error.status === 404 ? t('city.notFound') : error.status === 0 ? t('errors.network') : t('card.error')}</p>
          {error.status !== 404 && (
            <button type="button" className="btn-ghost" onClick={retry}>
              {t('card.retry')}
            </button>
          )}
        </div>
      </>
    );
  }

  if (!data) {
    return (
      <>
        {back}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-5" role="status" aria-label={t('city.loading')}>
          <div className="skeleton h-80 lg:col-span-3" />
          <div className="skeleton h-80 lg:col-span-2" />
          <div className="skeleton h-40 lg:col-span-5" />
        </div>
      </>
    );
  }

  const { location, current, forecast } = data;
  const place = [location.name, location.region, location.country].filter(Boolean).join(', ');

  return (
    <>
      <Head>
        <title>{`${location.name} · ${t('meta.title')}`}</title>
      </Head>
      {back}

      <div className={`grid grid-cols-1 gap-4 transition-opacity lg:grid-cols-5 ${loading ? 'opacity-60' : ''}`}>
        <section className="glass animate-fade-up p-5 sm:p-6 lg:col-span-3">
          <h1 className="text-2xl font-bold sm:text-3xl">{location.name}</h1>
          <p className="text-subtle">{[location.region, location.country].filter(Boolean).join(', ')}</p>

          <div className="mt-4 flex items-center gap-4">
            <img src={iconUrl(current.condition.icon)} alt="" width={96} height={96} className="h-24 w-24 drop-shadow-xl" />
            <div>
              <p className="text-6xl font-extralight tracking-tight sm:text-7xl">{round(current.temp_c)}°</p>
              <p className="text-lg text-fg-soft">{current.condition.text}</p>
            </div>
          </div>

          <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
            <Stat label={t('city.feelsLike')} value={`${round(current.feelslike_c)}°`} />
            <Stat label={t('city.humidity')} value={`${current.humidity}%`} />
            <Stat label={t('city.wind')} value={`${round(current.wind_kph)} km/h ${current.wind_dir}`} />
            <Stat label={t('city.pressure')} value={`${round(current.pressure_mb)} hPa`} />
            <Stat label={t('city.uv')} value={current.uv} />
            <Stat label={t('city.visibility')} value={`${current.vis_km} km`} />
          </dl>

          <p className="mt-4 text-xs text-faint">
            {t('city.coordinates')}: {location.lat}, {location.lon} · {t('city.updated', { time: formatHour(current.last_updated) })}
          </p>
        </section>

        <section className="glass h-72 overflow-hidden p-1.5 sm:h-80 lg:col-span-2 lg:h-auto lg:min-h-[320px]" aria-label={t('city.map')}>
          <CityMap lat={location.lat} lon={location.lon} label={place} />
        </section>

        <div className="lg:col-span-5">
          <HourlyStrip location={location} forecast={forecast} />
        </div>

        <div className="lg:col-span-2">
          <ForecastList forecast={forecast} />
        </div>

        <div className="lg:col-span-3">
          <AIPrediction q={q} />
        </div>
      </div>
    </>
  );
}

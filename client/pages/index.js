import { useEffect, useState } from 'react';
import CitySearch from '@/components/CitySearch';
import WeatherCard from '@/components/WeatherCard';
import ConfirmDialog from '@/components/ConfirmDialog';
import { useI18n } from '@/lib/i18n';
import { useToast } from '@/lib/toast';

const DEFAULT_CITIES = ['Rabat', 'Paris', 'Berlin', 'Marrakesh', 'Marseille'].map((name) => ({ name, q: name }));
const STORAGE_KEY = 'cities';

function loadCities() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!Array.isArray(saved)) return null;
    // v1 of the app stored plain strings.
    return saved.map((c) => (typeof c === 'string' ? { name: c, q: c } : c)).filter((c) => c?.q && c?.name);
  } catch {
    return null;
  }
}

export default function Home() {
  const { t } = useI18n();
  const toast = useToast();
  const [cities, setCities] = useState(DEFAULT_CITIES);
  const [loaded, setLoaded] = useState(false);
  // Pending action awaiting confirmation: { type: 'remove', city } | { type: 'reset' } | null
  const [pending, setPending] = useState(null);

  useEffect(() => {
    const saved = loadCities();
    if (saved) setCities(saved);
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cities));
    } catch {}
  }, [cities, loaded]);

  function addCity(city) {
    const exists = cities.some((c) => c.q === city.q || c.name.toLowerCase() === city.name.toLowerCase());
    if (exists) {
      toast.info(t('toast.alreadyAdded', { city: city.name }));
      return;
    }
    setCities((list) => [city, ...list]);
    toast.success(t('toast.added', { city: city.name }));
  }

  function confirmPending() {
    if (pending?.type === 'remove') {
      setCities((list) => list.filter((c) => c.q !== pending.city.q));
      toast.success(t('toast.removed', { city: pending.city.name }));
    }
    if (pending?.type === 'reset') {
      setCities(DEFAULT_CITIES);
      toast.success(t('toast.reset'));
    }
    setPending(null);
  }

  const isRemove = pending?.type === 'remove';
  const dialogCity = { city: pending?.city?.name ?? '' };

  return (
    <>
      <section className="mb-6 text-center sm:mb-8">
        <h1 className="bg-gradient-to-r from-fg via-fg-soft to-accent bg-clip-text text-3xl font-bold tracking-tight text-transparent sm:text-5xl">
          {t('home.title')}
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-muted sm:text-lg">{t('home.subtitle')}</p>
      </section>

      <section className="relative z-10 mx-auto mb-8 flex max-w-2xl flex-col gap-3 sm:flex-row sm:items-start">
        <CitySearch onAdd={addCity} />
        <button type="button" className="btn-ghost self-end py-3 sm:self-auto" onClick={() => setPending({ type: 'reset' })}>
          ↺ {t('home.reset')}
        </button>
      </section>


      {cities.length === 0 ? (
        <p className="glass p-10 text-center text-muted">{t('home.empty')}</p>
      ) : (
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cities.map((city) => (
            <WeatherCard key={city.q} city={city} onRemove={(c) => setPending({ type: 'remove', city: c })} />
          ))}
        </section>
      )}

      <ConfirmDialog
        open={pending !== null}
        icon={isRemove ? '🗑️' : '↺'}
        title={isRemove ? t('confirm.removeTitle', dialogCity) : t('confirm.resetTitle')}
        message={isRemove ? t('confirm.removeMessage', dialogCity) : t('confirm.resetMessage')}
        confirmLabel={isRemove ? t('confirm.removeAction') : t('confirm.resetAction')}
        cancelLabel={t('confirm.cancel')}
        onConfirm={confirmPending}
        onCancel={() => setPending(null)}
      />
    </>
  );
}

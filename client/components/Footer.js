import { useI18n } from '@/lib/i18n';

export default function Footer() {
  const { t } = useI18n();
  return (
    <footer className="border-t border-tint/10 py-6 text-sm text-subtle">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 text-center sm:flex-row sm:px-6">
        <p>
          © {new Date().getFullYear()} · {t('footer.by', { name: 'Achraf El Badri' })} ·{' '}
          <a className="text-accent hover:underline" href="https://github.com/ACHRAF-BADRI/Weather-Application-ReactJS">
            GitHub
          </a>
        </p>
        <p>
          {t('footer.poweredBy')}{' '}
          <a className="text-accent hover:underline" href="https://www.weatherapi.com/" title="Free Weather API">
            WeatherAPI.com
          </a>
        </p>
      </div>
    </footer>
  );
}

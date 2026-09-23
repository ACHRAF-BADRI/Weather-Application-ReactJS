import Link from 'next/link';
import { useI18n } from '@/lib/i18n';

export default function NotFound() {
  const { t } = useI18n();
  return (
    <section className="glass mx-auto mt-10 max-w-md p-10 text-center">
      <p className="text-5xl">🌫️</p>
      <p className="mt-4 text-lg">{t('errors.notFound')}</p>
      <Link href="/" className="btn-primary mt-6">
        {t('errors.goHome')}
      </Link>
    </section>
  );
}

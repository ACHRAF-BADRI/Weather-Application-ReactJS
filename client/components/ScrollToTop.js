import { useEffect, useState } from 'react';
import { useI18n } from '@/lib/i18n';

// Floating button, shown once the user has scrolled past the first screen.
export default function ScrollToTop() {
  const { t } = useI18n();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label={t('nav.scrollTop')}
      title={t('nav.scrollTop')}
      className="glass animate-fade-up fixed bottom-6 right-4 z-[900] grid h-11 w-11 place-items-center rounded-full text-lg transition hover:-translate-y-0.5 sm:right-6"
    >
      ↑
    </button>
  );
}

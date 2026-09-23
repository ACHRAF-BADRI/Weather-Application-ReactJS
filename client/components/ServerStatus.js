import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useI18n } from '@/lib/i18n';

// Render's free tier sleeps after inactivity; the first request can take ~1 min.
// Ping the API once and explain the wait if it is slow to answer.
export default function ServerStatus() {
  const { t } = useI18n();
  const [waking, setWaking] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setWaking(true), 2500);
    api
      .health()
      .catch(() => {})
      .finally(() => {
        clearTimeout(timer);
        setWaking(false);
      });
    return () => clearTimeout(timer);
  }, []);

  if (!waking) return null;
  return (
    <div role="status" className="border-b border-warn/20 bg-amber-400/10 px-4 py-2 text-center text-sm text-warn">
      <span className="mr-2 inline-block h-2 w-2 animate-pulse rounded-full bg-amber-300" />
      {t('server.waking')}
    </div>
  );
}

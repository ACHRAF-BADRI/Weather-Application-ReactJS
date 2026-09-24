import { useState } from 'react';
import { api } from '@/lib/api';
import { useI18n } from '@/lib/i18n';
import { useToast } from '@/lib/toast';

// Messages are sent to the API server, which emails them to the site owner
// (address configured in server/.env, see server/src/contact.js).
export default function ContactPage() {
  const { t } = useI18n();
  const toast = useToast();
  const [sending, setSending] = useState(false);

  async function onSubmit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    setSending(true);
    try {
      await api.contact(Object.fromEntries(new FormData(form)));
      form.reset();
      toast.success(t('contact.success'));
    } catch (error) {
      const key = error.status === 400 ? 'invalid' : error.status === 429 ? 'tooMany' : error.status === 0 ? 'network' : 'error';
      toast.error(key === 'network' ? t('errors.network') : t(`contact.${key}`));
    } finally {
      setSending(false);
    }
  }

  return (
    <section className="mx-auto max-w-xl">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{t('contact.title')}</h1>
      <p className="mt-2 text-muted">{t('contact.subtitle')}</p>

      <form onSubmit={onSubmit} className="glass mt-6 space-y-4 p-5 sm:p-6">
        {/* Honeypot: invisible to people, bots fill it in and get silently ignored */}
        <label aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
          Website <input name="website" tabIndex={-1} autoComplete="off" />
        </label>

        <label className="block">
          <span className="label">{t('contact.name')}</span>
          <input name="name" required maxLength={100} autoComplete="name" className="input mt-1.5" />
        </label>
        <label className="block">
          <span className="label">{t('contact.email')}</span>
          <input name="email" type="email" required maxLength={254} autoComplete="email" className="input mt-1.5" />
        </label>
        <label className="block">
          <span className="label">{t('contact.message')}</span>
          <textarea name="message" rows={5} required maxLength={5000} className="input mt-1.5 resize-y" />
        </label>

        <button type="submit" className="btn-primary w-full py-3 sm:w-auto sm:px-8" disabled={sending}>
          {sending ? t('contact.sending') : t('contact.send')}
        </button>
      </form>
    </section>
  );
}

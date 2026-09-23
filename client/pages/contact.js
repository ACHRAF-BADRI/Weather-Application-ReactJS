import { useState } from 'react';
import { useI18n } from '@/lib/i18n';
import { useToast } from '@/lib/toast';

// Submissions are handled by Netlify Forms (no back-end or database needed):
// Netlify detects this form in the exported HTML thanks to data-netlify="true".
export default function ContactPage() {
  const { t } = useI18n();
  const toast = useToast();
  const [sending, setSending] = useState(false);

  async function onSubmit(event) {
    event.preventDefault();
    // Only Netlify receives the messages. The local dev server answers 200 to any POST,
    // so say so instead of pretending the message was sent.
    if (process.env.NODE_ENV === 'development') {
      toast.info(t('contact.devOnly'));
      return;
    }
    setSending(true);
    const form = event.currentTarget;
    try {
      const response = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(new FormData(form)).toString(),
      });
      if (!response.ok) throw new Error(String(response.status));
      form.reset();
      toast.success(t('contact.success'));
    } catch {
      toast.error(t('contact.error'));
    } finally {
      setSending(false);
    }
  }

  return (
    <section className="mx-auto max-w-xl">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{t('contact.title')}</h1>
      <p className="mt-2 text-muted">{t('contact.subtitle')}</p>

      <form name="contact" method="POST" data-netlify="true" netlify-honeypot="bot-field" onSubmit={onSubmit} className="glass mt-6 space-y-4 p-5 sm:p-6">
        <input type="hidden" name="form-name" value="contact" />
        <p hidden>
          <label>
            Don’t fill this out: <input name="bot-field" />
          </label>
        </p>

        <label className="block">
          <span className="label">{t('contact.name')}</span>
          <input name="name" required autoComplete="name" className="input mt-1.5" />
        </label>
        <label className="block">
          <span className="label">{t('contact.email')}</span>
          <input name="email" type="email" required autoComplete="email" className="input mt-1.5" />
        </label>
        <label className="block">
          <span className="label">{t('contact.message')}</span>
          <textarea name="message" rows={5} required className="input mt-1.5 resize-y" />
        </label>

        <button type="submit" className="btn-primary w-full py-3 sm:w-auto sm:px-8" disabled={sending}>
          {sending ? t('contact.sending') : t('contact.send')}
        </button>
      </form>
    </section>
  );
}

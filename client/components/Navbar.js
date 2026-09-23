import Link from 'next/link';
import { useRouter } from 'next/router';
import { useI18n, LANGUAGES } from '@/lib/i18n';
import { useTheme } from '@/lib/theme';

const LANGUAGE_NAMES = { en: 'English', fr: 'Français' };

export default function Navbar() {
  const { t, lang, setLang } = useI18n();
  const { pathname } = useRouter();
  const { theme, toggleTheme } = useTheme();

  const links = [
    { href: '/', label: t('nav.home'), active: pathname === '/' || pathname === '/city' },
    { href: '/contact/', label: t('nav.contact'), active: pathname === '/contact' },
  ];

  return (
    <header className="sticky top-0 z-[1000] border-b border-tint/10 bg-page/70 backdrop-blur-xl">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <span aria-hidden className="grid h-9 w-9 place-items-center rounded-2xl bg-gradient-to-br from-sky-400 to-indigo-500 text-lg text-white">
            ☀
          </span>
          <span className="hidden text-lg sm:inline">{t('meta.title')}</span>
        </Link>

        <div className="flex items-center gap-1 sm:gap-2">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={link.active ? 'page' : undefined}
              className={`rounded-full px-3 py-2 text-sm font-medium transition ${
                link.active ? 'bg-tint/10 text-fg' : 'text-muted hover:text-fg'
              }`}
            >
              {link.label}
            </Link>
          ))}

          <div role="group" aria-label={t('nav.language')} className="ml-1 flex rounded-full border border-tint/15 p-0.5">
            {LANGUAGES.map((code) => (
              <button
                key={code}
                type="button"
                onClick={() => setLang(code)}
                aria-label={LANGUAGE_NAMES[code]}
                lang={code}
                aria-pressed={lang === code}
                className={`rounded-full px-2.5 py-1 text-xs font-semibold uppercase transition ${
                  lang === code ? 'bg-sky-500 text-slate-950' : 'text-muted hover:text-fg'
                }`}
              >
                {code}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={toggleTheme}
            aria-label={theme === 'light' ? t('nav.darkMode') : t('nav.lightMode')}
            title={theme === 'light' ? t('nav.darkMode') : t('nav.lightMode')}
            className="grid h-9 w-9 place-items-center rounded-full border border-tint/15 text-base transition hover:bg-tint/10"
          >
            {/* Icon is chosen after mount; before that the theme is unknown */}
            <span aria-hidden>{theme === null ? '' : theme === 'light' ? '🌙' : '☀️'}</span>
          </button>
        </div>
      </nav>
    </header>
  );
}

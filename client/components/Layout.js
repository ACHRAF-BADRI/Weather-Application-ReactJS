import Head from 'next/head';
import Navbar from './Navbar';
import Footer from './Footer';
import ServerStatus from './ServerStatus';
import ScrollToTop from './ScrollToTop';
import { useI18n } from '@/lib/i18n';

export default function Layout({ children }) {
  const { t } = useI18n();
  return (
    <div className="flex min-h-screen flex-col">
      <Head>
        <title>{t('meta.title')}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </Head>
      <Navbar />
      <ServerStatus />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-12 pt-3 sm:px-6 sm:pt-5">{children}</main>
      <ScrollToTop />
      <Footer />
    </div>
  );
}

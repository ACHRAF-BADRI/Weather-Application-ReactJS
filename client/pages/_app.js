import { Inter } from 'next/font/google';
import 'leaflet/dist/leaflet.css';
import '@/styles/globals.css';
import { I18nProvider } from '@/lib/i18n';
import { ToastProvider } from '@/lib/toast';
import Layout from '@/components/Layout';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export default function App({ Component, pageProps }) {
  return (
    <I18nProvider>
      <div className={`${inter.variable} font-sans`}>
        <ToastProvider>
          <Layout>
            <Component {...pageProps} />
          </Layout>
        </ToastProvider>
      </div>
    </I18nProvider>
  );
}

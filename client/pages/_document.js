import { Html, Head, Main, NextScript } from 'next/document';
import { themeInitScript } from '@/lib/theme';

export default function Document() {
  return (
    <Html lang="en" suppressHydrationWarning>
      <Head>
        {/* Sets the light/dark class before first paint to avoid a theme flash */}
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <link rel="icon" href="/favicon.ico" />
        <meta name="theme-color" content="#020617" />
        <meta name="description" content="Live weather, forecasts and AI predictions for your favourite cities." />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}

import '../styles/globals.css';
import Head from 'next/head';

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        {/* Default Meta Tags */}
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        
        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        
        {/* Default SEO */}
        <meta name="robots" content="index, follow" />
        <meta name="theme-color" content="#3B82F6" />
        
        {/* Google Fonts (optional - for better typography) */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </Head>
      
      <Component {...pageProps} />
      
      {/* Google Analytics - Replace G-XXXXXXXXXX with your ID */}
      {process.env.NODE_ENV === 'production' && (
        <>
          <script
            async
            src={`https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX`}
          />
          <script
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', 'G-XXXXXXXXXX', {
                  page_path: window.location.pathname,
                });
              `,
            }}
          />
        </>
      )}
    </>
  );
}
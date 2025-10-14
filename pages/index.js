import Head from 'next/head';
import PdfToCsvConverter from '../components/PdfToCsvConverter';

export default function Home() {
  return (
    <>
      <Head>
        {/* Primary Meta Tags */}
        <title>PDF to CSV Converter - Free Online Tool | Extract Tables from PDFs</title>
        <meta name="title" content="PDF to CSV Converter - Free Online Tool | Extract Tables from PDFs" />
        <meta name="description" content="Convert PDF tables to CSV files instantly. Free, secure, and accurate PDF to CSV conversion tool. No signup required. Process files up to 50MB with advanced table detection." />
        <meta name="keywords" content="PDF to CSV, PDF converter, table extraction, free PDF tool, convert PDF tables, PDF to Excel, PDF data extraction, online PDF converter" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://pdftocsv.vercel.app/" />
        <meta property="og:title" content="PDF to CSV Converter - Free Online Tool" />
        <meta property="og:description" content="Convert PDF tables to CSV files instantly. Free, secure, and accurate. No signup required." />
        <meta property="og:image" content="https://pdftocsv.vercel.app/og-image.png" />
        
        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://pdftocsv.vercel.app/" />
        <meta property="twitter:title" content="PDF to CSV Converter - Free Online Tool" />
        <meta property="twitter:description" content="Convert PDF tables to CSV files instantly. Free, secure, and accurate." />
        <meta property="twitter:image" content="https://pdftocsv.vercel.app/twitter-image.png" />
        
        {/* Additional SEO */}
        <link rel="canonical" href="https://pdftocsv.vercel.app/" />
        <meta name="author" content="PDF to CSV Converter" />
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
        
        {/* Schema.org structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "PDF to CSV Converter",
              "description": "Convert PDF tables to CSV files online. Free tool for extracting data from PDFs.",
              "url": "https://pdftocsv.vercel.app/",
              "applicationCategory": "UtilityApplication",
              "operatingSystem": "Any",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
              },
              "featureList": [
                "Extract tables from PDFs",
                "Convert PDF to CSV",
                "Preview data before download",
                "Support for multiple tables",
                "Secure file processing",
                "No signup required"
              ]
            })
          }}
        />
        
        {/* Additional structured data for FAQ */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              "mainEntity": [
                {
                  "@type": "Question",
                  "name": "Is PDF to CSV Converter free?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Yes, our PDF to CSV converter is completely free to use with no hidden charges or signup required."
                  }
                },
                {
                  "@type": "Question",
                  "name": "Is my data secure when using this PDF converter?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Yes, your files are processed securely and deleted immediately after conversion. We never store your data."
                  }
                },
                {
                  "@type": "Question",
                  "name": "What file size limit does the PDF to CSV converter have?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "We support PDF files up to 50MB to ensure fast processing times."
                  }
                }
              ]
            })
          }}
        />
      </Head>
      
      <PdfToCsvConverter />
    </>
  );
}

// Optional: Add static props for additional SEO benefits
export async function getStaticProps() {
  return {
    props: {
      // You can add any props here if needed
    },
  };
}
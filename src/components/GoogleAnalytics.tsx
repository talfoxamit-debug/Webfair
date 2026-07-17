import Script from "next/script";

/**
 * Google Analytics 4, loaded only when NEXT_PUBLIC_GA_ID is set (a G-XXXXXXX
 * measurement id), so it stays dormant until Tal creates a GA4 property and
 * drops in the id. Runs alongside Vercel Analytics: GA4 adds funnels,
 * conversions, audiences, and the tie-in to Google Ads and Search Console.
 */
export default function GoogleAnalytics() {
  const id = process.env.NEXT_PUBLIC_GA_ID;
  if (!id) return null;
  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${id}`} strategy="afterInteractive" />
      <Script id="ga4-init" strategy="afterInteractive">
        {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}
gtag('js',new Date());gtag('config','${id}');`}
      </Script>
    </>
  );
}

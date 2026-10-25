import { Helmet } from "react-helmet";
import { SITE, assetUrl } from "../../config/site.js";

/** Per-route meta tags and schema.org JSON-LD (carried over from the legacy site). */
export default function SeoHead({ title, description, path = "/", isMenu = false }) {
  const url = `${SITE.url}${path}`;

  const restaurant = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    name: SITE.name,
    image: `${SITE.url}/${SITE.logoPath}`,
    "@id": SITE.url,
    url: SITE.url,
    telephone: `+${SITE.whatsappNumber}`,
    address: {
      "@type": "PostalAddress",
      streetAddress: SITE.address.street,
      addressLocality: SITE.address.locality,
      addressRegion: SITE.address.region,
      addressCountry: SITE.address.country,
    },
    geo: { "@type": "GeoCoordinates", latitude: SITE.geo.latitude, longitude: SITE.geo.longitude },
    openingHoursSpecification: SITE.hours.map((h) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: h.days,
      opens: h.opens,
      closes: h.closes,
    })),
    servesCuisine: SITE.cuisines,
    priceRange: SITE.priceRange,
    hasMenu: `${SITE.url}/menu`,
  };

  const menu = {
    "@context": "https://schema.org",
    "@type": "Menu",
    name: `${SITE.name} Official Menu`,
    url: `${SITE.url}/menu`,
    mainEntityOfPage: `${SITE.url}/menu`,
  };

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={`${SITE.url}/${SITE.logoPath}`} />
      <script type="application/ld+json">{JSON.stringify(isMenu ? [restaurant, menu] : restaurant)}</script>
      <link rel="icon" type="image/jpeg" href={assetUrl(SITE.logoPath)} />
    </Helmet>
  );
}

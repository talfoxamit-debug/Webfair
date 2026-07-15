import Hero from "@/components/Hero";
import IndustryGreeting from "@/components/IndustryGreeting";
import StickyCTA from "@/components/StickyCTA";
import FeaturedProjects from "@/components/FeaturedProjects";
import MetricsBand from "@/components/MetricsBand";
import SectionSeam from "@/components/SectionSeam";
import AuditSection from "@/components/AuditSection";
import DemoSection from "@/components/DemoSection";
import WhatYouGet from "@/components/WhatYouGet";
import HowItWorks from "@/components/HowItWorks";
import Testimonials from "@/components/Testimonials";
import Guarantee from "@/components/Guarantee";
import Faq from "@/components/Faq";
import FinalCTA from "@/components/FinalCTA";
import MockupModal from "@/components/MockupModal";
import AuditPopup from "@/components/AuditPopup";
import Footer from "@/components/Footer";
import JsonLd from "@/components/JsonLd";
import { site } from "@/lib/content";

const orgJsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "@id": `https://${site.domain}/#business`,
    name: "Stackwrk",
    description:
      "Stackwrk builds fast, conversion-focused websites and web apps for small businesses, engineered to turn visitors into bookings, leads, and revenue.",
    url: `https://${site.domain}`,
    email: site.email,
    legalName: site.legalEntity,
    priceRange: "$$",
    areaServed: "US",
    knowsAbout: [
      "Web development",
      "Conversion rate optimization",
      "Next.js",
      "Website design",
      "SEO",
      "Web applications",
    ],
    sameAs: [site.socials.linkedin, site.socials.github].filter(Boolean),
  },
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `https://${site.domain}/#website`,
    name: "Stackwrk",
    url: `https://${site.domain}`,
    publisher: { "@id": `https://${site.domain}/#business` },
  },
];

export default function Home() {
  return (
    <>
      <JsonLd data={orgJsonLd} />
      <Hero />
      <IndustryGreeting />
      {/* Free audit first: the highest-value, lowest-friction entry point */}
      <AuditSection />
      <DemoSection />
      <FeaturedProjects />
      <MetricsBand />
      <SectionSeam hue="violet" />
      <WhatYouGet />
      <HowItWorks />
      <Testimonials />
      <Guarantee />
      <Faq />
      <FinalCTA />
      <Footer />
      <StickyCTA />
      <MockupModal />
      <AuditPopup />
    </>
  );
}

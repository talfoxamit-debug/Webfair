import Hero from "@/components/Hero";
import IndustryGreeting from "@/components/IndustryGreeting";
import StickyCTA from "@/components/StickyCTA";
import FeaturedProjects from "@/components/FeaturedProjects";
import AuditSection from "@/components/AuditSection";
import DemoSection from "@/components/DemoSection";
import WhatYouGet from "@/components/WhatYouGet";
import HowItWorks from "@/components/HowItWorks";
import Testimonials from "@/components/Testimonials";
import Investment from "@/components/Investment";
import Plans from "@/components/Plans";
import Guarantee from "@/components/Guarantee";
import FinalCTA from "@/components/FinalCTA";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Hero />
      <IndustryGreeting />
      <FeaturedProjects />
      <AuditSection />
      <DemoSection />
      <WhatYouGet />
      <HowItWorks />
      <Testimonials />
      <Investment />
      <Plans />
      <Guarantee />
      <FinalCTA />
      <Footer />
      <StickyCTA />
    </>
  );
}

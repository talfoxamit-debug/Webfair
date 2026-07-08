import Hero from "@/components/Hero";
import FeaturedProjects from "@/components/FeaturedProjects";
import WhatYouGet from "@/components/WhatYouGet";
import Investment from "@/components/Investment";
import FinalCTA from "@/components/FinalCTA";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Hero />
      <FeaturedProjects />
      <WhatYouGet />
      <Investment />
      <FinalCTA />
      <Footer />
    </>
  );
}

import Hero from '@/components/marketing/Hero';
import Features from '@/components/marketing/Features';
import Testimonials from '@/components/marketing/Testimonials';
import CTA from '@/components/marketing/CTA';

export default function LandingPage() {
  return (
    <>
      <Hero />
      <div id="features">
        <Features />
      </div>
      <Testimonials />
      <CTA />
    </>
  );
}

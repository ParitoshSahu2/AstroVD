'use client';

import { Navbar } from '../components/Navbar';
import { HeroSection } from '../components/HeroSection';
import { ServicesCarousel } from '../components/ServicesCarousel';
import { AboutSection } from '../components/AboutSection';
import { ProductsSection } from '../components/ProductsSection';
import { PoojaServicesSection } from '../components/PoojaServicesSection';
import { GallerySection } from '../components/GallerySection';
import { BlogSection } from '../components/BlogSection';
import { FeedbackSection } from '../components/FeedbackSection';
import { SectionDivider } from '../components/SectionDivider';
import { Footer } from '../components/Footer';

export default function Home() {
  return (
    <div className="relative min-h-screen w-full bg-[#FAF7F2] m-0 p-0 overflow-x-clip">
      {/* Floating Translucent Rounded Glassmorphic Navbar */}
      <Navbar />

      {/* Hero Section with homepage.png and elegant, uncluttered Vedic typography */}
      <HeroSection />

      {/* 1. Our Services 3D Curved Carousel Section */}
      <div id="services">
        <ServicesCarousel />
      </div>

      {/* 1st Divider appears when Our Services section ends */}
      <SectionDivider />

      {/* 2. About Us Glimpse (Clean, impactful summary with Explore More About Us) */}
      <div id="about">
        <AboutSection isHomePage={true} />
      </div>

      {/* Divider after About Us */}
      <SectionDivider />

      {/* 3. Products Section (Showing 8 cards on home page with explore more) */}
      <div id="shop">
        <ProductsSection limit={8} showExploreMore={true} />
      </div>

      {/* Divider after Products */}
      <SectionDivider />

      {/* 4. Our Astrology & Pooja Services (Special Baby Girl Kundli Blessing Banner) */}
      <div id="pooja-services">
        <PoojaServicesSection />
      </div>

      {/* Divider after Pooja Services */}
      <SectionDivider />

      {/* 5. Divine Gallery & Sacred Rituals Showcase */}
      <div id="gallery">
        <GallerySection />
      </div>

      {/* Divider after Gallery */}
      <SectionDivider />

      {/* 6. Blog & Sacred Knowledge Section */}
      <div id="blog">
        <BlogSection />
      </div>

      {/* Divider after Blog */}
      <SectionDivider />

      {/* 7. Seeker Feedback & Reviews Section */}
      <div id="feedback">
        <FeedbackSection />
      </div>

      {/* Divider after Feedback */}
      <SectionDivider />

      {/* 7. Comprehensive Luxury Vedic Footer */}
      <Footer />
    </div>
  );
}

'use client';

import React from 'react';
import { Navbar } from '../../components/Navbar';
import { PageHeader } from '../../components/PageHeader';
import { AboutSection } from '../../components/AboutSection';
import { Footer } from '../../components/Footer';

export default function AboutPage() {
  return (
    <div className="relative min-h-screen w-full bg-[#FAF7F2] m-0 p-0 overflow-x-hidden selection:bg-amber-400">
      <Navbar />

      <main className="w-full">
        <AboutSection isHomePage={false} />
      </main>

      <Footer />
    </div>
  );
}

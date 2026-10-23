'use client';

import React from 'react';
import { Navbar } from '../../components/Navbar';
import { PageHeader } from '../../components/PageHeader';
import { AboutSection } from '../../components/AboutSection';
import { Footer } from '../../components/Footer';
import { useLanguage } from '../../context/LanguageContext';

export default function AboutPage() {
  const { t } = useLanguage();

  return (
    <div className="relative min-h-screen w-full bg-[#FAF7F2] m-0 p-0 overflow-x-clip selection:bg-amber-400">
      <Navbar />

      <PageHeader
        breadcrumb={t('About Us', 'परिचय एवं परंपरा')}
        title={t('About Dr. Pandit Vishal Dubey & Sacred Lineage', 'पूज्य डॉ. पंडित विशाल दुबे एवं पावन वैदिक परंपरा')}
        subtitle={t(
          'Preserving ancient Varanasi astrological traditions under the revered guidance of Gold Medalist Dr. Pandit Vishal Dubey (AstroVD) — bridging ancient Jyotish Shastras with medical insight and profound spiritual wisdom.',
          'स्वर्ण पदक विजेता डॉ. पंडित विशाल दुबे (AstroVD) के सानिध्य में प्राचीन काशी ज्योतिष परंपरा — वैदिक शास्त्रों, वैज्ञानिक दृष्टिकोण एवं गहन आध्यात्मिक ज्ञान का अद्भुत संगम।'
        )}
      />

      <main className="w-full">
        <AboutSection isHomePage={false} />
      </main>

      <Footer />
    </div>
  );
}

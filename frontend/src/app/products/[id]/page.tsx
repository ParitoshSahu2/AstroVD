import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import { PRODUCTS_CATALOG } from '../../../data/products';
import { ProductDetailClient } from './ProductDetailClient';

export async function generateStaticParams() {
  return PRODUCTS_CATALOG.map((product) => ({
    id: product.id,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const product = PRODUCTS_CATALOG.find(
    (p) =>
      p.id.toLowerCase() === id.toLowerCase() ||
      p.name.toLowerCase().replace(/\s+/g, '-') === id.toLowerCase()
  );

  if (!product) {
    return {
      title: 'Sacred Product Not Found | AstroVD',
      description: 'The requested consecrated talisman or bracelet could not be found.',
    };
  }

  return {
    title: `${product.name} | Consecrated Vedic Gemstone & Rudraksha | AstroVD`,
    description: product.desc,
  };
}

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

async function ProductDetailWrapper({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ProductDetailClient productId={id} />;
}

export default function ProductDetailPage({ params }: ProductPageProps) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center">
          <div className="w-12 h-12 rounded-full border-4 border-amber-300 border-t-[#5B0D15] animate-spin" />
        </div>
      }
    >
      <ProductDetailWrapper params={params} />
    </Suspense>
  );
}

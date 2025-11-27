'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';

interface ProductImage {
  src: string;
  alt: string;
  available: boolean;
}

export default function ShowcaseGallery() {
  const [products, setProducts] = useState<ProductImage[]>([
    { src: '/images/showcase/product-1.jpg', alt: 'Product 1', available: false },
    { src: '/images/showcase/product-2.jpg', alt: 'Product 2', available: false },
    { src: '/images/showcase/product-3.jpg', alt: 'Product 3', available: false },
    { src: '/images/showcase/product-4.jpg', alt: 'Product 4', available: false },
    { src: '/images/showcase/product-5.jpg', alt: 'Product 5', available: false },
    { src: '/images/showcase/product-6.jpg', alt: 'Product 6', available: false },
  ]);

  useEffect(() => {
    // Check which images are available
    products.forEach((product, index) => {
      const img = new window.Image();
      img.src = product.src;
      img.onload = () => {
        setProducts((prev) =>
          prev.map((p, i) => (i === index ? { ...p, available: true } : p))
        );
      };
    });
  }, []);

  const availableProducts = products.filter((p) => p.available);

  // Don't show section if no images available
  if (availableProducts.length === 0) {
    return null;
  }

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-secondary mb-4">
            See It In Action
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Real examples of products transformed with our AI-powered virtual try-on technology
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {availableProducts.map((product, index) => (
            <div
              key={index}
              className="group relative aspect-square bg-gray-100 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow"
            >
              <Image
                src={product.src}
                alt={product.alt}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

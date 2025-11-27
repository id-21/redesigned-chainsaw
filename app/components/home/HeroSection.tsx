'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function HeroSection() {
  const [hasHeroImage, setHasHeroImage] = useState(false);

  useEffect(() => {
    // Check if hero image exists
    const img = new window.Image();
    img.src = '/images/hero/hero-background.png';
    img.onload = () => setHasHeroImage(true);
    img.onerror = () => setHasHeroImage(false);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image - Only show if exists */}
      {hasHeroImage && (
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/hero/hero-background.png"
            alt="Hero background"
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-secondary/60" />
        </div>
      )}

      {/* Fallback gradient background if no image */}
      {!hasHeroImage && (
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-secondary via-secondary-light to-accent" />
      )}

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6">
          Transform Your Products with AI
        </h1>
        <p className="text-xl sm:text-2xl text-neutral-light mb-8 max-w-3xl mx-auto">
          Create stunning virtual try-on images in seconds. Showcase your products in lifestyle settings with the power of AI.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            href="/virtual-tryon"
            className="px-8 py-4 bg-primary text-secondary font-semibold rounded-lg hover:bg-primary-dark transition-colors shadow-lg text-lg"
          >
            Get Started Free
          </Link>
          <button className="px-8 py-4 bg-white/10 text-white font-semibold rounded-lg hover:bg-white/20 transition-colors border-2 border-white/30 backdrop-blur-sm text-lg">
            Watch Demo
          </button>
        </div>

        {/* Feature badges */}
        <div className="mt-12 flex flex-wrap gap-6 justify-center text-white/90 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-primary text-xl">✓</span>
            <span>No credit card required</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-primary text-xl">✓</span>
            <span>AI-powered results</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-primary text-xl">✓</span>
            <span>Instant generation</span>
          </div>
        </div>
      </div>
    </section>
  );
}

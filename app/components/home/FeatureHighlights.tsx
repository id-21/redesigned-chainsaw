'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';

interface Feature {
  icon: string;
  title: string;
  description: string;
  hasIcon: boolean;
}

export default function FeatureHighlights() {
  const [features, setFeatures] = useState<Feature[]>([
    {
      icon: '/images/features/feature-1.svg',
      title: 'AI-Powered Accuracy',
      description: 'Advanced AI ensures realistic, high-quality virtual try-on results every time.',
      hasIcon: false,
    },
    {
      icon: '/images/features/feature-2.svg',
      title: 'Instant Results',
      description: 'Generate professional product images in seconds, not hours or days.',
      hasIcon: false,
    },
    {
      icon: '/images/features/feature-3.svg',
      title: 'Multiple Styles',
      description: 'Create model shots, lifestyle scenes, and room settings with ease.',
      hasIcon: false,
    },
    {
      icon: '/images/features/feature-4.svg',
      title: 'High-Quality Output',
      description: 'Professional-grade images ready for your marketing and e-commerce needs.',
      hasIcon: false,
    },
  ]);

  useEffect(() => {
    // Check which feature icons are available
    features.forEach((feature, index) => {
      const img = new window.Image();
      img.src = feature.icon;
      img.onload = () => {
        setFeatures((prev) =>
          prev.map((f, i) => (i === index ? { ...f, hasIcon: true } : f))
        );
      };
      // Also try PNG fallback
      img.onerror = () => {
        const pngImg = new window.Image();
        pngImg.src = feature.icon.replace('.svg', '.png');
        pngImg.onload = () => {
          setFeatures((prev) =>
            prev.map((f, i) =>
              i === index ? { ...f, icon: pngImg.src, hasIcon: true } : f
            )
          );
        };
      };
    });
  }, []);

  // Fallback emoji icons
  const emojiIcons = ['🎯', '⚡', '🎨', '✨'];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-secondary mb-4">
            Why Choose Our Platform
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Everything you need to create stunning product visualizations
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="text-center p-6 rounded-xl hover:bg-gray-50 transition-colors"
            >
              {/* Icon */}
              <div className="mb-4 flex justify-center">
                {feature.hasIcon ? (
                  <div className="relative w-16 h-16">
                    <Image
                      src={feature.icon}
                      alt={feature.title}
                      fill
                      className="object-contain"
                    />
                  </div>
                ) : (
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-4xl">
                    {emojiIcons[index]}
                  </div>
                )}
              </div>

              {/* Content */}
              <h3 className="text-xl font-semibold text-secondary mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

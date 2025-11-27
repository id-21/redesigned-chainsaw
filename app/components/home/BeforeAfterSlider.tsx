'use client';

import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';

interface BeforeAfterPair {
  before: string;
  after: string;
  label: string;
  available: boolean;
}

export default function BeforeAfterSlider() {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const [demos, setDemos] = useState<BeforeAfterPair[]>([
    {
      before: '/images/before-after/demo-1-before.jpg',
      after: '/images/before-after/demo-1-after.jpg',
      label: 'Model Shot',
      available: false,
    },
    {
      before: '/images/before-after/demo-2-before.jpg',
      after: '/images/before-after/demo-2-after.jpg',
      label: 'Lifestyle Scene',
      available: false,
    },
    {
      before: '/images/before-after/demo-3-before.jpg',
      after: '/images/before-after/demo-3-after.jpg',
      label: 'Room Scene',
      available: false,
    },
  ]);

  const [currentDemo, setCurrentDemo] = useState(0);

  useEffect(() => {
    // Check which demo pairs are available
    demos.forEach((demo, index) => {
      const beforeImg = new window.Image();
      const afterImg = new window.Image();
      let beforeLoaded = false;
      let afterLoaded = false;

      const checkBothLoaded = () => {
        if (beforeLoaded && afterLoaded) {
          setDemos((prev) =>
            prev.map((d, i) => (i === index ? { ...d, available: true } : d))
          );
        }
      };

      beforeImg.src = demo.before;
      beforeImg.onload = () => {
        beforeLoaded = true;
        checkBothLoaded();
      };

      afterImg.src = demo.after;
      afterImg.onload = () => {
        afterLoaded = true;
        checkBothLoaded();
      };
    });
  }, []);

  const availableDemos = demos.filter((d) => d.available);

  // Don't show section if no demos available
  if (availableDemos.length === 0) {
    return null;
  }

  const handleMove = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
  };

  const handleMouseDown = () => setIsDragging(true);
  const handleMouseUp = () => setIsDragging(false);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) handleMove(e.clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches[0]) handleMove(e.touches[0].clientX);
  };

  const currentPair = availableDemos[currentDemo];

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-secondary mb-4">
            Before & After
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            See the transformation. Drag the slider to compare original products with AI-generated results.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Slider Container */}
          <div
            ref={containerRef}
            className="relative aspect-square bg-gray-200 rounded-xl overflow-hidden shadow-xl cursor-ew-resize select-none"
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseUp}
            onTouchStart={() => setIsDragging(true)}
            onTouchEnd={() => setIsDragging(false)}
            onTouchMove={handleTouchMove}
          >
            {/* After Image (Background) */}
            <div className="absolute inset-0">
              <Image
                src={currentPair.after}
                alt="After"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 1024px"
              />
              <div className="absolute top-4 right-4 bg-primary text-secondary px-4 py-2 rounded-lg font-semibold shadow-lg">
                After
              </div>
            </div>

            {/* Before Image (Clipped) */}
            <div
              className="absolute inset-0"
              style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
            >
              <Image
                src={currentPair.before}
                alt="Before"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 1024px"
              />
              <div className="absolute top-4 left-4 bg-white text-secondary px-4 py-2 rounded-lg font-semibold shadow-lg">
                Before
              </div>
            </div>

            {/* Slider Handle */}
            <div
              className="absolute top-0 bottom-0 w-1 bg-white shadow-lg"
              style={{ left: `${sliderPosition}%` }}
            >
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full shadow-xl flex items-center justify-center">
                <div className="flex gap-1">
                  <div className="w-1 h-6 bg-gray-400 rounded"></div>
                  <div className="w-1 h-6 bg-gray-400 rounded"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Demo Selector */}
          {availableDemos.length > 1 && (
            <div className="flex gap-4 justify-center mt-8">
              {availableDemos.map((demo, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setCurrentDemo(index);
                    setSliderPosition(50);
                  }}
                  className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                    index === currentDemo
                      ? 'bg-primary text-secondary'
                      : 'bg-white text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {demo.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

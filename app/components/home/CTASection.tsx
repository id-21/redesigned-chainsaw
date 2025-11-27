import Link from 'next/link';

export default function CTASection() {
  return (
    <section className="py-20 bg-gradient-to-br from-secondary via-secondary-light to-accent">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
          Ready to Transform Your Products?
        </h2>
        <p className="text-xl text-neutral-light mb-8">
          Join thousands of businesses creating stunning product images with AI
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/virtual-tryon"
            className="px-8 py-4 bg-primary text-secondary font-semibold rounded-lg hover:bg-primary-dark transition-colors shadow-lg text-lg inline-block"
          >
            Start Creating Now
          </Link>
          <Link
            href="/virtual-tryon"
            className="px-8 py-4 bg-white/10 text-white font-semibold rounded-lg hover:bg-white/20 transition-colors border-2 border-white/30 backdrop-blur-sm text-lg inline-block"
          >
            View Examples
          </Link>
        </div>

        <p className="mt-6 text-neutral-light text-sm">
          No credit card required • 3 free demos • Instant access
        </p>
      </div>
    </section>
  );
}

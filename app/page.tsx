import HeroSection from "./components/home/HeroSection";
import ShowcaseGallery from "./components/home/ShowcaseGallery";
import BeforeAfterSlider from "./components/home/BeforeAfterSlider";
import FeatureHighlights from "./components/home/FeatureHighlights";
import CTASection from "./components/home/CTASection";
import Footer from "./components/home/Footer";

export default function Home() {
  return (
    <main className="min-h-screen">
      <HeroSection />
      <ShowcaseGallery />
      <BeforeAfterSlider />
      <FeatureHighlights />
      <CTASection />
      <Footer />
    </main>
  );
}

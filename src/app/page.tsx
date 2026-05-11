import Navbar from "@/app/_components/landing/Navbar";
import HeroSection from "@/app/_components/landing/HeroSection";
import FeaturesSection from "@/app/_components/landing/FeaturesSection";
import HowItWorksSection from "@/app/_components/landing/HowItWorksSection";
import InstallSection from "@/app/_components/landing/InstallSection";
import Footer from "@/app/_components/landing/Footer";

export default function HomePage(): React.JSX.Element {
  return (
    <div className="min-h-screen bg-[#111] text-gray-100">
      <Navbar />
      <main>
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
        <InstallSection />
      </main>
      <Footer />
    </div>
  );
}

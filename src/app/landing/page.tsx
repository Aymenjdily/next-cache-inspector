import Navbar from "@/app/_components/landing/Navbar";
import HeroSection from "@/app/_components/landing/HeroSection";
import FeaturesSection from "@/app/_components/landing/FeaturesSection";
import HowItWorksSection from "@/app/_components/landing/HowItWorksSection";
import InstallSection from "@/app/_components/landing/InstallSection";
import Footer from "@/app/_components/landing/Footer";

export default function LandingPage(): React.JSX.Element {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
        <InstallSection />
      </main>
      <Footer />
    </>
  );
}

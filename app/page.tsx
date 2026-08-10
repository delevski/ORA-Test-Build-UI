import Preloader from "@/components/preloader/Preloader";
import Navigation from "@/components/navigation/Navigation";
import Hero from "@/components/hero/Hero";
import CinematicScene from "@/components/cinematic-scene/CinematicScene";
import { PlantSilhouette, RailingSilhouette } from "@/components/cinematic-scene/foregrounds";
import Stats from "@/components/stats/Stats";
import WhySection from "@/components/why-section/WhySection";
import ResidenceGallery from "@/components/residence-gallery/ResidenceGallery";
import HorizontalStrip from "@/components/residence-gallery/HorizontalStrip";
import BuildingMarquee from "@/components/building-marquee/BuildingMarquee";
import RibbonMarquee from "@/components/ribbon-marquee/RibbonMarquee";
import { IMAGES } from "@/lib/images";

export default function Home() {
  return (
    <main>
      <Preloader />
      <Navigation />
      <Hero />
      <CinematicScene
        chapter="01" eyebrow="THE APPROACH" title="The city disappears beneath you"
        image={IMAGES.approach} midground={IMAGES.approachMid}
        foreground={<PlantSilhouette className="absolute bottom-0 h-full w-full" />}
        variant="parallax-depth"
      />
      <CinematicScene
        chapter="02" eyebrow="THE ARRIVAL" title="Your elevator opens directly into the sky"
        image={IMAGES.arrival} variant="vertical-mask"
      />
      <CinematicScene
        chapter="03" eyebrow="THE INTERIOR" title="Stone, glass and endless horizon"
        image={IMAGES.interiorA} imageB={IMAGES.interiorB} variant="crossfade" id="residence"
      />
      <CinematicScene
        chapter="04" eyebrow="THE TERRACE" title="The Mediterranean at your feet"
        image={IMAGES.terrace}
        foreground={<RailingSilhouette className="absolute bottom-0 h-full w-full" />}
        variant="parallax-depth"
      />
      <Stats />
      <WhySection />
      <ResidenceGallery />
      <HorizontalStrip />
      <BuildingMarquee />
      <RibbonMarquee />
      <div className="h-screen" />
    </main>
  );
}

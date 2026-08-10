import Hero from "@/components/hero/Hero";
import Preloader from "@/components/preloader/Preloader";
import Navigation from "@/components/navigation/Navigation";

export default function Home() {
  return (
    <main>
      <Preloader />
      <Navigation />
      <Hero />
      <section data-theme="light" className="bg-bone h-screen" />
      <div className="h-screen" />
    </main>
  );
}

import Hero from "@/components/hero/Hero";
import Preloader from "@/components/preloader/Preloader";

export default function Home() {
  return (
    <main>
      <Preloader />
      <Hero />
      <div className="h-screen" />
    </main>
  );
}

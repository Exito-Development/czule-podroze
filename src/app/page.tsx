import Hero from "@/components/sections/Hero";
import Marquee from "@/components/sections/Marquee";
import About from "@/components/sections/About";
import Destinations from "@/components/sections/Destinations";
import Itinerary from "@/components/sections/Itinerary";
import Workshops from "@/components/sections/Workshops";
import WhyUs from "@/components/sections/WhyUs";
import Hosts from "@/components/sections/Hosts";
import CtaJoin from "@/components/sections/CtaJoin";
import Social from "@/components/sections/Social";
import Footer from "@/components/layout/Footer";
import WaveDivider from "@/components/ui/WaveDivider";

export default function Home() {
  return (
    <main>
      {/* Hero jest „fixed" w tle (z-0) */}
      <Hero />

      {/* Treść nasuwa się na hero: mt-[100svh] odsłania hero na starcie,
          a solidne tło (bg-ivory) + z-10 sprawiają, że przy scrollu
          treść przykrywa przyklejony hero. Faliste WaveDividery oddzielają
          sekcje o różnych pastelowych tłach. */}
      <div className="relative z-10 mt-[100svh] bg-ivory">
        <Marquee />
        <About />

        <WaveDivider bg="var(--color-ivory)" fill="var(--color-cream)" />
        <Destinations />
        <WaveDivider
          bg="var(--color-cream)"
          fill="var(--color-ivory)"
          flip
        />

        <Itinerary />
        <Workshops />

        <WhyUs />
        <WaveDivider
          bg="var(--color-sage-pale)"
          fill="var(--color-blush-pale)"
          flip
        />

        <Hosts />
        <WaveDivider bg="var(--color-blush-pale)" fill="var(--color-ivory)" />

        <Social />
        <CtaJoin />
        <Footer />
      </div>
    </main>
  );
}

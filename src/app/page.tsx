import Hero from "@/components/sections/Hero";
import Marquee from "@/components/sections/Marquee";
import About from "@/components/sections/About";
import Destinations from "@/components/sections/Destinations";
import TripTimeline from "@/components/sections/TripTimeline";
import Workshops from "@/components/sections/Workshops";
import WhyUs from "@/components/sections/WhyUs";
import Hosts from "@/components/sections/Hosts";
import CtaJoin from "@/components/sections/CtaJoin";
import Social from "@/components/sections/Social";
import FooterReveal from "@/components/layout/FooterReveal";
import WaveDivider from "@/components/ui/WaveDivider";

export default function Home() {
  return (
    <main>
      {/* Hero jest „fixed" w tle (z-0) */}
      <Hero />

      {/* Treść nasuwa się na hero: mt-[100svh] odsłania hero na starcie,
          a solidne tło (bg-ivory) + z-10 sprawiają, że przy scrollu
          treść przykrywa przyklejony hero. To samo z-10 sprawia, że stopka
          (fixed, z-0) czeka schowana pod treścią i wynurza się dopiero
          na samym końcu — patrz <FooterReveal />. */}
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

        <TripTimeline />
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
      </div>

      {/* Okno, w którym spod sekcji „Chcę jechać!" wynurza się stopka. */}
      <FooterReveal />
    </main>
  );
}

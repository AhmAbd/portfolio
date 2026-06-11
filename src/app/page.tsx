import { Nav } from "@/components/Nav";
import { ScanHud } from "@/components/ScanHud";
import { SmoothScroll } from "@/components/SmoothScroll";
import { Hero } from "@/components/sections/Hero";
import { About } from "@/components/sections/About";
import { Projects } from "@/components/sections/Projects";
import { ContributionGraph } from "@/components/sections/ContributionGraph";
import { Skills } from "@/components/sections/Skills";
import { Experience } from "@/components/sections/Experience";
import { Contact } from "@/components/sections/Contact";

export default function Home() {
  return (
    <div id="top">
      <SmoothScroll />
      <ScanHud />
      <Nav />
      <main>
        <Hero />
        <About />
        <Projects />
        <ContributionGraph />
        <Skills />
        <Experience />
      </main>
      <Contact />
    </div>
  );
}

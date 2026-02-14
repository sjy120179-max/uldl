import { Hero } from "@/components/main/hero";
import { Navbar } from "@/components/navbar";

export default function Home() {
  return (
    <main className="w-full relative min-h-screen">
      <Navbar />
      <Hero />
    </main>
  );
}
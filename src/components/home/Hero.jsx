import HeroContent from "./HeroContent";
import HeroImage from "./HeroImage";

export default function Hero() {
  return (
    <section className="min-h-[90vh] flex items-center">
      <div className="container mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">

        <HeroContent />

        <HeroImage />

      </div>
    </section>
  );
}
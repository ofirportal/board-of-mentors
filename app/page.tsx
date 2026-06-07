import { MENTORS } from "@/lib/mentors";
import MentorCard from "@/components/MentorCard";

export default function Home() {
  return (
    <main
      className="min-h-screen"
      style={{ background: "#0a0a0c" }}
    >
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-12 text-center">
          <p className="text-xs tracking-[0.3em] text-white/30 uppercase mb-3">OFIR Multi Family Office</p>
          <h1
            className="text-4xl md:text-5xl text-white font-light mb-3"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            Board of Mentors
          </h1>
          <p className="text-white/35 text-sm max-w-md mx-auto leading-relaxed">
            Doce mentes extraordinarias. Conocimiento real. Disponibles cuando los necesitás.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {MENTORS.map((mentor) => (
            <MentorCard key={mentor.id} mentor={mentor} />
          ))}
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-white/15 text-xs">
          Las respuestas no son asesoramiento. Son perspectivas para pensar mejor.
        </div>
      </div>
    </main>
  );
}

import { MENTORS } from "@/lib/mentors";
import ChatWindow from "@/components/ChatWindow";
import Link from "next/link";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function MentorPage({ params }: Props) {
  const { id } = await params;
  const mentor = MENTORS.find((m) => m.id === id);

  if (!mentor) notFound();

  return (
    <div
      className="flex flex-col h-screen"
      style={{ background: "#0a0a0c" }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-4 px-5 py-4 border-b flex-shrink-0"
        style={{
          background: `${mentor.color}cc`,
          borderColor: `${mentor.accentColor}25`,
        }}
      >
        <Link
          href="/"
          className="text-white/40 hover:text-white/80 transition-colors p-1 -ml-1"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>

        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
          style={{
            background: `${mentor.accentColor}25`,
            border: `1px solid ${mentor.accentColor}50`,
            color: mentor.accentColor,
          }}
        >
          {mentor.initials}
        </div>

        <div className="flex-1 min-w-0">
          <h2
            className="text-white font-semibold text-base leading-tight"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            {mentor.name}
          </h2>
          <p className="text-white/35 text-xs truncate">{mentor.role}</p>
        </div>

        <span
          className="text-xs px-2.5 py-1 rounded-full hidden sm:block"
          style={{
            background: `${mentor.accentColor}15`,
            color: mentor.accentColor,
            border: `1px solid ${mentor.accentColor}30`,
          }}
        >
          {mentor.tag}
        </span>
      </div>

      {/* Chat */}
      <div className="flex-1 overflow-hidden">
        <ChatWindow mentor={mentor} />
      </div>
    </div>
  );
}

export function generateStaticParams() {
  return MENTORS.map((m) => ({ id: m.id }));
}

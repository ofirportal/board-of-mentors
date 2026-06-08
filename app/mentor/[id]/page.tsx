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
      style={{ background: "#f5f2ec" }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-4 px-5 py-4 border-b flex-shrink-0"
        style={{
          background: "#ffffff",
          borderColor: "rgba(0,0,0,0.08)",
        }}
      >
        <Link
          href="/"
          className="transition-colors p-1 -ml-1"
          style={{ color: "#9c9890" }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>

        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
          style={{
            background: `${mentor.accentColor}20`,
            border: `1.5px solid ${mentor.accentColor}50`,
            color: mentor.accentColor,
          }}
        >
          {mentor.initials}
        </div>

        <div className="flex-1 min-w-0">
          <h2
            className="font-semibold text-base leading-tight"
            style={{ fontFamily: "'Cormorant Garamond', serif", color: "#1a1a1a" }}
          >
            {mentor.name}
          </h2>
          <p className="text-xs truncate" style={{ color: "#9c9890" }}>{mentor.role}</p>
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

"use client";

import Link from "next/link";
import { Mentor } from "@/lib/mentors";

interface Props {
  mentor: Mentor;
}

export default function MentorCard({ mentor }: Props) {
  return (
    <Link href={`/mentor/${mentor.id}`} className="group block">
      <div
        className="relative overflow-hidden rounded-xl border transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl"
        style={{
          background: mentor.color,
          borderColor: `${mentor.accentColor}30`,
          boxShadow: `0 0 0 0 ${mentor.accentColor}`,
        }}
      >
        {/* Accent glow on hover */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-xl"
          style={{ background: mentor.accentColor }}
        />

        <div className="p-5">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            {/* Initials avatar */}
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold tracking-wider"
              style={{
                background: `${mentor.accentColor}25`,
                border: `1px solid ${mentor.accentColor}50`,
                color: mentor.accentColor,
              }}
            >
              {mentor.initials}
            </div>
            {/* Tag */}
            <span
              className="text-xs px-2.5 py-1 rounded-full font-medium tracking-wide"
              style={{
                background: `${mentor.accentColor}15`,
                color: mentor.accentColor,
                border: `1px solid ${mentor.accentColor}30`,
              }}
            >
              {mentor.tag}
            </span>
          </div>

          {/* Name + Role */}
          <h3 className="text-white font-semibold text-base leading-tight mb-0.5" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            {mentor.name}
          </h3>
          <p className="text-white/40 text-xs leading-snug mb-4">{mentor.role}</p>

          {/* Welcome preview */}
          <p className="text-white/55 text-xs leading-relaxed line-clamp-2">
            "{mentor.welcomeMessage.slice(0, 80)}..."
          </p>

          {/* CTA */}
          <div
            className="mt-4 flex items-center gap-1.5 text-xs font-medium transition-colors"
            style={{ color: mentor.accentColor }}
          >
            <span>Consultar</span>
            <svg className="w-3.5 h-3.5 translate-x-0 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
    </Link>
  );
}

'use client';

// Gemini-style 4-color sparkle star — matches the exact logo from screenshots
export default function GeminiStar({ size = 28 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 28 28"
      fill="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="gs-a" x1="0" y1="0" x2="28" y2="28" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#4285F4" />
          <stop offset="40%" stopColor="#9B5CF5" />
          <stop offset="100%" stopColor="#EA4335" />
        </linearGradient>
        <linearGradient id="gs-b" x1="28" y1="28" x2="0" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FBBC04" />
          <stop offset="50%" stopColor="#34A853" />
          <stop offset="100%" stopColor="#4285F4" />
        </linearGradient>
      </defs>
      {/* Top-right arm */}
      <path
        d="M14 0 C14 6 20 10 28 14 C20 14 14 18 14 28 C14 18 8 14 0 14 C8 14 14 10 14 0 Z"
        fill="url(#gs-a)"
      />
    </svg>
  );
}

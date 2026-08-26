type IconProps = { className?: string };

const base = "h-7 w-7";

/** Minimalny, liniowy zestaw ikon w klimacie marki. */
export function Icon({
  name,
  className = base,
}: {
  name: string;
  className?: string;
}) {
  switch (name) {
    case "sparkle":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className}>
          <path
            d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3z"
            stroke="currentColor"
            strokeWidth="1.3"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "heart":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className}>
          <path
            d="M12 20s-7-4.6-7-9.4A3.6 3.6 0 0112 7a3.6 3.6 0 017 3.6C19 15.4 12 20 12 20z"
            stroke="currentColor"
            strokeWidth="1.3"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "users":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className}>
          <circle cx="9" cy="8" r="3" stroke="currentColor" strokeWidth="1.3" />
          <path
            d="M3 19a6 6 0 0112 0M16 6a3 3 0 010 6M18 19a5.5 5.5 0 00-3-4.9"
            stroke="currentColor"
            strokeWidth="1.3"
            strokeLinecap="round"
          />
        </svg>
      );
    case "compass":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className}>
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.3" />
          <path
            d="M15.5 8.5l-2 5-5 2 2-5 5-2z"
            stroke="currentColor"
            strokeWidth="1.3"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "camera":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className}>
          <path
            d="M4 8h3l1.5-2h7L17 8h3v10H4V8z"
            stroke="currentColor"
            strokeWidth="1.3"
            strokeLinejoin="round"
          />
          <circle cx="12" cy="13" r="3" stroke="currentColor" strokeWidth="1.3" />
        </svg>
      );
    case "plane":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className}>
          <path
            d="M10 13l-7 2 2-3-2-3 7 2 5-6 2 1-2 6 4 3-1 2-5-3-3 5-1-3z"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "palm":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className}>
          <path
            d="M12 21V9M12 9c-3-3-7-2-8 0 2-1 5 0 6 2M12 9c3-3 7-2 8 0-2-1-5 0-6 2M12 9c0-4 3-6 6-5-2 1-3 3-3 5"
            stroke="currentColor"
            strokeWidth="1.3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "dolphin":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className}>
          <path
            d="M3 14c4 1 6-1 8-5 1 2 3 3 5 2-1 3-4 6-9 6-2 0-3-1-4-3z"
            stroke="currentColor"
            strokeWidth="1.3"
            strokeLinejoin="round"
          />
          <path d="M11 9c1-2 3-3 5-2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
        </svg>
      );
    case "sun":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className}>
          <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.3" />
          <path
            d="M12 2v2.5M12 19.5V22M4.2 4.2l1.8 1.8M18 18l1.8 1.8M2 12h2.5M19.5 12H22M4.2 19.8l1.8-1.8M18 6l1.8-1.8"
            stroke="currentColor"
            strokeWidth="1.3"
            strokeLinecap="round"
          />
        </svg>
      );
    case "instagram":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className}>
          <rect x="4" y="4" width="16" height="16" rx="4.5" stroke="currentColor" strokeWidth="1.3" />
          <circle cx="12" cy="12" r="3.5" stroke="currentColor" strokeWidth="1.3" />
          <circle cx="17" cy="7" r="1" fill="currentColor" />
        </svg>
      );
    default:
      return null;
  }
}

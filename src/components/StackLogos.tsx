import type { SVGProps } from "react";

type Props = SVGProps<SVGSVGElement>;

/** Simplified, monochrome-friendly marks for the "Built with" row. */

export const NextMark = (p: Props) => (
  <svg viewBox="0 0 24 24" width={20} height={20} fill="none" {...p}>
    <circle cx="12" cy="12" r="11" stroke="currentColor" strokeWidth="1.4" />
    <path
      d="M8 8v8M8 8l8 10M16 8v6"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
    />
  </svg>
);

export const TypeScriptMark = (p: Props) => (
  <svg viewBox="0 0 24 24" width={20} height={20} {...p}>
    <rect x="2" y="2" width="20" height="20" rx="3" fill="#3178C6" />
    <path
      d="M12.7 13.4h2.1v1.5h-1.3V19h-1.7v-4.1h-1.3v-1.5h2.2Zm2.9 4.9c.5.3 1.2.5 1.9.5 1.5 0 2.5-.8 2.5-2 0-1-.6-1.5-1.8-2-.7-.3-.9-.5-.9-.8 0-.3.2-.5.7-.5.5 0 1 .2 1.4.4l.4-1.3c-.5-.2-1-.3-1.7-.3-1.4 0-2.3.8-2.3 1.9 0 1 .7 1.5 1.8 1.9.6.2.8.4.8.7 0 .3-.3.5-.8.5-.6 0-1.2-.2-1.6-.5Z"
      fill="#fff"
    />
  </svg>
);

export const TailwindMark = (p: Props) => (
  <svg viewBox="0 0 32 20" width={26} height={16} {...p}>
    <path
      d="M8 0C5.3 0 3.6 1.3 3 4c.9-1.2 1.9-1.6 3-1.4.6.2 1.1.6 1.6 1.2C11.5 4.9 12.5 6 15 6c2.7 0 4.4-1.3 5-4-.9 1.2-1.9 1.6-3 1.4-.6-.2-1.1-.6-1.6-1.2C11.5 1.1 10.5 0 8 0Zm-5 6c-2.7 0-4.4 1.3-5 4 .9-1.2 1.9-1.6 3-1.4.6.2 1.1.6 1.6 1.2C6.5 10.9 7.5 12 10 12c2.7 0 4.4-1.3 5-4-.9 1.2-1.9 1.6-3 1.4-.6-.2-1.1-.6-1.6-1.2C6.5 7.1 5.5 6 3 6Z"
      transform="translate(6 4)"
      fill="#38BDF8"
    />
  </svg>
);

export const SupabaseMark = (p: Props) => (
  <svg viewBox="0 0 24 24" width={18} height={18} {...p}>
    <path
      d="M13 2 4 13.2c-.5.6-.1 1.5.7 1.5h6v6.8c0 .9 1.2 1.3 1.7.6l9-11.2c.5-.6.1-1.5-.7-1.5h-6V2.7c0-.9-1.2-1.3-1.7-.7Z"
      fill="#3ECF8E"
    />
  </svg>
);

export const VercelMark = (p: Props) => (
  <svg viewBox="0 0 24 22" width={20} height={18} {...p}>
    <path d="M12 1 23 20H1L12 1Z" fill="currentColor" />
  </svg>
);

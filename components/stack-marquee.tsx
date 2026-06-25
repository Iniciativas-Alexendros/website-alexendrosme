import {
  siNextdotjs,
  siTypescript,
  siSupabase,
  siPrisma,
  siStripe,
  siTailwindcss,
  siTurborepo,
  siVercel,
  siResend,
  type SimpleIcon,
} from "simple-icons";

type StackItem = {
  icon: SimpleIcon;
  label: string;
  color: string;
  href: string;
};

const items: StackItem[] = [
  { icon: siNextdotjs, label: "Next.js", color: "currentColor", href: "https://nextjs.org" },
  {
    icon: siTypescript,
    label: "TypeScript",
    color: `#${siTypescript.hex}`,
    href: "https://www.typescriptlang.org",
  },
  {
    icon: siSupabase,
    label: "Supabase",
    color: `#${siSupabase.hex}`,
    href: "https://supabase.com",
  },
  {
    icon: siPrisma,
    label: "Prisma",
    color: `#${siPrisma.hex}`,
    href: "https://www.prisma.io",
  },
  { icon: siStripe, label: "Stripe", color: `#${siStripe.hex}`, href: "https://stripe.com" },
  {
    icon: siTailwindcss,
    label: "Tailwind",
    color: `#${siTailwindcss.hex}`,
    href: "https://tailwindcss.com",
  },
  {
    icon: siTurborepo,
    label: "Turborepo",
    color: `#${siTurborepo.hex}`,
    href: "https://turborepo.com",
  },
  { icon: siVercel, label: "Vercel", color: "currentColor", href: "https://vercel.com" },
  { icon: siResend, label: "Resend", color: "currentColor", href: "https://resend.com" },
];

function LogoRow({ count = 1, startIndex = 0 }: { count?: number; startIndex?: number }) {
  return (
    <>
      {Array.from({ length: count }, (_, i) => i + startIndex).map((rowIndex) => (
        <div key={rowIndex} className="marquee-row" aria-hidden={rowIndex > 0}>
          {items.map(({ icon, label, color, href }): React.ReactElement => {
            const content = (
              <>
                <span
                  aria-hidden
                  className="marquee-logo-glow"
                  style={{ background: `radial-gradient(circle, ${color} 0%, transparent 65%)` }}
                />
                <svg
                  role="img"
                  viewBox="0 0 24 24"
                  className="marquee-logo-img"
                  aria-label={icon.title}
                >
                  <path d={icon.path} fill="currentColor" />
                </svg>
              </>
            );

            const linkProps = rowIndex > 0 ? { tabIndex: -1, "aria-hidden": true as const } : {};

            return (
              <a
                key={`${label}-${rowIndex}`}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="marquee-item"
                style={{ color }}
                aria-label={`${icon.title} — ${href}`}
                {...linkProps}
              >
                <span className="marquee-logo-wrap">{content}</span>
                <span className="marquee-logo-label">{label}</span>
              </a>
            );
          })}
        </div>
      ))}
    </>
  );
}

export function StackMarquee() {
  return (
    <div className="marquee-viewport">
      <div className="marquee-track">
        <LogoRow count={2} />
      </div>
    </div>
  );
}

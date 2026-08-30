// Simple filled/rounded icons, consistent stroke-free style per the
// design system (no thin technical line icons).
import { SVGProps } from "react";

function Base(props: SVGProps<SVGSVGElement>) {
  return <svg viewBox="0 0 24 24" width={24} height={24} fill="currentColor" {...props} />;
}

export function DashboardIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Base {...props}>
      <path d="M12 2 2 9.5V21a1 1 0 0 0 1 1h6v-7h6v7h6a1 1 0 0 0 1-1V9.5L12 2Z" />
    </Base>
  );
}

export function FarmIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Base {...props}>
      <path d="M12 2C9 6 7 9 7 12a5 5 0 0 0 10 0c0-3-2-6-5-10Z" />
      <path d="M4 22c0-3 3-5 8-5s8 2 8 5v0H4v0Z" opacity={0.55} />
    </Base>
  );
}

export function AssistantIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Base {...props}>
      <path d="M12 2a9 9 0 0 0-9 9c0 1.8.55 3.47 1.5 4.86L3 21l5.4-1.42A9 9 0 1 0 12 2Z" />
    </Base>
  );
}

export function MarketIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Base {...props}>
      <path d="M3 9 5 3h14l2 6v1a3 3 0 0 1-3 3 3 3 0 0 1-2.5-1.35A3 3 0 0 1 13 13a3 3 0 0 1-2.5-1.35A3 3 0 0 1 8 13a3 3 0 0 1-3-3V9Z" />
      <path d="M4 12v9h16v-9" opacity={0.55} />
    </Base>
  );
}

export function ProfileIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Base {...props}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4.5 3.5-7 8-7s8 2.5 8 7v0H4v0Z" opacity={0.55} />
    </Base>
  );
}

export function CaseIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Base {...props}>
      <path d="M9 3a2 2 0 0 0-2 2v1H4a1 1 0 0 0-1 1v13a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V7a1 1 0 0 0-1-1h-3V5a2 2 0 0 0-2-2H9Zm0 3V5h6v1H9Z" />
      <path d="M7 12h10v2H7z" opacity={0.55} />
    </Base>
  );
}

export function BellIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Base {...props}>
      <path d="M12 2a6 6 0 0 0-6 6v3.5L4 15v1h16v-1l-2-3.5V8a6 6 0 0 0-6-6Z" />
      <path d="M9.5 19a2.5 2.5 0 0 0 5 0h-5Z" />
    </Base>
  );
}

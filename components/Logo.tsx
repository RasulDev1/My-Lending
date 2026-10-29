// Фирменный знак: синий градиентный куб (тот же, что в favicon.svg)
export function LogoMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="16 16 224 224" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="logo-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#3b82f6" />
          <stop offset="1" stopColor="#1d4ed8" />
        </linearGradient>
        <radialGradient id="logo-gl" cx=".3" cy=".18" r=".8">
          <stop offset="0" stopColor="#fff" stopOpacity=".38" />
          <stop offset=".6" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="logo-ed" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity=".55" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect x="16" y="16" width="224" height="224" rx="56" fill="url(#logo-bg)" />
      <rect x="16" y="16" width="224" height="224" rx="56" fill="url(#logo-gl)" />
      <rect x="17" y="17" width="222" height="222" rx="55" fill="none" stroke="url(#logo-ed)" strokeWidth="2" />
      <path d="M128 66 L182 97 V159 L128 190 L74 159 V97 Z" fill="none" stroke="#fff" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" opacity=".95" />
      <g stroke="#fff" strokeWidth="7" strokeLinecap="round">
        <path d="M128 128 V66" />
        <path d="M128 128 L182 159" />
        <path d="M128 128 L74 159" />
      </g>
      <circle cx="128" cy="128" r="14" fill="#fff" />
    </svg>
  );
}

export function Logo() {
  return (
    <a href="./" className="inline-flex items-center gap-3 text-lg font-semibold leading-none tracking-[-0.01em] text-ink no-underline">
      <LogoMark className="size-9 shrink-0" />
      Автоматизация Бизнеса
    </a>
  );
}

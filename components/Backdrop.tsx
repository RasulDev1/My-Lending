// Фон страницы: размытые цветные блики, сетка и стеклянные фигуры. Всё декоративное и едва заметное.
export function Backdrop() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* Мягкое свечение позади карточки */}
      <div className="absolute left-1/2 top-[34%] h-[520px] w-[760px] max-w-[140vw] -translate-x-1/2 rounded-full bg-[#3b6bff]/25 blur-[170px]" />
      <div className="absolute -left-40 top-[8%] size-[420px] rounded-full bg-[#9db4ff]/30 blur-[160px]" />
      <div className="absolute -right-40 bottom-[4%] size-[460px] rounded-full bg-[#b9c4e0]/45 blur-[180px]" />

      {/* Сетка, плавно затухающая к краям */}
      <svg className="absolute inset-0 size-full text-[#1f3fd1]/[0.11] [mask-image:radial-gradient(70%_60%_at_50%_30%,#000_20%,transparent_100%)]">
        <defs>
          <pattern id="grid" width="56" height="56" patternUnits="userSpaceOnUse">
            <path d="M56 0H0V56" fill="none" stroke="currentColor" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>

      {/* Стеклянные фигуры и линия графика по бокам, только на широких экранах */}
      <div className="absolute left-[7%] top-[30%] hidden h-44 w-44 rotate-[14deg] rounded-[34px] border border-white/70 bg-gradient-to-br from-[#7f9cff]/25 to-white/40 shadow-[0_30px_60px_-30px_rgb(31_63_209/.45)] backdrop-blur-md xl:block" />
      <div className="absolute left-[3%] top-[48%] hidden size-20 -rotate-[10deg] rounded-[24px] border border-white/70 bg-gradient-to-br from-[#3b6bff]/20 to-white/20 backdrop-blur-md xl:block" />
      <div className="absolute right-[6%] top-[22%] hidden size-32 -rotate-[16deg] rounded-[28px] border border-white/70 bg-gradient-to-br from-white/70 to-[#3b6bff]/20 shadow-[0_30px_60px_-30px_rgb(31_63_209/.35)] backdrop-blur-md xl:block" />
      <svg viewBox="0 0 240 120" className="absolute bottom-[12%] right-[5%] hidden w-60 text-[#1f3fd1]/35 xl:block" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 104 L52 78 L92 90 L140 44 L184 56 L236 12" />
        <circle cx="52" cy="78" r="3.5" fill="currentColor" />
        <circle cx="140" cy="44" r="3.5" fill="currentColor" />
        <circle cx="236" cy="12" r="3.5" fill="currentColor" />
      </svg>
    </div>
  );
}

// Фон страницы: светящиеся сферы, которые медленно перетекают друг в друга, тонкая сетка и стеклянные фигуры.
// Всё декоративное и едва заметное.
export function Backdrop() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* Световые сферы */}
      <div className="absolute left-1/2 top-[28%] h-[560px] w-[760px] max-w-[150vw] -translate-x-1/2 animate-[drift-a_22s_ease-in-out_infinite] rounded-full bg-[#4a6bff]/30 blur-[170px]" />
      <div className="absolute -left-32 top-[2%] size-[480px] animate-[drift-b_28s_ease-in-out_infinite] rounded-full bg-[#a98bff]/35 blur-[160px]" />
      <div className="absolute -right-32 top-[26%] size-[460px] animate-[drift-c_26s_ease-in-out_infinite] rounded-full bg-[#5fd0ff]/30 blur-[170px]" />
      <div className="absolute -bottom-40 left-[18%] size-[520px] animate-[drift-a_32s_ease-in-out_infinite] rounded-full bg-[#ffb8d9]/25 blur-[180px]" />

      {/* Сетка на грани видимости */}
      <svg className="absolute inset-0 size-full text-[#1f3fd1]/[0.07] [mask-image:radial-gradient(75%_65%_at_50%_30%,#000_15%,transparent_100%)]">
        <defs>
          <pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse">
            <path d="M48 0H0V48" fill="none" stroke="currentColor" strokeWidth=".5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>

      {/* Стеклянные фигуры и линия графика по бокам, только на широких экранах */}
      <div className="absolute left-[7%] top-[34%] hidden h-44 w-44 rotate-[14deg] rounded-[34px] border border-white/70 bg-gradient-to-br from-[#7f9cff]/25 to-white/40 shadow-[0_30px_60px_-30px_rgb(31_63_209/.45)] backdrop-blur-md xl:block" />
      <div className="absolute left-[3%] top-[52%] hidden size-20 -rotate-[10deg] rounded-[24px] border border-white/70 bg-gradient-to-br from-[#3b6bff]/20 to-white/20 backdrop-blur-md xl:block" />
      <div className="absolute right-[6%] top-[30%] hidden size-32 -rotate-[16deg] rounded-[28px] border border-white/70 bg-gradient-to-br from-white/70 to-[#3b6bff]/20 shadow-[0_30px_60px_-30px_rgb(31_63_209/.35)] backdrop-blur-md xl:block" />
      <svg viewBox="0 0 240 120" className="absolute bottom-[10%] right-[5%] hidden w-60 text-[#1f3fd1]/35 xl:block" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 104 L52 78 L92 90 L140 44 L184 56 L236 12" />
        <circle cx="52" cy="78" r="3.5" fill="currentColor" />
        <circle cx="140" cy="44" r="3.5" fill="currentColor" />
        <circle cx="236" cy="12" r="3.5" fill="currentColor" />
      </svg>
    </div>
  );
}

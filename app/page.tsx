import { Backdrop } from "@/components/Backdrop";
import { Logo } from "@/components/Logo";
import { QuizForm } from "@/components/QuizForm";

const gutter = "mx-auto max-w-[1100px] pl-[max(20px,env(safe-area-inset-left))] pr-[max(20px,env(safe-area-inset-right))]";

export default function Home() {
  return (
    <>
      <Backdrop />
      <header className={`${gutter} flex justify-center py-6 sm:py-8`}>
        <Logo />
      </header>

      <main className={gutter}>
        <section className="mx-auto max-w-[1000px] pb-10 pt-8 text-center sm:pb-14 sm:pt-14">
          <h1 className="mb-7 text-balance font-[family-name:var(--font-display)] text-[clamp(40px,11vw,64px)] font-medium leading-[1.02] tracking-[-0.025em] sm:whitespace-nowrap sm:text-[clamp(64px,7.2vw,92px)]">
            Автоматизация Бизнеса
          </h1>
          <p className="mx-auto max-w-[30em] text-balance text-[14px] leading-[1.9] tracking-[0.04em] text-muted sm:text-[15px]">
            Ответьте на 6 вопросов, чтобы узнать, как увеличить прибыль и уменьшить рутину
          </p>
        </section>

        <div className="mx-auto max-w-[680px]">
          <QuizForm />
        </div>
      </main>

      <footer className="pb-12 pt-12 text-center text-sm text-faint">© 2026 · Автоматизация Бизнеса</footer>
    </>
  );
}

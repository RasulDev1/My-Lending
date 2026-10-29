import { Backdrop } from "@/components/Backdrop";
import { Logo } from "@/components/Logo";
import { QuizForm } from "@/components/QuizForm";

const gutter = "mx-auto max-w-[680px] pl-[max(20px,env(safe-area-inset-left))] pr-[max(20px,env(safe-area-inset-right))]";

export default function Home() {
  return (
    <>
      <Backdrop />
      <header className={`${gutter} flex justify-center py-6 sm:py-8`}>
        <Logo />
      </header>

      <main className={gutter}>
        <section className="pb-8 pt-6 text-center sm:pb-12 sm:pt-12">
          <h1 className="mb-5 text-balance text-[clamp(34px,9vw,44px)] font-semibold sm:whitespace-nowrap sm:text-[52px] leading-[1.06] tracking-[-0.04em]">
            Автоматизация Бизнеса
          </h1>
          <p className="mx-auto max-w-[28em] text-balance text-base leading-relaxed text-muted sm:text-lg">
            Ответьте на 6 вопросов, чтобы узнать, как увеличить прибыль и уменьшить рутину
          </p>
        </section>

        <QuizForm />
      </main>

      <footer className="pb-12 pt-12 text-center text-sm text-faint">© 2026 · Автоматизация Бизнеса</footer>
    </>
  );
}

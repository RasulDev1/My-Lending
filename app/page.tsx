import { Logo } from "@/components/Logo";
import { QuizForm } from "@/components/QuizForm";

const gutter = "mx-auto max-w-[760px] pl-[max(20px,env(safe-area-inset-left))] pr-[max(20px,env(safe-area-inset-right))]";

export default function Home() {
  return (
    <>
      <header className={`${gutter} flex justify-center py-[22px]`}>
        <Logo />
      </header>

      <main className={gutter}>
        <section className="pb-7 pt-4 text-center sm:pb-9 sm:pt-8">
          <h1 className="mb-4 text-balance text-[clamp(34px,6vw,56px)] font-semibold leading-[1.08] tracking-[-0.035em]">
            Автоматизация Бизнеса
          </h1>
          <p className="mx-auto max-w-[30em] text-balance text-[16.5px] text-muted sm:text-lg">
            Ответьте на 6 вопросов, чтобы узнать, как увеличить прибыль и уменьшить рутину
          </p>
        </section>

        <QuizForm />
      </main>

      <footer className="pb-12 pt-8 text-center text-sm text-faint">© 2026 · Автоматизация Бизнеса</footer>
    </>
  );
}

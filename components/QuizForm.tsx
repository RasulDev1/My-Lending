"use client";

import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";

// Заявки уходят на почту через FormSubmit (formsubmit.co).
// После активации можно заменить адрес на секретный код из письма FormSubmit.
const ENDPOINT = "https://formsubmit.co/ajax/tyagainstrument@gmail.com";

// Заявки принимает Google Apps Script (так же, как на сайте «Тяга»): записывает в таблицу и шлёт письмо.
// Код скрипта лежит в apps-script/Code.gs. Адрес веб-приложения задаётся при сборке переменной
// NEXT_PUBLIC_LEAD_ENDPOINT (репозиторная переменная Actions LEAD_ENDPOINT).
// Пока она пустая, заявки уходят через запасной сервис FormSubmit на почту.
const LEAD_ENDPOINT = process.env.NEXT_PUBLIC_LEAD_ENDPOINT ?? "";
const FALLBACK_ENDPOINT = "https://formsubmit.co/ajax/tyagainstrument@gmail.com";

type Messenger = "Telegram" | "WhatsApp";
type FieldId = "sphere" | "instagram" | "channels" | "leads" | "dropoff" | "contact";
type Answers = Record<FieldId, string>;

const emptyAnswers: Answers = { sphere: "", instagram: "", channels: "", leads: "", dropoff: "", contact: "" };

// Шаги квиза: на экране один или два вопроса
const steps: FieldId[][] = [["sphere", "instagram"], ["channels"], ["leads"], ["dropoff"], ["contact"]];

const labels: Record<FieldId, string> = {
  sphere: "Назовите сферу вашей деятельности",
  instagram: "Ваш логин в Instagram",
  channels: "Как привлекаете клиентов?",
  leads: "Где они оставляют заявку?",
  dropoff: "Где они останавливаются?",
  contact: "Как с вами связаться?",
};

const placeholders: Record<FieldId, string> = {
  sphere: "Салон красоты, доставка еды, ремонт квартир",
  instagram: "username",
  channels: "Реклама в Instagram, Авито, сарафанное радио",
  leads: "Пишут в директ, звонят по телефону, оставляют заявку на сайте",
  dropoff: "Не отвечают после цены, не доходят до оплаты, теряются в переписке",
  contact: "",
};

const multiline: FieldId[] = ["channels", "leads", "dropoff"];

const contactHint: Record<Messenger, string> = {
  Telegram: "Ваш ник в Telegram, например @username",
  WhatsApp: "Номер WhatsApp, например +7 900 123-45-67",
};

const errorText = (id: FieldId) =>
  id === "contact" ? "Укажите контакт, чтобы мы могли ответить"
    : id === "instagram" ? "Укажите логин Instagram"
    : "Ответьте на этот вопрос";

function TelegramIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 4 3 11l5.5 2 2 6 3-3.5 4.5 3.5L21 4Z" />
      <path d="m8.5 13 12.5-9" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 21l1.6-4.7A8.5 8.5 0 1 1 8 19.5L3 21Z" />
      <path d="M9 9.5c0 3 2.5 5.5 5.5 5.5l1-1.5-2-1-1 .8a3.5 3.5 0 0 1-1.8-1.8l.8-1-1-2L9 9.5Z" />
    </svg>
  );
}

function Arrow({ dir = "right" }: { dir?: "left" | "right" }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {dir === "right" ? <path d="M5 12h14M13 6l6 6-6 6" /> : <path d="M19 12H5M11 6l-6 6 6 6" />}
    </svg>
  );
}

// Карточка с ультратонкой градиентной рамкой (1px) и многослойной «парящей» тенью
function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className="rounded-[22px] bg-[linear-gradient(145deg,rgba(255,255,255,.95)_0%,rgba(255,255,255,.35)_35%,rgba(180,192,225,.35)_70%,rgba(255,255,255,.8)_100%)] p-px shadow-card">
      <div className={`rounded-[21px] bg-white/60 backdrop-blur-2xl backdrop-saturate-150 ${className}`}>{children}</div>
    </div>
  );
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
      <circle cx="12" cy="12" r="3.8" />
      <circle cx="17.2" cy="6.8" r=".6" fill="currentColor" />
    </svg>
  );
}

function Question({ label, labelFor, labelId, error, children }: {
  label: string; labelFor?: string; labelId?: string; error?: string; children: ReactNode;
}) {
  const cls = "text-[22px] font-semibold leading-[1.25] tracking-[-0.02em] sm:text-[26px]";
  return (
    <div className="flex flex-col gap-5">
      {labelFor
        ? <label htmlFor={labelFor} className={cls}>{label}</label>
        : <span id={labelId} className={cls}>{label}</span>}
      {children}
      {error && <p role="alert" className="-mt-2 m-0 text-sm font-medium text-error">{error}</p>}
    </div>
  );
}

export function QuizForm() {
  const [answers, setAnswers] = useState<Answers>(emptyAnswers);
  const [messenger, setMessenger] = useState<Messenger>("Telegram");
  const [errors, setErrors] = useState<Partial<Record<FieldId, string>>>({});
  const [honey, setHoney] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "error" | "done">("idle");
  const [step, setStep] = useState(0);
  const moved = useRef(false);
  const last = steps.length - 1;

  // После перехода на другой шаг ставим курсор в первое поле
  useEffect(() => {
    if (!moved.current) return;
    document.getElementById(steps[step][0])?.focus({ preventScroll: true });
  }, [step]);

  const goTo = (n: number) => { moved.current = true; setStep(n); };

  // Лёгкая вибрация на телефонах, где она поддерживается (Android). «Назад» вибрации не даёт.
  const haptic = (ms: number) => { try { navigator.vibrate?.(ms); } catch { /* не поддерживается */ } };

  const update = (id: FieldId, value: string) => {
    setAnswers((a) => ({ ...a, [id]: value }));
    if (errors[id]) setErrors((e) => ({ ...e, [id]: undefined }));
  };

  // Проверяет поля текущего шага и подсвечивает пустые
  const stepIsValid = (n: number) => {
    const bad = steps[n].filter((id) => !answers[id].trim());
    setErrors((e) => ({ ...e, ...Object.fromEntries(bad.map((id) => [id, errorText(id)])) }));
    if (bad.length) document.getElementById(bad[0])?.focus();
    return bad.length === 0;
  };

  const next = () => { if (stepIsValid(step)) goTo(step + 1); };

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (step < last) { next(); return; }
    if (!stepIsValid(step)) return;

    const instagram = "@" + answers.instagram.trim().replace(/^@+/, "");
    setStatus("sending");
    const sphere = answers.sphere.trim();
    const lead = {
      sphere, instagram, messenger, honey,
      channels: answers.channels.trim(),
      leads: answers.leads.trim(),
      dropoff: answers.dropoff.trim(),
      contact: answers.contact.trim(),
    };

    try {
      if (LEAD_ENDPOINT) {
        // text/plain, чтобы браузер не делал предварительный CORS-запрос, который Apps Script не поддерживает
        const res = await fetch(LEAD_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "text/plain;charset=utf-8" },
          body: JSON.stringify(lead),
        });
        const out = await res.json().catch(() => ({}));
        if (!res.ok || !(out.success === true || out.success === "true")) throw new Error(out.message ?? String(res.status));
      } else {
        const res = await fetch(FALLBACK_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({
            "Сфера деятельности": sphere,
            "Instagram": instagram,
            "Как привлекают клиентов": lead.channels,
            "Где оставляют заявку": lead.leads,
            "Где останавливаются": lead.dropoff,
            "Способ связи": messenger,
            "Контакт": lead.contact,
            _subject: "Новая заявка: " + sphere,
            _template: "table",
            _captcha: "false",
            _honey: honey,
          }),
        });
        const out = await res.json().catch(() => ({}));
        if (!res.ok || String(out.success) === "false") throw new Error(out.message ?? String(res.status));
      }
      setStatus("done");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <Card className="step-in flex flex-col items-center gap-4 px-8 py-16 text-center sm:py-20">
        <span aria-hidden="true" className="grid size-14 place-items-center rounded-full bg-accent-soft text-accent">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
        </span>
        <h2 className="m-0 text-[30px] font-semibold leading-[1.15] tracking-[-0.03em]">Спасибо, ответы получены</h2>
        <p className="m-0 max-w-[26em] text-muted">Скоро напишу вам в {messenger} и расскажу, что можно автоматизировать в вашем бизнесе.</p>
      </Card>
    );
  }

  const renderField = (id: FieldId) => {
    if (id === "instagram") {
      return (
        <Question key={id} label={labels[id]} labelFor={id} error={errors[id]}>
          <div className="fw">
            <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-hint transition-colors duration-300 peer-focus:text-accent">
              <InstagramIcon />
            </span>
            <input
              id={id} name={id} type="text" autoComplete="off" autoCapitalize="none" spellCheck={false}
              className="field peer pl-[52px]" placeholder={placeholders[id]} aria-invalid={errors[id] ? true : undefined}
              value={answers[id]} onChange={(ev) => update(id, ev.target.value.replace(/^@+/, ""))}
            />
          </div>
        </Question>
      );
    }

    if (id === "contact") {
      return (
        <Question key={id} label={labels[id]} labelId="contact-label" error={errors[id]}>
          <div role="radiogroup" aria-labelledby="contact-label" className="grid grid-cols-2 gap-3">
            {(["Telegram", "WhatsApp"] as const).map((m) => (
              <label key={m} className="relative">
                <input
                  type="radio" name="messenger" value={m} checked={messenger === m}
                  onChange={() => { setMessenger(m); document.getElementById("contact")?.focus(); }}
                  className="peer absolute opacity-0"
                />
                <span className="flex cursor-pointer items-center justify-center gap-2.5 rounded-xl border border-transparent bg-[#eef1f8]/80 px-4 py-[15px] text-[15px] font-medium leading-none text-faint transition-colors duration-300 hover:bg-[#e8ecf6] hover:text-ink peer-checked:border-accent/40 peer-checked:bg-white/80 peer-checked:text-accent peer-checked:shadow-[0_6px_16px_-8px_rgb(31_63_209/.45)] peer-focus-visible:outline-2 peer-focus-visible:outline-offset-3 peer-focus-visible:outline-accent">
                  {m === "Telegram" ? <TelegramIcon /> : <WhatsAppIcon />}
                  {m}
                </span>
              </label>
            ))}
          </div>
          <div className="fw">
            <input
              id="contact" name="contact" type="text" autoComplete="off" className="field"
              inputMode={messenger === "WhatsApp" ? "tel" : "text"}
              placeholder={contactHint[messenger]} aria-labelledby="contact-label"
              aria-invalid={errors[id] ? true : undefined}
              value={answers[id]} onChange={(ev) => update(id, ev.target.value)}
            />
          </div>
        </Question>
      );
    }

    const props = {
      id, name: id, className: `field${multiline.includes(id) ? " min-h-[120px] resize-none" : ""}`,
      placeholder: placeholders[id], value: answers[id], "aria-invalid": errors[id] ? true : undefined,
      onChange: (ev: { target: { value: string } }) => update(id, ev.target.value),
    };
    return (
      <Question key={id} label={labels[id]} labelFor={id} error={errors[id]}>
        <div className="fw">{multiline.includes(id) ? <textarea {...props} /> : <input type="text" {...props} />}</div>
      </Question>
    );
  };

  // Вопросы, которые показывает текущий шаг: у первого шага это 1–2 из 6
  const before = steps.slice(0, step).reduce((n, g) => n + g.length, 0);
  const total = steps.reduce((n, g) => n + g.length, 0);
  const counter = steps[step].length > 1 ? `Вопросы ${before + 1}–${before + steps[step].length}` : `Вопрос ${before + 1}`;

  return (
    <Card>
    <form noValidate onSubmit={onSubmit} className="flex flex-col gap-10 px-6 pb-8 pt-8 sm:px-14 sm:pb-12 sm:pt-12">
      <div className="flex flex-col gap-4">
        <div
          className="h-[2px] w-full overflow-hidden rounded-full bg-accent/10" role="progressbar" aria-label="Прогресс анкеты"
          aria-valuemin={0} aria-valuemax={total} aria-valuenow={before + steps[step].length}
        >
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#7a9bff] via-accent to-[#7a5cff] shadow-[0_0_10px_rgb(31_63_209/.5)] transition-[width] duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
            style={{ width: `${((before + steps[step].length) / total) * 100}%` }}
          />
        </div>
        <p className="m-0 text-[13px] font-medium uppercase tabular-nums tracking-[0.14em] text-faint">
          {counter} из {total}
        </p>
      </div>

        <div key={step} className="step-in flex flex-col gap-10">
          {steps[step].map(renderField)}
        </div>

        <input
          type="text" name="_honey" tabIndex={-1} autoComplete="off" aria-hidden="true"
          className="absolute -left-[9999px]" value={honey} onChange={(ev) => setHoney(ev.target.value)}
        />

        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-3">
            <button
              type="button" onClick={() => goTo(step - 1)}
              className={`btn-back inline-flex cursor-pointer items-center gap-2 rounded-xl px-3 py-3.5 text-[15px] font-medium leading-none text-faint hover:text-accent active:text-faint ${step === 0 ? "invisible" : ""}`}
            >
              <span className="nudge"><Arrow dir="left" /></span>
              Назад
            </button>
            <button
              type="submit" disabled={status === "sending"} onClick={() => haptic(12)}
              className="btn-primary inline-flex cursor-pointer items-center justify-center gap-2.5 rounded-xl px-8 py-4 text-base font-semibold leading-none text-white disabled:cursor-progress disabled:opacity-65 max-sm:flex-1"
            >
              {step < last ? "Далее" : status === "sending" ? "Отправляем…" : "Получить разбор"}
              {step < last && <span className="nudge"><Arrow /></span>}
            </button>
          </div>
          {status === "error" && (
            <p role="alert" className="m-0 text-center text-[15px] text-error">Не получилось отправить ответы. Проверьте интернет и попробуйте ещё раз.</p>
          )}
          {step === last && (
            <p className="m-0 text-center text-sm leading-relaxed text-faint">
              Ответим в выбранном мессенджере, бесплатно разберём ваши процессы и покажем, где теряются клиенты.
            </p>
          )}
        </div>
    </form>
    </Card>
  );
}

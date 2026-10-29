"use client";

import { useState, type FormEvent, type ReactNode } from "react";

// Заявки уходят на почту через FormSubmit (formsubmit.co).
// После активации можно заменить адрес на секретный код из письма FormSubmit.
const ENDPOINT = "https://formsubmit.co/ajax/ddzon4553@gmail.com";

type Messenger = "Telegram" | "WhatsApp";
type FieldId = "sphere" | "channels" | "leads" | "dropoff" | "contact" | "instagram";
type Answers = Record<FieldId, string>;

const textQuestions: { id: Exclude<FieldId, "contact" | "instagram">; label: string; placeholder: string; multiline?: boolean }[] = [
  { id: "sphere", label: "Назовите сферу вашей деятельности", placeholder: "Например: салон красоты, доставка еды, ремонт квартир" },
  { id: "channels", label: "Как привлекаете клиентов?", placeholder: "Например: реклама в Instagram, Авито, сарафанное радио", multiline: true },
  { id: "leads", label: "Где они оставляют заявку?", placeholder: "Например: пишут в директ, звонят по телефону, оставляют заявку на сайте", multiline: true },
  { id: "dropoff", label: "Где они останавливаются?", placeholder: "На каком этапе клиенты пропадают: не отвечают после цены, не доходят до оплаты, теряются в переписке", multiline: true },
];

const contactHint: Record<Messenger, string> = {
  Telegram: "Ваш ник в Telegram, например @username",
  WhatsApp: "Номер WhatsApp, например +7 900 123-45-67",
};

const emptyAnswers: Answers = { sphere: "", instagram: "", channels: "", leads: "", dropoff: "", contact: "" };

function TelegramIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5 shrink-0" aria-hidden="true">
      <path fill="currentColor" d="M3.4 11.2 19.6 5c.8-.3 1.5.2 1.2 1.4l-2.8 13c-.2.9-.8 1.2-1.6.7l-4.3-3.2-2.1 2c-.2.2-.4.4-.9.4l.3-4.4 8-7.2c.3-.3-.1-.5-.5-.2l-9.9 6.2-4.2-1.3c-.9-.3-.9-.9.2-1.4z" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5 shrink-0" aria-hidden="true">
      <path fill="currentColor" d="M12 2.2a9.7 9.7 0 0 0-8.4 14.6L2.3 21.7l5-1.3A9.7 9.7 0 1 0 12 2.2zm0 17.7a8 8 0 0 1-4.1-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8 8 0 1 1 12 19.9zm4.4-6c-.2-.1-1.4-.7-1.7-.8-.2-.1-.4-.1-.5.1l-.8 1c-.1.2-.3.2-.5.1a6.6 6.6 0 0 1-3.3-2.9c-.2-.4.3-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.5-.4h-.5a.9.9 0 0 0-.6.3 2.7 2.7 0 0 0-.8 2c0 1.2.8 2.3 1 2.5.1.2 1.7 2.6 4.1 3.6 1.5.7 2.1.7 2.9.6.5-.1 1.4-.6 1.6-1.1.2-.6.2-1 .1-1.1l-.4-.4z" />
    </svg>
  );
}

function Question({ num, label, labelFor, labelId, error, children }: {
  num: number; label: string; labelFor?: string; labelId?: string; error?: string; children: ReactNode;
}) {
  const labelClass = "pt-[3px] text-lg font-semibold leading-[1.3] tracking-[-0.01em] sm:pt-[5px] sm:text-[19px]";
  return (
    <div className="grid grid-cols-[32px_minmax(0,1fr)] gap-x-3 gap-y-3 border-b border-line px-[18px] py-6 sm:grid-cols-[44px_minmax(0,1fr)] sm:gap-x-4 sm:px-8 sm:py-7">
      <span aria-hidden="true" className="grid size-8 place-items-center rounded-lg border border-accent-line bg-accent-soft text-sm font-semibold tabular-nums text-accent sm:size-9 sm:text-[15px]">
        {num}
      </span>
      {labelFor
        ? <label htmlFor={labelFor} className={labelClass}>{label}</label>
        : <span id={labelId} className={labelClass}>{label}</span>}
      <div className="col-span-2 flex min-w-0 flex-col gap-3 sm:col-start-2 sm:col-end-3">
        {children}
        {error && <p className="m-0 text-sm text-error">{error}</p>}
      </div>
    </div>
  );
}

export function QuizForm() {
  const [answers, setAnswers] = useState<Answers>(emptyAnswers);
  const [messenger, setMessenger] = useState<Messenger>("Telegram");
  const [errors, setErrors] = useState<Partial<Record<FieldId, string>>>({});
  const [honey, setHoney] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "error" | "done">("idle");

  const update = (id: FieldId, value: string) => {
    setAnswers((a) => ({ ...a, [id]: value }));
    if (errors[id]) setErrors((e) => ({ ...e, [id]: undefined }));
  };

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const found: Partial<Record<FieldId, string>> = {};
    (Object.keys(answers) as FieldId[]).forEach((id) => {
      if (!answers[id].trim()) {
        found[id] = id === "contact" ? "Укажите контакт, чтобы мы могли ответить"
          : id === "instagram" ? "Укажите логин Instagram"
          : "Ответьте на этот вопрос";
      }
    });
    setErrors(found);
    const firstInvalid = (Object.keys(found) as FieldId[])[0];
    if (firstInvalid) { document.getElementById(firstInvalid)?.focus(); return; }

    const instagram = "@" + answers.instagram.trim().replace(/^@+/, "");
    setStatus("sending");
    try {
      const res = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          "Сфера деятельности": answers.sphere.trim(),
          "Instagram": instagram,
          "Как привлекают клиентов": answers.channels.trim(),
          "Где оставляют заявку": answers.leads.trim(),
          "Где останавливаются": answers.dropoff.trim(),
          "Способ связи": messenger,
          "Контакт": answers.contact.trim(),
          _subject: "Новая заявка: " + answers.sphere.trim(),
          _template: "table",
          _captcha: "false",
          _honey: honey,
        }),
      });
      const out = await res.json().catch(() => ({}));
      if (!res.ok || String(out.success) === "false") throw new Error(out.message ?? String(res.status));
      setStatus("done");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setStatus("error");
    }
  }

  const renderText = (q: (typeof textQuestions)[number], num: number) => {
    const props = {
      id: q.id,
      name: q.id,
      className: `field${q.multiline ? " min-h-[92px] resize-y" : ""}`,
      placeholder: q.placeholder,
      value: answers[q.id],
      "aria-invalid": errors[q.id] ? true : undefined,
      onChange: (ev: { target: { value: string } }) => update(q.id, ev.target.value),
    };
    return (
      <Question key={q.id} num={num} label={q.label} labelFor={q.id} error={errors[q.id]}>
        {q.multiline ? <textarea {...props} /> : <input type="text" {...props} />}
      </Question>
    );
  };

  const sheet = "rounded-xl border border-line bg-white shadow-sheet";

  if (status === "done") {
    return (
      <div className={`${sheet} flex flex-col items-center gap-3.5 px-8 py-14 text-center`}>
        <span aria-hidden="true" className="grid size-14 place-items-center rounded-full bg-accent-soft text-accent">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
        </span>
        <h2 className="m-0 text-[30px] font-semibold leading-[1.15] tracking-[-0.02em]">Спасибо, ответы получены</h2>
        <p className="m-0 max-w-[28em] text-muted">Скоро напишу вам в {messenger} и расскажу, что можно автоматизировать в вашем бизнесе.</p>
      </div>
    );
  }

  return (
    <form noValidate onSubmit={onSubmit} className={`${sheet} flex flex-col`}>
      {renderText(textQuestions[0], 1)}

      <Question num={2} label="Укажите ваш логин в Instagram" labelFor="instagram" error={errors.instagram}>
        <div className="relative">
          <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-[15px] flex items-center text-muted">@</span>
          <input
            id="instagram" name="instagram" type="text" autoComplete="off" autoCapitalize="none" spellCheck={false}
            className="field pl-8" placeholder="username"
            aria-invalid={errors.instagram ? true : undefined}
            value={answers.instagram} onChange={(ev) => update("instagram", ev.target.value.replace(/^@+/, ""))}
          />
        </div>
      </Question>

      {textQuestions.slice(1).map((q, i) => renderText(q, i + 3))}

      <Question num={6} label="Укажите способ связи" labelId="contact-label" error={errors.contact}>
        <div role="radiogroup" aria-labelledby="contact-label" className="grid grid-cols-2 gap-2.5">
          {(["Telegram", "WhatsApp"] as const).map((m) => (
            <label key={m} className="relative">
              <input
                type="radio" name="messenger" value={m} checked={messenger === m}
                onChange={() => { setMessenger(m); document.getElementById("contact")?.focus(); }}
                className="peer absolute opacity-0"
              />
              <span className="flex cursor-pointer items-center justify-center gap-2.5 rounded-lg border border-line-strong bg-white px-3.5 py-[13px] font-medium leading-none text-muted transition-colors hover:border-accent hover:text-accent peer-checked:border-accent peer-checked:bg-accent-soft peer-checked:text-accent peer-focus-visible:outline-2 peer-focus-visible:outline-offset-3 peer-focus-visible:outline-accent">
                {m === "Telegram" ? <TelegramIcon /> : <WhatsAppIcon />}
                {m}
              </span>
            </label>
          ))}
        </div>
        <input
          id="contact" name="contact" type="text" autoComplete="off" className="field"
          inputMode={messenger === "WhatsApp" ? "tel" : "text"}
          placeholder={contactHint[messenger]} aria-labelledby="contact-label"
          aria-invalid={errors.contact ? true : undefined}
          value={answers.contact} onChange={(ev) => update("contact", ev.target.value)}
        />
      </Question>

      <input
        type="text" name="_honey" tabIndex={-1} autoComplete="off" aria-hidden="true"
        className="absolute -left-[9999px]" value={honey} onChange={(ev) => setHoney(ev.target.value)}
      />

      <div className="flex flex-col items-center gap-3.5 px-5 py-7 text-center sm:p-8">
        <button
          type="submit" disabled={status === "sending"}
          className="inline-flex w-full cursor-pointer items-center justify-center gap-2.5 rounded-lg bg-cta px-8 py-[18px] text-[17px] font-semibold leading-none text-ink shadow-[0_1px_2px_rgb(15_23_42/.12)] transition-[background,box-shadow] hover:bg-cta-hover hover:shadow-[0_6px_16px_-8px_rgb(249_115_22/.7)] disabled:cursor-progress disabled:opacity-65 sm:w-auto"
        >
          {status === "sending" ? "Отправляем…" : "Узнать, как увеличить прибыль"}
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M13 5l7 7-7 7" /></svg>
        </button>
        {status === "error" && (
          <p role="alert" className="m-0 text-[15px] text-error">Не получилось отправить ответы. Проверьте интернет и попробуйте ещё раз.</p>
        )}
        <small className="max-w-[32em] text-sm text-faint">Ответим в выбранном мессенджере, бесплатно разберём ваши процессы и покажем, где теряются клиенты.</small>
      </div>
    </form>
  );
}

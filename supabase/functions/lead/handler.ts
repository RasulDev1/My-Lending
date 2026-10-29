// Логика приёма заявки: проверка, сохранение в БД и отправка в Telegram-бот.
// Вынесена отдельно от index.ts, чтобы её можно было проверить без Deno и без сети.

export type Lead = {
  sphere: string;
  instagram: string;
  channels: string;
  entry_point: string;
  dropoff: string;
  messenger: string;
  contact: string;
};

export type Deps = {
  allowedOrigin: string;
  saveLead: (lead: Lead) => Promise<void>;
  sendTelegram: (html: string) => Promise<void>;
};

const FIELDS: [keyof Lead, string, string][] = [
  ["sphere", "sphere", "Сфера деятельности"],
  ["instagram", "instagram", "Instagram"],
  ["channels", "channels", "Как привлекают клиентов"],
  ["entry_point", "leads", "Где оставляют заявку"],
  ["dropoff", "dropoff", "Где останавливаются"],
  ["messenger", "messenger", "Способ связи"],
  ["contact", "contact", "Контакт"],
];

const MAX_LEN = 1000;
const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export async function handle(request: Request, deps: Deps): Promise<Response> {
  const cors = {
    "Access-Control-Allow-Origin": deps.allowedOrigin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "content-type, authorization, apikey, x-client-info",
    "Vary": "Origin",
  };
  const reply = (status: number, body: unknown) =>
    new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
  if (request.method !== "POST") return reply(405, { success: false, message: "method not allowed" });
  // Принимаем заявки только с вашего сайта
  if (request.headers.get("Origin") !== deps.allowedOrigin) return reply(403, { success: false, message: "forbidden" });

  let data: Record<string, unknown>;
  try { data = await request.json(); } catch { return reply(400, { success: false, message: "bad json" }); }

  // Ловушка для ботов: настоящий человек это поле не заполняет
  if (data.honey) return reply(200, { success: true });

  const lead = {} as Lead;
  const lines: string[] = [];
  for (const [column, key, label] of FIELDS) {
    const value = String(data[key] ?? "").trim().slice(0, MAX_LEN);
    if (!value) return reply(400, { success: false, message: `missing ${key}` });
    lead[column] = value;
    lines.push(`<b>${label}:</b> ${esc(value)}`);
  }

  // Заявка принята, если сохранилась в БД или дошла в Telegram
  const results = await Promise.allSettled([
    deps.saveLead(lead),
    deps.sendTelegram(`🆕 <b>Новая заявка</b>\n\n${lines.join("\n")}`),
  ]);
  results.forEach((r) => { if (r.status === "rejected") console.error("lead channel failed:", r.reason); });
  if (results.every((r) => r.status === "rejected")) return reply(502, { success: false, message: "delivery failed" });
  return reply(200, { success: true });
}

// Cloudflare Worker: принимает заявку с сайта и отправляет её в личный Telegram-бот.
// Токен бота и ваш chat id хранятся только здесь, в секретах Worker, и не попадают в код сайта.
//
// Секреты (задаются командой `wrangler secret put` или в панели Cloudflare):
//   BOT_TOKEN      токен бота от @BotFather
//   OWNER_CHAT_ID  числовой id вашего чата с ботом (заявки уходят только туда)
// Переменная в wrangler.toml:
//   ALLOWED_ORIGIN адрес сайта, например https://landing.sultech.site

const FIELDS = [
  ["sphere", "Сфера деятельности"],
  ["instagram", "Instagram"],
  ["channels", "Как привлекают клиентов"],
  ["leads", "Где оставляют заявку"],
  ["dropoff", "Где останавливаются"],
  ["messenger", "Способ связи"],
  ["contact", "Контакт"],
];

const MAX_LEN = 1000;
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    const allowed = env.ALLOWED_ORIGIN;
    const cors = {
      "Access-Control-Allow-Origin": allowed,
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Vary": "Origin",
    };
    const reply = (status, body) =>
      new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
    if (request.method !== "POST") return reply(405, { success: false, message: "method not allowed" });
    // Принимаем заявки только с вашего сайта
    if (origin !== allowed) return reply(403, { success: false, message: "forbidden" });

    let data;
    try { data = await request.json(); } catch { return reply(400, { success: false, message: "bad json" }); }

    // Ловушка для ботов: настоящий человек это поле не заполняет
    if (data.honey) return reply(200, { success: true });

    const lines = [];
    for (const [key, label] of FIELDS) {
      const value = String(data[key] ?? "").trim().slice(0, MAX_LEN);
      if (!value) return reply(400, { success: false, message: `missing ${key}` });
      lines.push(`<b>${label}:</b> ${esc(value)}`);
    }
    const text = `🆕 <b>Новая заявка</b>\n\n${lines.join("\n")}`;

    const res = await fetch(`https://api.telegram.org/bot${env.BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: env.OWNER_CHAT_ID, text, parse_mode: "HTML", disable_web_page_preview: true }),
    });
    if (!res.ok) return reply(502, { success: false, message: "telegram error" });
    return reply(200, { success: true });
  },
};

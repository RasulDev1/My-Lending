// Supabase Edge Function `lead`: принимает заявку с сайта, сохраняет в таблицу leads и шлёт в Telegram-бот.
//
// Секреты (supabase secrets set ...):
//   BOT_TOKEN       токен бота от @BotFather
//   OWNER_CHAT_ID   числовой id вашего чата с ботом (заявки уходят только туда)
//   ALLOWED_ORIGIN  адрес сайта, например https://landing.sultech.site
// SUPABASE_URL и SUPABASE_SERVICE_ROLE_KEY Supabase подставляет сам.

import { createClient } from "npm:@supabase/supabase-js@2";
import { handle, type Lead } from "./handler.ts";

const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

Deno.serve((request) =>
  handle(request, {
    allowedOrigin: Deno.env.get("ALLOWED_ORIGIN") ?? "https://landing.sultech.site",
    saveLead: async (lead: Lead) => {
      const { error } = await supabase.from("leads").insert(lead);
      if (error) throw new Error(error.message);
    },
    sendTelegram: async (html: string) => {
      const res = await fetch(`https://api.telegram.org/bot${Deno.env.get("BOT_TOKEN")}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: Deno.env.get("OWNER_CHAT_ID"),
          text: html,
          parse_mode: "HTML",
          disable_web_page_preview: true,
        }),
      });
      if (!res.ok) throw new Error(`telegram ${res.status}`);
    },
  })
);

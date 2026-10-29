# Автоматизация Бизнеса — анкета

Пошаговый квиз из 6 вопросов (5 шагов, Instagram — вторым). Ответы приходят на почту ddzon4553@gmail.com через [FormSubmit](https://formsubmit.co).

Стек: Next.js (App Router, статический экспорт), Tailwind CSS 4, TypeScript.

## Запуск

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # статический сайт в папке out/
```

## Почта

Адрес задан в `components/QuizForm.tsx` (константа `ENDPOINT`).
Первая заявка с сайта присылает на почту письмо от FormSubmit со ссылкой **Activate**: нажмите её один раз, после этого заявки приходят сами.
После активации адрес в `ENDPOINT` можно заменить на секретный код из письма FormSubmit, чтобы почта не была видна в коде сайта.

## Деплой

При пуше в `main` workflow `.github/workflows/deploy.yml` собирает сайт и публикует его на GitHub Pages.
В настройках репозитория: Settings → Pages → Source → **GitHub Actions**.

Домен: **landing.sultech.site**. У регистратора домена sultech.site добавлена запись
`CNAME landing → rasuldev1.github.io`, а в Settings → Pages → Custom domain указан `landing.sultech.site` и включён Enforce HTTPS.

## Заявки в Telegram-бот и база Supabase

Заявки приходят на почту, в личный Telegram-бот и сохраняются в таблицу `leads` в Supabase. Токен бота нельзя класть в код сайта
(его увидит любой посетитель), поэтому сайт отправляет заявку в функцию Supabase `lead` (папка `supabase/`), а она сохраняет её и пересылает в бота.
Токен и ваш chat id лежат в секретах функции. Бот приватный: он ничего не читает, функция пишет только в ваш чат и принимает запросы только с адреса сайта.
Таблица закрыта политикой безопасности (RLS без политик): через публичный ключ сайта её нельзя ни прочитать, ни изменить.

1. **Бот.** В Telegram откройте `@BotFather`, команда `/newbot`, получите токен вида `123456:ABC...`. Никому его не показывайте и не вставляйте в чат.
2. **Ваш chat id.** Откройте нового бота и нажмите Start. Затем откройте в браузере
   `https://api.telegram.org/bot<ТОКЕН>/getUpdates` и найдите `"chat":{"id":123456789`, это ваш id.
3. **Supabase.** Установите CLI (`npm i -g supabase` или `npx supabase`), затем в корне репозитория:
   ```bash
   npx supabase login
   npx supabase link --project-ref <ref вашего проекта>
   npx supabase db push                       # создаст таблицу leads
   npx supabase secrets set BOT_TOKEN=<токен> OWNER_CHAT_ID=<chat id> ALLOWED_ORIGIN=https://landing.sultech.site
   npx supabase functions deploy lead --no-verify-jwt
   ```
   Адрес функции: `https://<ref>.supabase.co/functions/v1/lead`.
4. **Адрес в сайт.** В репозитории: Settings → Secrets and variables → Actions → вкладка **Variables** → New repository variable:
   имя `LEAD_ENDPOINT`, значение — адрес функции. Затем перезапустите деплой (Actions → Deploy to GitHub Pages → Run workflow).

Пока переменная `LEAD_ENDPOINT` не задана, заявки приходят только на почту. Если один из каналов не сработал, заявка всё равно считается принятой.

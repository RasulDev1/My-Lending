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

## Заявки в Telegram-бот

Заявки приходят и на почту, и в личный Telegram-бот. Токен бота нельзя класть в код сайта (его увидит любой посетитель), поэтому
сайт отправляет заявку на маленький Cloudflare Worker (папка `worker/`), а тот пересылает её в бота. Токен и ваш chat id лежат в секретах Worker.
Бот приватный: он ничего не читает, а Worker отправляет сообщения только в ваш чат и принимает запросы только с адреса сайта.

1. **Бот.** В Telegram откройте `@BotFather`, команда `/newbot`, получите токен вида `123456:ABC...`. Никому его не показывайте и не вставляйте в чат.
2. **Ваш chat id.** Откройте своего нового бота и нажмите Start (или напишите ему любое сообщение). Затем откройте в браузере
   `https://api.telegram.org/bot<ТОКЕН>/getUpdates` и найдите `"chat":{"id":123456789` — это ваш id.
3. **Worker.** Зарегистрируйтесь на cloudflare.com (бесплатно), затем в папке `worker/`:
   ```bash
   npx wrangler login
   npx wrangler deploy
   npx wrangler secret put BOT_TOKEN        # вставьте токен
   npx wrangler secret put OWNER_CHAT_ID    # вставьте chat id
   ```
   Команда `deploy` напечатает адрес вида `https://anketa-telegram.<ваш-аккаунт>.workers.dev`.
4. **Адрес в сайт.** В репозитории: Settings → Secrets and variables → Actions → вкладка **Variables** → New repository variable:
   имя `TG_ENDPOINT`, значение — адрес Worker. Затем перезапустите деплой (Actions → Deploy to GitHub Pages → Run workflow).

Пока переменная `TG_ENDPOINT` не задана, заявки приходят только на почту. Если не сработал один из двух каналов, заявка всё равно считается принятой.

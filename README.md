# Автоматизация Бизнеса — анкета

Пошаговый квиз из 6 вопросов (5 шагов, Instagram — вторым). Ответы приходят на почту tyagainstrument@gmail.com через [FormSubmit](https://formsubmit.co).

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

## Заявки: Google Apps Script (как на сайте «Тяга»)

Сайт отправляет заявку на веб-приложение Google Apps Script. Скрипт (`apps-script/Code.gs`) только отправляет письмо на tyagainstrument@gmail.com (адрес в переменной `EMAIL` вверху файла, таблицы нет)
и, если заданы свойства `BOT_TOKEN` и `OWNER_CHAT_ID`, дублирует заявку в личный Telegram-бот. Токен хранится только в свойствах скрипта и не попадает в код сайта.

1. Откройте [script.google.com](https://script.google.com) → New project.
2. Вставьте код из `apps-script/Code.gs`, сохраните, выберите функцию `testEmail` и нажмите Run: Google спросит доступ к почте, и придёт тестовое письмо.
3. Deploy → New deployment → тип **Web app**. Execute as: **Me**. Who has access: **Anyone**. Нажмите Deploy и подтвердите доступ
   (Google покажет предупреждение: Advanced → Go to проект → Allow). Скопируйте адрес вида `https://script.google.com/macros/s/.../exec`.
4. В репозитории: Settings → Secrets and variables → Actions → **Variables** → New repository variable: `LEAD_ENDPOINT` = этот адрес.
   Затем Actions → Deploy to GitHub Pages → Run workflow.
5. Telegram (по желанию): в Apps Script Project Settings → Script properties добавьте `BOT_TOKEN` и `OWNER_CHAT_ID`.

Пока переменная `LEAD_ENDPOINT` не задана, сайт отправляет заявки на почту через запасной сервис FormSubmit (там нужно один раз нажать Activate в первом письме).
При изменении кода скрипта нужно заново сделать Deploy → Manage deployments → Edit → New version.

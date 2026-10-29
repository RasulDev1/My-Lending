# Автоматизация Бизнеса — анкета

Одна страница с 6 вопросами (Instagram — вторым). Ответы приходят на почту ddzon4553@gmail.com через [FormSubmit](https://formsubmit.co).

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

Домен: **anketa.sultech.site**. У регистратора домена sultech.site добавлена запись
`CNAME anketa → rasuldev1.github.io`, а в Settings → Pages → Custom domain указан `anketa.sultech.site` и включён Enforce HTTPS.

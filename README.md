# Renchik — репетитор по физике

Лендинг на React (через CDN UMD) с in-browser JSX-транспиляцией через Babel Standalone. Сборка не требуется — это полностью статичный сайт.

## Локальный запуск

Любым статичным сервером из корня репозитория:

```bash
python3 -m http.server 8000
# или
npx serve .
```

Открыть http://localhost:8000

## Деплой на GitHub Pages

1. Создать репозиторий на GitHub и запушить ветку `main`:
   ```bash
   git remote add origin https://github.com/<user>/<repo>.git
   git push -u origin main
   ```
2. В настройках репозитория: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. Workflow `.github/workflows/pages.yml` задеплоит сайт автоматически при пуше в `main`.
4. Сайт будет доступен по адресу `https://<user>.github.io/<repo>/`.

Файл `.nojekyll` отключает обработку Jekyll'ом (нужно для путей с `_` и стабильной отдачи статики).

## Структура

- `index.html` — точка входа, подключает React/Babel с CDN и JSX-файлы.
- `main.jsx` — корневой компонент `App`.
- `app.jsx`, `sections.jsx`, `animations.jsx`, `cosmic.jsx`, `tweaks-panel.jsx` — UI и эффекты.
- `image-slot.js` — custom element для медиа-слотов.
- `assets/` — изображения сайта.
- `uploads/` — исходные материалы.

import { defineConfig } from 'vite';

// Якщо деплоїш у репозиторій user/repo, і сторінка буде за адресою
// https://user.github.io/repo/ — додай base: "/repo/".
// Якщо це user.github.io (user site) — base можна не вказувати.
export default defineConfig({
  base: '/space-shooter/', // ← заміни на назву свого репозиторію або прибери
});
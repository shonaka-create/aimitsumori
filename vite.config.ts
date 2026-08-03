import vinext from "vinext";
import { defineConfig } from "vite";

// Vercel builds this project directly. Cloudflare and Codex Sites plugins are
// intentionally not loaded here because they rely on local-only build helpers.
export default defineConfig({
  plugins: [vinext()],
});

import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// Configuração padrão: sem cache incremental (ISR) — o catálogo usa force-dynamic.
export default defineCloudflareConfig({});

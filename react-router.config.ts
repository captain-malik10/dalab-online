import type { Config } from '@react-router/dev/config';

export default {
  // SPA mode: the client is built to build/client and served by Express (server.js).
  ssr: false,
} satisfies Config;

import { createApp } from "./app";
import { setupVite, serveStatic } from "./vite";
import { log } from "./utils/logger";
import { config } from "./config";
import { setupCacheListeners } from "./listeners";

(async () => {
  const { app, server } = await createApp();

  // Initialize Cache Listeners (Hydration)
  // This ensures the server has fresh data before accepting requests
  await setupCacheListeners();

  if (config.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const port = config.GH_PORT;
  server.listen({
    port,
    host: "0.0.0.0",
  }, () => {
    log(`serving on port ${port}`);
    log('Server ready - Cache listeners active');
  });
})();

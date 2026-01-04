import { createApp } from "./app";
import { setupVite, serveStatic } from "./vite";
import { log } from "./utils/logger";
import { startScheduler } from "./umf/scheduler";
import { startGuruScheduler } from "./guru/scheduler";
import { config, schedulerConfig } from "./config";

(async () => {
  const { app, server } = await createApp();

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

    // Start UMF scheduler if enabled
    if (schedulerConfig.umfEnabled) {
      log('UMF Scheduler enabled - starting background data refresh');
      startScheduler();
    } else {
      log('UMF Scheduler disabled (set UMF_SCHEDULER=1 to enable)');
    }

    // Start Guru Digest scheduler if enabled
    if (schedulerConfig.guruEnabled) {
      log('Guru Digest Scheduler enabled - automatic RSS updates every 2.5 hours');
      startGuruScheduler();
    } else {
      log('Guru Digest Scheduler disabled (set GURU_SCHEDULER=1 to enable)');
    }
  });
})();

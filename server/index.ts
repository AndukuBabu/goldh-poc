import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { startScheduler } from "./umf/scheduler";
import { startGuruScheduler } from "./guru/scheduler";

import { config, schedulerConfig } from "./config";

const app = express();

app.use(express.json({
  verify: (req: any, _res: Response, buf: Buffer) => {
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  if (config.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const port = config.PORT;
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

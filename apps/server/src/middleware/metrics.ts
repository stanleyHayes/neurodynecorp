import type { Request, Response, NextFunction } from "express";
import { httpRequestsTotal, httpRequestDuration, activeConnections, register } from "../metrics/index.js";

export function metricsMiddleware(req: Request, res: Response, next: NextFunction): void {
  activeConnections.inc();
  const end = httpRequestDuration.startTimer();

  res.on("finish", () => {
    const route = req.route?.path ?? req.path;
    const labels = {
      method: req.method,
      route,
      status_code: String(res.statusCode),
    };

    httpRequestsTotal.inc(labels);
    end(labels);
    activeConnections.dec();
  });

  next();
}

export async function metricsEndpoint(_req: Request, res: Response): Promise<void> {
  res.set("Content-Type", register.contentType);
  res.end(await register.metrics());
}

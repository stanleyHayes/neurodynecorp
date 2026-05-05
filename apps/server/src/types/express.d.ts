// Loosen Express request param/query types so route handlers can pass them
// to repository methods that expect plain strings.
import "express";

declare global {
  namespace Express {
    interface Request {
      params: Record<string, string>;
      query: Record<string, string>;
    }
  }
}

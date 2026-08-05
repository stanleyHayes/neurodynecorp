import { lookup } from "dns/promises";
import { isIP } from "net";
import { ValidationError } from "../../../middleware/error-handler.js";

/**
 * Reject webhook / outbound URLs that target private, loopback, link-local,
 * or cloud-metadata addresses (SSRF). Resolves hostnames before allowing fetch.
 */

function isBlockedIp(ip: string): boolean {
  const v = isIP(ip);
  if (v === 4) {
    const parts = ip.split(".").map(Number);
    const [a, b] = parts;
    if (a === undefined || b === undefined) return true;
    if (a === 10) return true;
    if (a === 127) return true;
    if (a === 0) return true;
    if (a === 169 && b === 254) return true; // link-local / AWS metadata
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 192 && b === 168) return true;
    if (a === 100 && b >= 64 && b <= 127) return true; // CGNAT
    return false;
  }
  if (v === 6) {
    const normalized = ip.toLowerCase();
    if (normalized === "::1") return true;
    if (normalized.startsWith("fc") || normalized.startsWith("fd")) return true; // ULA
    if (normalized.startsWith("fe80")) return true; // link-local
    // IPv4-mapped
    if (normalized.startsWith("::ffff:")) {
      return isBlockedIp(normalized.slice(7));
    }
    return false;
  }
  return true;
}

export async function assertSafeOutboundUrl(raw: string): Promise<void> {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new ValidationError("Invalid URL");
  }

  if (url.protocol !== "https:" && url.protocol !== "http:") {
    throw new ValidationError("URL must use http or https");
  }

  const hostname = url.hostname.replace(/^\[|\]$/g, "");
  if (!hostname || hostname === "localhost" || hostname.endsWith(".localhost")) {
    throw new ValidationError("URL host is not allowed");
  }

  if (isIP(hostname)) {
    if (isBlockedIp(hostname)) {
      throw new ValidationError("URL host is not allowed");
    }
    return;
  }

  let addresses: string[];
  try {
    const results = await lookup(hostname, { all: true, verbatim: true });
    addresses = results.map((r) => r.address);
  } catch {
    throw new ValidationError("URL host could not be resolved");
  }

  if (addresses.length === 0 || addresses.some(isBlockedIp)) {
    throw new ValidationError("URL host is not allowed");
  }
}

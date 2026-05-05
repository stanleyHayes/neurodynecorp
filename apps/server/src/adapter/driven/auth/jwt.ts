import jwt from "jsonwebtoken";
import type { TokenService, TokenClaims } from "../../../domain/port/index.js";

export interface JwtConfig {
  accessSecret: string;
  refreshSecret: string;
  accessExpiresIn: string;  // e.g. "15m"
  refreshExpiresIn: string; // e.g. "7d"
}

interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  permissions: string[];
  type: "access" | "refresh";
}

export class JwtTokenService implements TokenService {
  private readonly config: JwtConfig;

  constructor(config: JwtConfig) {
    this.config = config;
  }

  generateAccessToken(claims: TokenClaims | { id: string; email: string; role: string; permissions?: string[] }): string {
    const userId = "userId" in claims ? claims.userId : claims.id;
    const permissions = "permissions" in claims ? (claims.permissions ?? []) : [];
    const payload: JwtPayload = {
      sub: userId,
      email: claims.email,
      role: claims.role,
      permissions,
      type: "access",
    };
    return jwt.sign(payload, this.config.accessSecret, {
      expiresIn: this.config.accessExpiresIn as any,
    });
  }

  generateRefreshToken(claims: TokenClaims | { id: string; email: string; role: string; permissions?: string[] }): string {
    const userId = "userId" in claims ? claims.userId : claims.id;
    const payload: Omit<JwtPayload, "permissions"> & { type: "refresh" } = {
      sub: userId,
      email: claims.email,
      role: claims.role,
      type: "refresh",
    };
    return jwt.sign(payload, this.config.refreshSecret, {
      expiresIn: this.config.refreshExpiresIn as any,
    });
  }

  verifyRefreshToken(token: string): { userId: string } {
    const decoded = this.validateRefreshToken(token);
    return { userId: decoded.userId };
  }

  validateAccessToken(token: string): TokenClaims & { permissions: string[] } {
    const decoded = jwt.verify(token, this.config.accessSecret) as JwtPayload;
    if (decoded.type !== "access") {
      throw new Error("Invalid token type: expected access token");
    }
    return {
      userId: decoded.sub,
      email: decoded.email,
      role: decoded.role,
      permissions: decoded.permissions ?? [],
    };
  }

  validateRefreshToken(token: string): TokenClaims {
    const decoded = jwt.verify(token, this.config.refreshSecret) as JwtPayload;
    if (decoded.type !== "refresh") {
      throw new Error("Invalid token type: expected refresh token");
    }
    return {
      userId: decoded.sub,
      email: decoded.email,
      role: decoded.role,
    };
  }
}

import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthenticatedRequest extends Request {
  auth?: {
    userId: number;
    email: string;
  };
}

export function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    next();
    return;
  }

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    req.log.error("JWT_SECRET is not set in the environment variables");
    res.status(500).json({ error: "Internal server error" });
    return;
  }

  jwt.verify(token, jwtSecret, (err, decoded: any) => {
    if (err) {
      res.status(403).json({ error: "Forbidden: Invalid token" });
      return;
    }
    req.auth = {
      userId: decoded.id,
      email: decoded.email,
    };
    next();
  });
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  if (!req.auth) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  next();
}

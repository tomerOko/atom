import * as jwt from 'jsonwebtoken';
import { AsyncStorage } from './async-storage';
import { NextFunction, Request, Response } from 'express';
import { LogAllMethods } from './logger';

export enum Role {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

@LogAllMethods()
export class JwtUtils {
  private static jwtSecret: string;
  private static authorizationHeader = 'authorization';

  public static initialize(jwtSecret: string): void {
    JwtUtils.jwtSecret = jwtSecret;
  }

  public static setUserId(userId: string): void {
    AsyncStorage.setInAsyncStore('userId', userId);
  }

  public static setRole(role: Role): void {
    AsyncStorage.setInAsyncStore('role', role);
  }

  public static getUserId(): string | undefined {
    return AsyncStorage.getFromAsyncStore('userId');
  }

  public static getRole(): Role | undefined {
    return AsyncStorage.getFromAsyncStore('role');
  }

  public static signToken(userId: string, role: Role): string {
    if (!JwtUtils.jwtSecret) {
      throw new Error('JWT secret not set. Call setEnvs() first.');
    }

    const payload = { userId, role };
    return jwt.sign(payload, JwtUtils.jwtSecret);
  }

  public static setAuthHeader(response: Response, userId: string, role: Role): void {
    const token = JwtUtils.signToken(userId, role);
    response.setHeader(JwtUtils.authorizationHeader, token);
  }

  public static authMiddleware(req: Request, res: Response, next: NextFunction): void {
    try {
      const authHeader = req.headers[JwtUtils.authorizationHeader] as string;
      if (!authHeader) {
        throw new Error('Unauthorized');
      }
      const token = authHeader;
      const { userId, role } = JwtUtils.parseToken(token);
      JwtUtils.setUserId(userId);
      JwtUtils.setRole(role);
      next();
    } catch (error) {
      next(new Error('Unauthorized'));
    }
  }

  public static adminMiddleware(req: Request, res: Response, next: NextFunction): void {
    if (JwtUtils.getRole() !== Role.ADMIN) {
      throw new Error('Unauthorized');
    }
    next();
  }

  private static parseToken(token: string): { userId: string; role: Role } {
    if (!JwtUtils.jwtSecret) {
      throw new Error('JWT secret not set. Call setEnvs() first.');
    }

    try {
      const decoded = jwt.verify(token, JwtUtils.jwtSecret);
      if (typeof decoded === 'object' && decoded !== null && 'userId' in decoded) {
        return { userId: decoded.userId as string, role: decoded.role as Role };
      }
      throw new Error('Invalid token payload');
    } catch (error) {
      throw new Error('Invalid token');
    }
  }
}

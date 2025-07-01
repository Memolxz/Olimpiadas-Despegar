// src/middlewares/jwtMiddleware.ts
import { User, UserRole } from "@prisma/client";
import { verify } from "jsonwebtoken";
import { NextFunction, Request, Response } from "express";
import { JwtService } from "../services/jwtService";

interface JWTPayload {
  id: number;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

const jwtService = new JwtService();

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        email: string;
        role: string;
      };
    }
  }
}

export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        ok: false,
        error: "Token de acceso requerido"
      });
    }

    const user = await jwtService.getUserFromToken(token);

    if (!user) {
      return res.status(401).json({
        ok: false,
        error: "Token inválido o expirado"
      });
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role
    };

    next();
  } catch (error: any) {
    return res.status(401).json({
      ok: false,
      error: error.message
    });
  }
};

// Middleware para verificar roles específicos
export const requireRole = (allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ 
        ok: false, 
        error: "Usuario no autenticado" 
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        ok: false, 
        error: "Permisos insuficientes para esta operación" 
      });
    }

    next();
  };
};

// Middleware específico para clientes
export const requireClient = requireRole([UserRole.CLIENT]);

// Middleware específico para agentes de ventas
export const requireSalesAgent = requireRole([UserRole.SALES_AGENT, UserRole.ADMIN]);

// Middleware específico para administradores
export const requireAdmin = requireRole([UserRole.ADMIN]);

// Middleware que permite múltiples roles
export const requireClientOrAgent = requireRole([UserRole.CLIENT, UserRole.SALES_AGENT, UserRole.ADMIN]);

// src/middlewares/jwtAuthMiddleware.ts
import { User, UserRole } from "@prisma/client";
import { verify } from "jsonwebtoken";
import { NextFunction, Request, Response } from "express";

interface JWTPayload {
  id: number;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

export const jwtAuthMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  // Los tokens JWT vienen en el formato "Bearer <token>"
  const token = authHeader?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ 
      ok: false, 
      error: "Token de acceso requerido" 
    });
  }

  try {
    // Verificar y decodificar el token JWT
    const decodedPayload = verify(token, process.env.JWT_SECRET!) as JWTPayload;

    // Validar que el payload tenga los campos requeridos
    if (!decodedPayload.id || !decodedPayload.email || !decodedPayload.role) {
      throw new Error("Token inválido: payload incompleto");
    }

    // Crear objeto user para req.user
    const user: User = {
      id: decodedPayload.id,
      email: decodedPayload.email,
      role: decodedPayload.role,
      firstName: '', // Se puede obtener de la DB si es necesario
      lastName: '',
      password: '',
      country: '',
      phone: null,
      documentNumber: null,
      address: null,
      city: null,
      postalCode: null,
      birthDate: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null
    };

    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ 
      ok: false, 
      error: "Token inválido o expirado" 
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

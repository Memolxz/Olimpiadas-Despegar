import { Request, Response, NextFunction } from "express";
import { UserRole } from "@prisma/client";

export const checkRole = (allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          ok: false,
          error: "Usuario no autenticado"
        });
      }

      if (!allowedRoles.includes(req.user.role as UserRole)) {
        return res.status(403).json({
          ok: false,
          error: "No tienes permisos para realizar esta acción"
        });
      }

      next();
    } catch (error: any) {
      return res.status(500).json({
        ok: false,
        error: error.message
      });
    }
  };
}; 
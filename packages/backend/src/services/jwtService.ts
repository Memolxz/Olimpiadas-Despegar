// src/services/jwtService.ts
import { sign, verify } from "jsonwebtoken";
import { User } from "@prisma/client";
import { db } from "../db/db";

type UserRole = "CLIENT" | "SALES_AGENT" | "ADMIN";

interface JWTPayload {
  id: number;
  email: string;
  role: UserRole;
}

export class JwtService {
  private readonly ACCESS_TOKEN_EXPIRY = '15m';
  private readonly REFRESH_TOKEN_EXPIRY = '7d';

  async generateAccessToken(user: User): Promise<string> {
    try {
      const payload: JWTPayload = {
        id: user.id,
        email: user.email,
        role: user.role
      };

      const token = sign(payload, process.env.JWT_SECRET!, { 
        expiresIn: this.ACCESS_TOKEN_EXPIRY 
      });

      return token;
    } catch (error) {
      console.error("Error generando access token:", error);
      throw new Error("Error al generar token de acceso");
    }
  }

  async generateRefreshToken(user: User): Promise<string> {
    try {
      const payload = { 
        id: user.id,
        type: 'refresh'
      };

      const token = sign(payload, process.env.JWT_REFRESH_SECRET!, { 
        expiresIn: this.REFRESH_TOKEN_EXPIRY 
      });

      return token;
    } catch (error) {
      console.error("Error generando refresh token:", error);
      throw new Error("Error al generar token de renovación");
    }
  }

  async generateTokenPair(user: User): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      const [accessToken, refreshToken] = await Promise.all([
        this.generateAccessToken(user),
        this.generateRefreshToken(user)
      ]);

      return { accessToken, refreshToken };
    } catch (error) {
      console.error("Error generando par de tokens:", error);
      throw new Error("Error al generar tokens de autenticación");
    }
  }

  async refreshAccessToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      // Verificar el refresh token
      const decoded = verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as { 
        id: number; 
        type: string 
      };
      
      if (decoded.type !== 'refresh') {
        throw new Error('Token de renovación inválido');
      }
      
      // Buscar el usuario
      const user = await db.user.findUnique({
        where: {
          id: decoded.id,
          deletedAt: null
        }
      });
      
      if (!user) {
        throw new Error('Usuario no encontrado o inactivo');
      }
      
      // Generar nuevos tokens
      const newTokens = await this.generateTokenPair(user);
      
      return newTokens;
    } catch (error) {
      console.error("Error renovando token:", error);
      throw new Error("Error al renovar token de acceso");
    }
  }

  async verifyAccessToken(token: string): Promise<JWTPayload> {
    try {
      const decoded = verify(token, process.env.JWT_SECRET!) as JWTPayload;
      return decoded;
    } catch (error) {
      console.error("Error verificando token:", error);
      throw new Error("Token de acceso inválido o expirado");
    }
  }

  async getUserFromToken(token: string): Promise<User | null> {
    try {
      const payload = await this.verifyAccessToken(token);
      
      const user = await db.user.findUnique({
        where: {
          id: payload.id,
          deletedAt: null
        }
      });

      return user;
    } catch (error) {
      console.error("Error obteniendo usuario desde token:", error);
      return null;
    }
  }

  // Método para invalidar tokens (logout)
  async invalidateUserTokens(userId: number): Promise<void> {
    try {
      // En un sistema real, mantendríamos una blacklist de tokens
      // Por ahora, podemos eliminar las sesiones del usuario
      await db.session.deleteMany({
        where: { userId }
      });
    } catch (error) {
      console.error("Error invalidando tokens:", error);
      throw new Error("Error al cerrar sesión");
    }
  }
}

// src/services/authService.ts
import { compare } from "bcrypt";
import { User } from "@prisma/client";
import { db } from "../db/db";

const UserRole = {
  CLIENT: "CLIENT",
  SALES_AGENT: "SALES_AGENT",
  ADMIN: "ADMIN"
} as const;

type UserRole = typeof UserRole[keyof typeof UserRole];

export class AuthService {
  async verifyUserCredentials(email: string, unencryptedPassword: string): Promise<User> {
    try {
      const user = await db.user.findFirst({
        where: {
          email,
          deletedAt: null
        }
      });

      if (!user) {
        throw new Error(`No se encontró el usuario con email ${email}`);
      }

      const validPassword = await compare(unencryptedPassword, user.password);

      if (!validPassword) {
        throw new Error("Credenciales inválidas");
      }

      return user;
    } catch (error) {
      console.error("Error en verificación de credenciales:", error);
      throw error;
    }
  }

  async registerUser(userData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    country: string;
    phone?: string;
    role?: UserRole;
  }): Promise<User> {
    try {
      // Verificar si el email ya existe
      const existingUser = await db.user.findFirst({
        where: { email: userData.email }
      });

      if (existingUser) {
        throw new Error("Ya existe un usuario con este email");
      }

      const user = await db.user.create({
        data: {
          ...userData,
          role: userData.role || UserRole.CLIENT
        }
      });

      return user;
    } catch (error) {
      console.error("Error en registro de usuario:", error);
      throw error;
    }
  }

  async updateUserProfile(userId: number, updateData: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    documentNumber?: string;
    address?: string;
    city?: string;
    postalCode?: string;
    birthDate?: Date;
  }): Promise<User> {
    try {
      const user = await db.user.update({
        where: { 
          id: userId,
          deletedAt: null 
        },
        data: updateData
      });

      return user;
    } catch (error) {
      console.error("Error actualizando perfil:", error);
      throw new Error("Error al actualizar el perfil del usuario");
    }
  }

  async changePassword(userId: number, currentPassword: string, newPassword: string): Promise<void> {
    try {
      const user = await db.user.findFirst({
        where: { 
          id: userId,
          deletedAt: null 
        }
      });

      if (!user) {
        throw new Error("Usuario no encontrado");
      }

      const validPassword = await compare(currentPassword, user.password);
      if (!validPassword) {
        throw new Error("Contraseña actual incorrecta");
      }

      const { hash } = await import("bcrypt");
      const hashedNewPassword = await hash(newPassword, 10);

      await db.user.update({
        where: { id: userId },
        data: { password: hashedNewPassword }
      });
    } catch (error) {
      console.error("Error cambiando contraseña:", error);
      throw error;
    }
  }

  async getUserProfile(userId: number): Promise<User | null> {
    try {
      const user = await db.user.findFirst({
        where: {
          id: userId,
          deletedAt: null
        },
        include: {
          orders: {
            where: { deletedAt: null },
            orderBy: { createdAt: 'desc' },
            take: 5 // Últimas 5 órdenes
          },
          preferences: true
        }
      });

      return user;
    } catch (error) {
      console.error("Error obteniendo perfil:", error);
      throw new Error("Error al obtener el perfil del usuario");
    }
  }
}

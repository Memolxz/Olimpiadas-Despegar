import { Prisma } from "@prisma/client";
import { hash } from "bcrypt"

import { db } from "../db/db";

type User = Prisma.UserGetPayload<{}>;
type UserRole = Prisma.UserRole;
type UserPreference = Prisma.UserPreferenceGetPayload<{}>;

interface CreateUserBody {
  firstName: string
  lastName: string
  email: string
  password: string
  country: string
  phone?: string
  role?: "CLIENT" | "SALES_AGENT" | "ADMIN"
}

interface UpdateUserBody {
  firstName?: string
  lastName?: string
  email?: string
  country?: string
  phone?: string
  documentNumber?: string
  address?: string
  city?: string
  postalCode?: string
  birthDate?: Date
}

interface UserPreferenceBody {
  key: string
  value: string
}

export class UserService {
  async getAllUsers(includeDeleted: boolean = false) {
    try {
      const users = await db.user.findMany({
        where: includeDeleted ? {} : { deletedAt: null },
        include: {
          orders: {
            take: 5,
            orderBy: { createdAt: 'desc' }
          },
          preferences: true
        }
      })

      return users;
    } catch (error) {
      console.error(error);
      throw new Error("Error al obtener usuarios");
    }
  }

  async getUserById(userId: number) {
    try {
      const user = await db.user.findFirst({
        where: {
          id: userId,
          deletedAt: null
        },
        include: {
          orders: {
            take: 5,
            orderBy: { createdAt: 'desc' }
          },
          preferences: true
        }
      })

      if (!user) {
        throw new Error(`No se encontró el usuario con id ${userId}`);
      }

      return user;
    } catch (error) {
      console.error(error);
      throw new Error(`Error al obtener usuario con id ${userId}`);
    }
  }

  async getUserProfileById(userId: number) {
    try {
      const userWithPosts = await db.user.findFirst({
        where: {
          id: userId,
          deletedAt: null
        },
        include: {
          posts: true
        }
      })

      if (!userWithPosts) {
        throw new Error(`No se encontró el usuario con id ${userId}`)
      }

      return userWithPosts;
    } catch (error) {
      console.error(error);
      throw new Error(`Error al obtener perfil de usuario con id ${userId}. Mira los logs para más información.`)
    }
  }

  async getUserByToken(token: string) {
    try {
      const user = await db.user.findFirst({
        where: {
          sessions: {
            some: {
              token,
              expiresAt: { gt: new Date() }
            }
          },
          deletedAt: null
        },
        include: {
          preferences: true
        }
      });

      if (!user) {
        throw new Error("No se encontró el usuario con el token proporcionado o la sesión expiró");
      }

      return user;
    } catch (error) {
      console.error(error);
      throw new Error("Error al obtener usuario por token");
    }
  }

  async createUser(body: CreateUserBody) {
    try {
      // Verificar si ya existe un usuario con ese email
      const existingUser = await db.user.findFirst({
        where: { email: body.email }
      });

      if (existingUser) {
        throw new Error("Ya existe un usuario con ese email");
      }

      const user = await db.user.create({
        data: {
          firstName: body.firstName,
          lastName: body.lastName,
          email: body.email,
          password: await hash(body.password, 10),
          country: body.country,
          phone: body.phone,
          role: body.role || "CLIENT",
          // Crear preferencias por defecto
          preferences: {
            createMany: {
              data: [
                { key: "notifyOrderUpdates", value: "true" },
                { key: "notifyPromotions", value: "false" },
                { key: "notifyTravelReminders", value: "true" },
                { key: "preferredCurrency", value: "USD" },
                { key: "preferredLanguage", value: "es" }
              ]
            }
          }
        },
        include: {
          preferences: true
        }
      });

      return user;
    } catch (error) {
      console.error("Error creando usuario:", error);
      throw error;
    }
  }

  async updateUser(userId: number, body: UpdateUserBody) {
    try {
      const existingUser = await db.user.findFirst({
        where: {
          id: userId,
          deletedAt: null
        }
      });

      if (!existingUser) {
        throw new Error(`No se encontró el usuario con id ${userId}`);
      }

      const updatedUser = await db.user.update({
        where: { id: userId },
        data: body,
        include: {
          preferences: true
        }
      });

      return updatedUser;
    } catch (error) {
      console.error("Error actualizando usuario:", error);
      throw error;
    }
  }

  async deleteUser(userId: number) {
    try {
      const existingUser = await db.user.findFirst({
        where: {
          id: userId,
          deletedAt: null
        }
      });

      if (!existingUser) {
        throw new Error(`No se encontró el usuario con id ${userId}`);
      }

      // Soft delete del usuario
      const deletedUser = await db.user.update({
        where: { id: userId },
        data: {
          deletedAt: new Date(),
          // Invalidar todas las sesiones
          sessions: {
            deleteMany: {}
          }
        }
      });

      return deletedUser;
    } catch (error) {
      console.error(error);
      throw new Error(`Error al eliminar el usuario con id ${userId}`);
    }
  }

  async updateUserPreferences(userId: number, preferences: UserPreferenceBody[]) {
    try {
      const existingUser = await db.user.findFirst({
        where: {
          id: userId,
          deletedAt: null
        }
      });

      if (!existingUser) {
        throw new Error(`No se encontró el usuario con id ${userId}`);
      }

      // Actualizar cada preferencia
      const updatedPreferences = await Promise.all(
        preferences.map(pref => 
          db.userPreference.upsert({
            where: {
              userId_key: {
                userId,
                key: pref.key
              }
            },
            create: {
              userId,
              ...pref
            },
            update: {
              value: pref.value
            }
          })
        )
      );

      return updatedPreferences;
    } catch (error) {
      console.error("Error actualizando preferencias:", error);
      throw error;
    }
  }

  async getUsersByRole(role: "CLIENT" | "SALES_AGENT" | "ADMIN") {
    try {
      const users = await db.user.findMany({
        where: {
          role,
          deletedAt: null
        },
        include: {
          preferences: true
        }
      });

      return users;
    } catch (error) {
      console.error("Error obteniendo usuarios por rol:", error);
      throw error;
    }
  }
}
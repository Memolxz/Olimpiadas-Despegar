import { User } from "@prisma/client";

import { hash } from "bcrypt"

import { db } from "../db/db";

interface CreateUserBody {
  firstName: string
  lastName: string
  email: string
  password: string
}

export class UserService {
  async getAllUsers() {
    try {
      const users = await db.user.findMany({
        where: {
          deletedAt: null
        },
        include: {
          posts: true
        }
      })

      return users;
    } catch (error) {
      console.error(error);
      throw new Error("Error al obtener usuarios. Mira los logs para más información.")
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
          posts: true
        }
      })

      if (!user) {
        throw new Error(`No se encontró el usuario con id ${userId}`)
      }

      return user;
    } catch (error) {
      console.error(error);
      throw new Error(`Error al obtener usuario con id ${userId}. Mira los logs para más información.`)
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
              token
            }
          }
        }
      })

      if (!user) {
        throw new Error("No se encontró el usuario con el token proporcionado")
      }

      return user;
    }
    catch (error) {
      console.error(error);
      throw new Error("Error al obtener usuario por token. Mira los logs para más información.")
    }
  }

  async createUser(body: CreateUserBody) {
    try {
      const user = await db.user.create({
        data: {
          firstName: body.firstName,
          lastName: body.lastName,
          email: body.email,
          password: await hash(body.password, 10),
        }
      })

      return user;
    } catch (error) {
      console.error("Error creando usuario: ", body)
      console.error(error);
      throw new Error("Error al crear usuario. Mira los logs para más información.")
    }
  }

  async updateUser(body: User) {
    try {

      const existingUser = await db.user.findFirst({
        where: {
          id: body.id,
          deletedAt: null
        }
      })

      if (!existingUser) {
        throw new Error(`No se encontró el usuario con id ${body.id}`)
      }

      const updatedUser = await db.user.update({
        where: { id: body.id, deletedAt: null },
        data: body
      })

      return updatedUser
    } catch (error) {
      console.error("Error actualizando usuario: ", body)
      console.error(error);
      throw new Error(`Error al actualizar el usuario con id ${body.id}. Mira los logs para más información.`)
    }
  }

  async deleteUser(userId: number) {
    try {
      const existingUser = await db.post.findFirst({
        where: {
          id: userId,
          deletedAt: null
        }
      })

      if (!existingUser) {
        throw new Error(`No se encontró el posteo con id ${userId}`)
      }

      const deletedUser = await db.post.update({
        where: { id: userId },
        data: {
          deletedAt: new Date()
        }
      })

      return deletedUser;
    } catch (error) {
      console.error(error);
      throw new Error(`Error al eliminar el usuario con id ${userId}. Mira los logs para más información.`)
    }
  }
}


import { Post } from "@prisma/client";

import { db } from "../db/db";

interface CreatePostBody {
  content: string
  authorId: number
}

export class PostService {
  async getAllPosts() {
    try {
      const posts = await db.post.findMany({
        where: {
          deletedAt: null
        },
        include: {
          author: true
        }
      });

      return posts;
    } catch (error) {
      console.error(error);
      throw new Error("Error al obtener posteos. Mira los logs para más información.")
    }
  }

  async getPostById(postId: number) {
    try {
      const post = await db.post.findFirst({
        where: { id: postId, deletedAt: null },
        include: {
          author: true
        }
      })

      if (!post) {
        throw new Error(`No se encontró el posteo con id ${post}`)
      }

      return post;
    } catch (error) {
      console.error(error);
      throw new Error(`Error al obtener posteo con id ${postId}. Mira los logs para más información.`)
    }
  }

  async createPost(body: CreatePostBody) {
    try {
      const post = await db.post.create({
        data: body
      })

      return post;
    } catch (error) {
      console.error("Error creando posteo: ", body)
      console.error(error);
      throw new Error("Error al crear posteo. Mira los logs para más información.")
    }
  }

  async updatePost(body: Post) {
    try {

      const existingPost = await db.post.findFirst({
        where: {
          id: body.id,
          deletedAt: null
        }
      })

      if (!existingPost) {
        throw new Error(`No se encontró el posteo con id ${body.id}`)
      }

      const updatedPost = await db.post.update({
        where: { id: body.id, deletedAt: null },
        data: body
      })

      return updatedPost
    } catch (error) {
      console.error("Error actualizando posteo: ", body)
      console.error(error);
      throw new Error(`Error al actualizar el posteo con id ${body.id}. Mira los logs para más información.`)
    }
  }

  async deletePost(postId: number) {
    try {

      const existingPost = await db.post.findFirst({
        where: {
          id: postId,
          deletedAt: null
        }
      })

      if (!existingPost) {
        throw new Error(`No se encontró el posteo con id ${postId}`)
      }

      const deletedPost = await db.post.update({
        where: { id: postId },
        data: {
          deletedAt: new Date()
        }
      })

      return deletedPost;
    } catch (error) {
      console.error(error);
      throw new Error(`Error al eliminar el posteo con id ${postId}. Mira los logs para más información.`)
    }
  }
}
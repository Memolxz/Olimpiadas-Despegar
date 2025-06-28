// src/services/productService.ts
import { Product, ProductType, Prisma } from "@prisma/client";
import { db } from "../db/db";

interface CreateProductBody {
  name: string;
  description?: string;
  type: ProductType;
  basePrice: number;
  currency?: string;
  providerId?: number;
  specificData?: any;
}

interface ProductFilter {
  type?: ProductType;
  minPrice?: number;
  maxPrice?: number;
  available?: boolean;
  providerId?: number;
  search?: string;
}

export class ProductService {
  async getAllProducts(filters?: ProductFilter) {
    try {
      const where: Prisma.ProductWhereInput = {
        deletedAt: null,
        available: filters?.available ?? true
      };

      // Aplicar filtros
      if (filters?.type) {
        where.type = filters.type;
      }

      if (filters?.minPrice || filters?.maxPrice) {
        where.basePrice = {};
        if (filters.minPrice) {
          where.basePrice.gte = filters.minPrice;
        }
        if (filters.maxPrice) {
          where.basePrice.lte = filters.maxPrice;
        }
      }

      if (filters?.providerId) {
        where.providerId = filters.providerId;
      }

      if (filters?.search) {
        where.OR = [
          { name: { contains: filters.search, mode: 'insensitive' } },
          { description: { contains: filters.search, mode: 'insensitive' } }
        ];
      }

      const products = await db.product.findMany({
        where,
        include: {
          provider: true
        },
        orderBy: { createdAt: 'desc' }
      });

      return products;
    } catch (error) {
      console.error("Error obteniendo productos:", error);
      throw new Error("Error al obtener productos");
    }
  }

  async getProductById(productId: number) {
    try {
      const product = await db.product.findFirst({
        where: { 
          id: productId, 
          deletedAt: null 
        },
        include: {
          provider: true
        }
      });

      if (!product) {
        throw new Error(`No se encontró el producto con id ${productId}`);
      }

      return product;
    } catch (error) {
      console.error("Error obteniendo producto:", error);
      throw error;
    }
  }

  async createProduct(body: CreateProductBody) {
    try {
      const product = await db.product.create({
        data: {
          name: body.name,
          description: body.description,
          type: body.type,
          basePrice: body.basePrice,
          currency: body.currency || 'USD',
          providerId: body.providerId,
          specificData: body.specificData || {}
        },
        include: {
          provider: true
        }
      });

      return product;
    } catch (error) {
      console.error("Error creando producto:", error);
      throw new Error("Error al crear producto");
    }
  }

  async updateProduct(productId: number, updateData: Partial<CreateProductBody>) {
    try {
      const existingProduct = await db.product.findFirst({
        where: { 
          id: productId, 
          deletedAt: null 
        }
      });

      if (!existingProduct) {
        throw new Error(`No se encontró el producto con id ${productId}`);
      }

      const product = await db.product.update({
        where: { id: productId },
        data: updateData,
        include: {
          provider: true
        }
      });

      return product;
    } catch (error) {
      console.error("Error actualizando producto:", error);
      throw error;
    }
  }

  async deleteProduct(productId: number) {
    try {
      const existingProduct = await db.product.findFirst({
        where: { 
          id: productId, 
          deletedAt: null 
        }
      });

      if (!existingProduct) {
        throw new Error(`No se encontró el producto con id ${productId}`);
      }

      await db.product.update({
        where: { id: productId },
        data: { deletedAt: new Date() }
      });

      return true;
    } catch (error) {
      console.error("Error eliminando producto:", error);
      throw error;
    }
  }

  async getProductsByType(type: ProductType) {
    try {
      const products = await db.product.findMany({
        where: { 
          type, 
          deletedAt: null,
          available: true 
        },
        include: {
          provider: true
        },
        orderBy: { basePrice: 'asc' }
      });

      return products;
    } catch (error) {
      console.error("Error obteniendo productos por tipo:", error);
      throw new Error("Error al obtener productos por tipo");
    }
  }

  async toggleProductAvailability(productId: number) {
    try {
      const product = await this.getProductById(productId);
      
      const updatedProduct = await db.product.update({
        where: { id: productId },
        data: { available: !product.available },
        include: {
          provider: true
        }
      });

      return updatedProduct;
    } catch (error) {
      console.error("Error cambiando disponibilidad:", error);
      throw error;
    }
  }
}
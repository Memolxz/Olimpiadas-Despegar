// src/services/packageService.ts
import { Package, PackageItem } from "@prisma/client";
import { db } from "../db/db";

interface CreatePackageBody {
  name: string;
  description?: string;
  totalPrice: number;
  currency?: string;
  isCustom?: boolean;
  productIds: { productId: number; quantity: number }[];
}

interface PackageWithItems extends Package {
  items: (PackageItem & {
    product: {
      id: number;
      name: string;
      type: string;
      basePrice: number;
    };
  })[];
}

export class PackageService {
  async getAllPackages() {
    try {
      const packages = await db.package.findMany({
        where: {
          deletedAt: null,
          available: true
        },
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  type: true,
                  basePrice: true,
                  currency: true
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      return packages;
    } catch (error) {
      console.error("Error obteniendo paquetes:", error);
      throw new Error("Error al obtener paquetes");
    }
  }

  async getPackageById(packageId: number): Promise<PackageWithItems> {
    try {
      const packageData = await db.package.findFirst({
        where: { 
          id: packageId, 
          deletedAt: null 
        },
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  type: true,
                  basePrice: true,
                  currency: true,
                  description: true,
                  specificData: true
                }
              }
            }
          }
        }
      });

      if (!packageData) {
        throw new Error(`No se encontró el paquete con id ${packageId}`);
      }

      return packageData as PackageWithItems;
    } catch (error) {
      console.error("Error obteniendo paquete:", error);
      throw error;
    }
  }

  async createPackage(body: CreatePackageBody) {
    try {
      // Validar que todos los productos existan
      const products = await db.product.findMany({
        where: {
          id: { in: body.productIds.map(item => item.productId) },
          deletedAt: null,
          available: true
        }
      });

      if (products.length !== body.productIds.length) {
        throw new Error("Algunos productos no están disponibles");
      }

      // Crear el paquete usando una transacción
      const packageData = await db.$transaction(async (tx) => {
        // Crear el paquete
        const newPackage = await tx.package.create({
          data: {
            name: body.name,
            description: body.description,
            totalPrice: body.totalPrice,
            currency: body.currency || 'USD',
            isCustom: body.isCustom || false
          }
        });

        // Crear los items del paquete
        const packageItems = await Promise.all(
          body.productIds.map(item => 
            tx.packageItem.create({
              data: {
                packageId: newPackage.id,
                productId: item.productId,
                quantity: item.quantity
              }
            })
          )
        );

        return { ...newPackage, items: packageItems };
      });

      // Obtener el paquete completo con sus items
      return await this.getPackageById(packageData.id);
    } catch (error) {
      console.error("Error creando paquete:", error);
      throw error;
    }
  }

  async updatePackage(packageId: number, updateData: {
    name?: string;
    description?: string;
    totalPrice?: number;
    currency?: string;
    available?: boolean;
  }) {
    try {
      const existingPackage = await db.package.findFirst({
        where: { 
          id: packageId, 
          deletedAt: null 
        }
      });

      if (!existingPackage) {
        throw new Error(`No se encontró el paquete con id ${packageId}`);
      }

      const updatedPackage = await db.package.update({
        where: { id: packageId },
        data: updateData
      });

      return await this.getPackageById(updatedPackage.id);
    } catch (error) {
      console.error("Error actualizando paquete:", error);
      throw error;
    }
  }

  async deletePackage(packageId: number) {
    try {
      const existingPackage = await db.package.findFirst({
        where: { 
          id: packageId, 
          deletedAt: null 
        }
      });

      if (!existingPackage) {
        throw new Error(`No se encontró el paquete con id ${packageId}`);
      }

      await db.package.update({
        where: { id: packageId },
        data: { deletedAt: new Date() }
      });

      return true;
    } catch (error) {
      console.error("Error eliminando paquete:", error);
      throw error;
    }
  }

  async addProductToPackage(packageId: number, productId: number, quantity: number = 1) {
    try {
      const packageExists = await db.package.findFirst({
        where: { id: packageId, deletedAt: null }
      });

      if (!packageExists) {
        throw new Error(`No se encontró el paquete con id ${packageId}`);
      }

      const productExists = await db.product.findFirst({
        where: { id: productId, deletedAt: null, available: true }
      });

      if (!productExists) {
        throw new Error(`No se encontró el producto con id ${productId}`);
      }

      const packageItem = await db.packageItem.create({
        data: {
          packageId,
          productId,
          quantity
        }
      });

      return await this.getPackageById(packageId);
    } catch (error) {
      console.error("Error agregando producto al paquete:", error);
      throw error;
    }
  }

  async removeProductFromPackage(packageId: number, productId: number) {
    try {
      const packageItem = await db.packageItem.findFirst({
        where: { packageId, productId }
      });

      if (!packageItem) {
        throw new Error("El producto no existe en este paquete");
      }

      await db.packageItem.delete({
        where: { id: packageItem.id }
      });

      return await this.getPackageById(packageId);
    } catch (error) {
      console.error("Error removiendo producto del paquete:", error);
      throw error;
    }
  }

  async getCustomPackagesForUser(userId: number) {
    try {
      const customPackages = await db.package.findMany({
        where: {
          isCustom: true,
          deletedAt: null,
          // Aquí podrías agregar una relación con el usuario si la implementas
        },
        include: {
          items: {
            include: {
              product: true
            }
          }
        }
      });

      return customPackages;
    } catch (error) {
      console.error("Error obteniendo paquetes personalizados:", error);
      throw new Error("Error al obtener paquetes personalizados");
    }
  }
}
// src/services/cartService.ts
import { CartItem } from "@prisma/client";
import { db } from "../db/db";

interface CartItemWithDetails extends CartItem {
  product?: {
    id: number;
    name: string;
    type: string;
    basePrice: number;
    currency: string;
    available: boolean;
  };
  package?: {
    id: number;
    name: string;
    totalPrice: number;
    currency: string;
    available: boolean;
  };
}

interface AddToCartBody {
  productId?: number;
  packageId?: number;
  quantity?: number;
}

export class CartService {
  async getCartByUserId(userId: number): Promise<CartItemWithDetails[]> {
    try {
      const cartItems = await db.cartItem.findMany({
        where: { userId },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              type: true,
              basePrice: true,
              currency: true,
              available: true,
              description: true
            }
          },
          package: {
            select: {
              id: true,
              name: true,
              totalPrice: true,
              currency: true,
              available: true,
              description: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      return cartItems as CartItemWithDetails[];
    } catch (error) {
      console.error("Error obteniendo carrito:", error);
      throw new Error("Error al obtener carrito");
    }
  }

  async addToCart(userId: number, body: AddToCartBody) {
    try {
      if (!body.productId && !body.packageId) {
        throw new Error("Debe especificar un producto o paquete");
      }

      if (body.productId && body.packageId) {
        throw new Error("No puede agregar un producto y paquete al mismo tiempo");
      }

      const quantity = body.quantity || 1;

      // Validar que el producto o paquete exista y esté disponible
      if (body.productId) {
        const product = await db.product.findFirst({
          where: { 
            id: body.productId, 
            deletedAt: null, 
            available: true 
          }
        });

        if (!product) {
          throw new Error("Producto no encontrado o no disponible");
        }
      }

      if (body.packageId) {
        const packageData = await db.package.findFirst({
          where: { 
            id: body.packageId, 
            deletedAt: null, 
            available: true 
          }
        });

        if (!packageData) {
          throw new Error("Paquete no encontrado o no disponible");
        }
      }

      // Verificar si el item ya existe en el carrito
      const existingItem = await db.cartItem.findFirst({
        where: {
          userId,
          productId: body.productId || null,
          packageId: body.packageId || null
        }
      });

      let cartItem;

      if (existingItem) {
        // Actualizar cantidad si ya existe
        cartItem = await db.cartItem.update({
          where: { id: existingItem.id },
          data: { quantity: existingItem.quantity + quantity }
        });
      } else {
        // Crear nuevo item
        cartItem = await db.cartItem.create({
          data: {
            userId,
            productId: body.productId,
            packageId: body.packageId,
            quantity
          }
        });
      }

      return await this.getCartItemById(cartItem.id);
    } catch (error) {
      console.error("Error agregando al carrito:", error);
      throw error;
    }
  }

  async updateCartItem(userId: number, cartItemId: number, quantity: number) {
    try {
      const existingItem = await db.cartItem.findFirst({
        where: { 
          id: cartItemId, 
          userId 
        }
      });

      if (!existingItem) {
        throw new Error("Item del carrito no encontrado");
      }

      if (quantity <= 0) {
        // Si la cantidad es 0 o negativa, eliminar el item
        await db.cartItem.delete({
          where: { id: cartItemId }
        });
        return null;
      }

      const updatedItem = await db.cartItem.update({
        where: { id: cartItemId },
        data: { quantity }
      });

      return await this.getCartItemById(updatedItem.id);
    } catch (error) {
      console.error("Error actualizando item del carrito:", error);
      throw error;
    }
  }

  async removeFromCart(userId: number, cartItemId: number) {
    try {
      const existingItem = await db.cartItem.findFirst({
        where: { 
          id: cartItemId, 
          userId 
        }
      });

      if (!existingItem) {
        throw new Error("Item del carrito no encontrado");
      }

      await db.cartItem.delete({
        where: { id: cartItemId }
      });

      return true;
    } catch (error) {
      console.error("Error removiendo del carrito:", error);
      throw error;
    }
  }

  async clearCart(userId: number) {
    try {
      await db.cartItem.deleteMany({
        where: { userId }
      });

      return true;
    } catch (error) {
      console.error("Error limpiando carrito:", error);
      throw new Error("Error al limpiar carrito");
    }
  }

  async getCartSummary(userId: number) {
    try {
      const cartItems = await this.getCartByUserId(userId);
      
      let totalAmount = 0;
      let totalItems = 0;
      const currencies = new Set<string>();

      for (const item of cartItems) {
        totalItems += item.quantity;
        
        if (item.product) {
          totalAmount += Number(item.product.basePrice) * item.quantity;
          currencies.add(item.product.currency);
        }
        
        if (item.package) {
          totalAmount += Number(item.package.totalPrice) * item.quantity;
          currencies.add(item.package.currency);
        }
      }

      return {
        items: cartItems,
        totalItems,
        totalAmount,
        currency: currencies.size === 1 ? Array.from(currencies)[0] : 'MIXED',
        isEmpty: cartItems.length === 0
      };
    } catch (error) {
      console.error("Error obteniendo resumen del carrito:", error);
      throw new Error("Error al obtener resumen del carrito");
    }
  }

  private async getCartItemById(cartItemId: number): Promise<CartItemWithDetails> {
    const cartItem = await db.cartItem.findUnique({
      where: { id: cartItemId },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            type: true,
            basePrice: true,
            currency: true,
            available: true,
            description: true
          }
        },
        package: {
          select: {
            id: true,
            name: true,
            totalPrice: true,
            currency: true,
            available: true,
            description: true
          }
        }
      }
    });

    if (!cartItem) {
      throw new Error("Item del carrito no encontrado");
    }

    return cartItem as CartItemWithDetails;
  }

  async validateCartForCheckout(userId: number) {
    try {
      const cartItems = await this.getCartByUserId(userId);
      
      if (cartItems.length === 0) {
        throw new Error("El carrito está vacío");
      }

      const unavailableItems: string[] = [];

      for (const item of cartItems) {
        if (item.product && !item.product.available) {
          unavailableItems.push(`Producto: ${item.product.name}`);
        }
        if (item.package && !item.package.available) {
          unavailableItems.push(`Paquete: ${item.package.name}`);
        }
      }

      if (unavailableItems.length > 0) {
        throw new Error(`Los siguientes items ya no están disponibles: ${unavailableItems.join(', ')}`);
      }

      return true;
    } catch (error) {
      console.error("Error validando carrito:", error);
      throw error;
    }
  }
}
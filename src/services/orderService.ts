// src/services/orderService.ts
import { Order, OrderStatus, OrderItem } from "@prisma/client";
import { db } from "../db/db";
import { CartService } from "./cartService";

interface CreateOrderBody {
  billingInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    documentNumber: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
  };
}

interface OrderWithDetails extends Order {
  items: (OrderItem & {
    product?: {
      id: number;
      name: string;
      type: string;
    };
    package?: {
      id: number;
      name: string;
    };
  })[];
  user: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export class OrderService {
  private cartService = new CartService();

  async createOrderFromCart(userId: number, body: CreateOrderBody): Promise<OrderWithDetails> {
    try {
      // Validar carrito
      await this.cartService.validateCartForCheckout(userId);
      
      // Obtener items del carrito
      const cartSummary = await this.cartService.getCartSummary(userId);
      
      if (cartSummary.isEmpty) {
        throw new Error("El carrito está vacío");
      }

      // Generar número de orden único
      const orderNumber = await this.generateOrderNumber();

      // Crear orden usando transacción
      const order = await db.$transaction(async (tx) => {
        // Crear la orden
        const newOrder = await tx.order.create({
          data: {
            orderNumber,
            userId,
            status: OrderStatus.PENDING,
            totalAmount: cartSummary.totalAmount,
            currency: cartSummary.currency,
            billingInfo: body.billingInfo
          }
        });

        // Crear items de la orden basados en el carrito
        const orderItems = await Promise.all(
          cartSummary.items.map(cartItem => 
            tx.orderItem.create({
              data: {
                orderId: newOrder.id,
                productId: cartItem.productId,
                packageId: cartItem.packageId,
                quantity: cartItem.quantity,
                unitPrice: cartItem.product?.basePrice || cartItem.package?.totalPrice || 0,
                totalPrice: (cartItem.product?.basePrice || cartItem.package?.totalPrice || 0) * cartItem.quantity
              }
            })
          )
        );

        return { ...newOrder, items: orderItems };
      });

      // Limpiar carrito después de crear la orden
      await this.cartService.clearCart(userId);

      // Obtener orden completa
      return await this.getOrderById(order.id);
    } catch (error) {
      console.error("Error creando orden:", error);
      throw error;
    }
  }

  async getOrderById(orderId: number): Promise<OrderWithDetails> {
    try {
      const order = await db.order.findFirst({
        where: { id: orderId },
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  type: true,
                  description: true
                }
              },
              package: {
                select: {
                  id: true,
                  name: true,
                  description: true
                }
              }
            }
          },
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          },
          payments: true
        }
      });

      if (!order) {
        throw new Error(`No se encontró la orden con id ${orderId}`);
      }

      return order as OrderWithDetails;
    } catch (error) {
      console.error("Error obteniendo orden:", error);
      throw error;
    }
  }

  async getOrderByNumber(orderNumber: string): Promise<OrderWithDetails> {
    try {
      const order = await db.order.findFirst({
        where: { orderNumber },
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  type: true,
                  description: true
                }
              },
              package: {
                select: {
                  id: true,
                  name: true,
                  description: true
                }
              }
            }
          },
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          },
          payments: true
        }
      });

      if (!order) {
        throw new Error(`No se encontró la orden con número ${orderNumber}`);
      }

      return order as OrderWithDetails;
    } catch (error) {
      console.error("Error obteniendo orden por número:", error);
      throw error;
    }
  }

  async getUserOrders(userId: number) {
    try {
      const orders = await db.order.findMany({
        where: { userId },
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  type: true
                }
              },
              package: {
                select: {
                  id: true,
                  name: true
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      return orders;
    } catch (error) {
      console.error("Error obteniendo órdenes del usuario:", error);
      throw new Error("Error al obtener órdenes del usuario");
    }
  }

  async getAllOrders(filters?: {
    status?: OrderStatus;
    userId?: number;
    dateFrom?: Date;
    dateTo?: Date;
  }) {
    try {
      const where: any = {};

      if (filters?.status) {
        where.status = filters.status;
      }

      if (filters?.userId) {
        where.userId = filters.userId;
      }

      if (filters?.dateFrom || filters?.dateTo) {
        where.createdAt = {};
        if (filters.dateFrom) {
          where.createdAt.gte = filters.dateFrom;
        }
        if (filters.dateTo) {
          where.createdAt.lte = filters.dateTo;
        }
      }

      const orders = await db.order.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          },
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  type: true
                }
              },
              package: {
                select: {
                  id: true,
                  name: true
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      return orders;
    } catch (error) {
      console.error("Error obteniendo todas las órdenes:", error);
      throw new Error("Error al obtener órdenes");
    }
  }

  async updateOrderStatus(orderId: number, status: OrderStatus, internalNotes?: string) {
    try {
      const order = await db.order.update({
        where: { id: orderId },
        data: { 
          status,
          internalNotes: internalNotes || undefined
        }
      });

      // TODO: Enviar notificación al usuario sobre el cambio de estado
      
      return await this.getOrderById(order.id);
    } catch (error) {
      console.error("Error actualizando estado de orden:", error);
      throw new Error("Error al actualizar estado de orden");
    }
  }

  async cancelOrder(orderId: number, reason?: string) {
    try {
      const order = await this.getOrderById(orderId);

      if (order.status === OrderStatus.COMPLETED) {
        throw new Error("No se puede cancel
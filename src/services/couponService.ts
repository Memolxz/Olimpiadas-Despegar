import { db } from "../db/db";

interface OrderItemWithDetails {
  product?: {
    type: string;
  };
  package?: {
    items?: Array<{
      product?: {
        type: string;
      };
    }>;
  };
}

interface CreateCouponBody {
  code: string;
  description?: string;
  discountType: "percentage" | "fixed_amount";
  discountValue: number;
  minAmount?: number;
  maxUses?: number;
  validFrom: Date;
  validUntil: Date;
}

export class CouponService {
  async createCoupon(body: CreateCouponBody) {
    try {
      // Verificar si ya existe un cupón con el mismo código
      const existingCoupon = await db.coupon.findFirst({
        where: { code: body.code }
      });

      if (existingCoupon) {
        throw new Error(`Ya existe un cupón con el código ${body.code}`);
      }

      const coupon = await db.coupon.create({
        data: {
          code: body.code.toUpperCase(),
          description: body.description,
          discountType: body.discountType,
          discountValue: body.discountValue,
          minAmount: body.minAmount,
          maxUses: body.maxUses,
          currentUses: 0,
          validFrom: body.validFrom,
          validUntil: body.validUntil,
          active: true
        }
      });

      return coupon;
    } catch (error) {
      console.error("Error creando cupón:", error);
      throw error;
    }
  }

  async validateCoupon(code: string, orderAmount: number) {
    try {
      const coupon = await db.coupon.findFirst({
        where: {
          code: code.toUpperCase(),
          active: true,
          validFrom: { lte: new Date() },
          validUntil: { gte: new Date() }
        }
      });

      if (!coupon) {
        throw new Error("Cupón no válido o expirado");
      }

      // Verificar monto mínimo de orden
      if (coupon.minAmount && orderAmount < coupon.minAmount) {
        throw new Error(`El monto mínimo para usar este cupón es ${coupon.minAmount}`);
      }

      // Verificar número máximo de usos
      if (coupon.maxUses && coupon.currentUses >= coupon.maxUses) {
        throw new Error("Este cupón ya alcanzó su límite máximo de usos");
      }

      // Calcular descuento
      let discountAmount = 0;
      if (coupon.discountType === "percentage") {
        discountAmount = (orderAmount * coupon.discountValue) / 100;
      } else {
        discountAmount = coupon.discountValue;
      }

      return {
        isValid: true,
        coupon,
        discountAmount
      };
    } catch (error) {
      console.error("Error validando cupón:", error);
      throw error;
    }
  }

  async applyCouponToOrder(orderId: number, code: string) {
    try {
      const order = await db.order.findFirst({
        where: { id: orderId }
      });

      if (!order) {
        throw new Error("Orden no encontrada");
      }

      // Validar cupón
      const validation = await this.validateCoupon(code, order.totalAmount);

      // Incrementar contador de usos
      await db.coupon.update({
        where: { code: validation.coupon.code },
        data: { currentUses: { increment: 1 } }
      });

      // Aplicar descuento a la orden
      const updatedOrder = await db.order.update({
        where: { id: orderId },
        data: {
          totalAmount: order.totalAmount - validation.discountAmount
        }
      });

      return updatedOrder;
    } catch (error) {
      console.error("Error aplicando cupón:", error);
      throw error;
    }
  }

  async getCouponByCode(code: string) {
    try {
      const coupon = await db.coupon.findFirst({
        where: { code: code.toUpperCase() }
      });

      if (!coupon) {
        throw new Error(`No se encontró el cupón con código ${code}`);
      }

      return coupon;
    } catch (error) {
      console.error("Error obteniendo cupón:", error);
      throw error;
    }
  }

  async getAllActiveCoupons() {
    try {
      const coupons = await db.coupon.findMany({
        where: {
          active: true,
          validUntil: { gte: new Date() }
        },
        orderBy: { validUntil: 'asc' }
      });

      return coupons;
    } catch (error) {
      console.error("Error obteniendo cupones:", error);
      throw error;
    }
  }

  async deactivateCoupon(code: string) {
    try {
      const coupon = await db.coupon.update({
        where: { code: code.toUpperCase() },
        data: { active: false }
      });

      return coupon;
    } catch (error) {
      console.error("Error desactivando cupón:", error);
      throw error;
    }
  }
} 
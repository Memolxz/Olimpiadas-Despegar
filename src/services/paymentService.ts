import { PrismaClient, Payment, PaymentMethod, PaymentStatus } from "@prisma/client";

const prisma = new PrismaClient();

export interface CreatePaymentBody {
  orderId: number;
  paymentMethod: PaymentMethod;
  paymentDetails: {
    cardNumber?: string;
    cardHolder?: string;
    expirationDate?: string;
    cvv?: string;
    transferId?: string;
    bankName?: string;
  };
}

export interface PaymentFilters {
  status?: PaymentStatus;
  startDate?: Date;
  endDate?: Date;
}

export class PaymentService {
  async processPayment(data: CreatePaymentBody & { userId: number }): Promise<Payment> {
    const { orderId, userId, paymentMethod, paymentDetails } = data;

    // Verificar que la orden exista y pertenezca al usuario
    const order = await prisma.order.findUnique({
      where: { id: orderId }
    });

    if (!order) {
      throw new Error("Orden no encontrada");
    }

    if (order.userId !== userId) {
      throw new Error("La orden no pertenece al usuario");
    }

    // Crear el pago
    const payment = await prisma.payment.create({
      data: {
        orderId,
        userId,
        amount: order.totalAmount,
        method: paymentMethod,
        paymentDetails,
        status: PaymentStatus.PENDING
      }
    });

    // TODO: Integrar con gateway de pago real
    // Por ahora simulamos un pago exitoso
    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: PaymentStatus.COMPLETED }
    });

    return payment;
  }

  async getPaymentStatus(paymentId: number, userId: number): Promise<Payment> {
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId }
    });

    if (!payment) {
      throw new Error("Pago no encontrado");
    }

    if (payment.userId !== userId) {
      throw new Error("El pago no pertenece al usuario");
    }

    return payment;
  }

  async cancelPayment(paymentId: number, userId: number): Promise<Payment> {
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId }
    });

    if (!payment) {
      throw new Error("Pago no encontrado");
    }

    if (payment.userId !== userId) {
      throw new Error("El pago no pertenece al usuario");
    }

    if (payment.status !== PaymentStatus.PENDING) {
      throw new Error("Solo se pueden cancelar pagos pendientes");
    }

    return await prisma.payment.update({
      where: { id: paymentId },
      data: { status: PaymentStatus.CANCELLED }
    });
  }

  async getAllPayments(filters: PaymentFilters): Promise<Payment[]> {
    const { status, startDate, endDate } = filters;

    return await prisma.payment.findMany({
      where: {
        status,
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      },
      orderBy: { createdAt: "desc" }
    });
  }

  async refundPayment(paymentId: number, reason: string): Promise<Payment> {
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId }
    });

    if (!payment) {
      throw new Error("Pago no encontrado");
    }

    if (payment.status !== PaymentStatus.COMPLETED) {
      throw new Error("Solo se pueden reembolsar pagos completados");
    }

    // TODO: Integrar con gateway de pago real para procesar el reembolso
    return await prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: PaymentStatus.REFUNDED,
        refundReason: reason
      }
    });
  }
} 
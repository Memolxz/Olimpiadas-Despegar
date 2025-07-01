import { Order, User, Notification, Prisma } from "@prisma/client";
import { db } from "../db/db";
import nodemailer from "nodemailer";

interface NotificationTemplate {
  subject: string;
  body: string;
}

type NotificationType = 'ORDER_CREATED' | 'ORDER_PAID' | 'ORDER_STATUS_UPDATE' | 'TRAVEL_REMINDER';

export class NotificationService {
  private emailTransporter: nodemailer.Transporter;

  constructor() {
    // Configuración básica de nodemailer (se debería usar variables de entorno)
    this.emailTransporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.empresa.com",
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: false,
      auth: {
        user: process.env.SMTP_USER || "notificaciones@empresa.com",
        pass: process.env.SMTP_PASS || "password"
      }
    });
  }

  private templates = {
    ORDER_CREATED: (order: Order): NotificationTemplate => ({
      subject: `Orden #${order.orderNumber} creada`,
      body: `Tu orden #${order.orderNumber} ha sido creada exitosamente. Total: ${order.totalAmount} ${order.currency}`
    }),
    ORDER_PAID: (order: Order): NotificationTemplate => ({
      subject: `Pago confirmado - Orden #${order.orderNumber}`,
      body: `El pago de tu orden #${order.orderNumber} ha sido confirmado. Gracias por tu compra!`
    }),
    ORDER_STATUS_UPDATE: (order: Order): NotificationTemplate => ({
      subject: `Actualización de orden #${order.orderNumber}`,
      body: `El estado de tu orden #${order.orderNumber} ha sido actualizado a: ${order.status}`
    }),
    TRAVEL_REMINDER: (order: Order): NotificationTemplate => ({
      subject: `Recordatorio de viaje - Orden #${order.orderNumber}`,
      body: `Tu viaje está próximo! Revisa los detalles de tu orden #${order.orderNumber}`
    })
  };

  private async getEmailConfig(type: string) {
    const config = await db.$queryRaw`
      SELECT * FROM EmailConfig WHERE type = ${type} LIMIT 1
    `;
    
    if (!config || !Array.isArray(config) || config.length === 0) {
      throw new Error(`No se encontró configuración de email para el tipo: ${type}`);
    }
    
    return config[0];
  }

  private async sendEmail(to: string[], subject: string, body: string) {
    try {
      await this.emailTransporter.sendMail({
        from: process.env.SMTP_FROM || "notificaciones@empresa.com",
        to: to.join(", "),
        subject,
        text: body
      });
    } catch (error) {
      console.error("Error enviando email:", error);
      throw new Error("Error al enviar email");
    }
  }

  async createNotification(userId: number, type: NotificationType, orderData?: Order) {
    try {
      let message = '';
      
      if (orderData) {
        const template = this.templates[type](orderData);
        message = template.body;
      }

      // Crear la notificación en la base de datos
      const notification = await db.notification.create({
        data: {
          type,
          message,
          user: {
            connect: {
              id: userId
            }
          }
        }
      });

      // Si hay datos de orden, enviar email
      if (orderData) {
        const order = await db.order.findUnique({
          where: { id: orderData.id },
          include: { user: true }
        });

        if (order) {
          // Obtener la plantilla según el tipo
          const template = this.templates[type](order);
          
          // Obtener la configuración de email
          const emailConfig = await this.getEmailConfig(type);
          
          // Reemplazar variables en el subject y template
          const subject = emailConfig.subject.replace('{orderNumber}', order.orderNumber);
          const body = emailConfig.template.replace('{orderNumber}', order.orderNumber);
          
          // Enviar al cliente
          await this.sendEmail([order.user.email], template.subject, template.body);
          
          // Enviar a los destinatarios internos configurados
          const internalRecipients = emailConfig.recipientEmails.split(',').map((email: string) => email.trim());
          await this.sendEmail(internalRecipients, subject, body);
        }
      }

      return notification;
    } catch (error) {
      console.error("Error creando notificación:", error);
      throw error;
    }
  }

  async getUserNotifications(userId: number, options?: {
    unreadOnly?: boolean;
    limit?: number;
    offset?: number;
  }) {
    try {
      const where: Prisma.NotificationWhereInput = {
        user: {
          id: userId
        }
      };

      if (options?.unreadOnly) {
        where.read = false;
      }

      const notifications = await db.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: options?.limit || 50,
        skip: options?.offset || 0
      });

      return notifications;
    } catch (error) {
      console.error("Error obteniendo notificaciones:", error);
      throw error;
    }
  }

  async markAsRead(notificationId: number, userId: number) {
    try {
      const notification = await db.notification.update({
        where: {
          id: notificationId,
          user: {
            id: userId
          }
        },
        data: {
          read: true
        }
      });

      return notification;
    } catch (error) {
      console.error("Error marcando notificación como leída:", error);
      throw error;
    }
  }
} 
import { Router, Request, Response, NextFunction } from "express";
import { PaymentService } from "../services/paymentService";
import { authenticateToken } from "../middlewares/jwtMiddleware";
import { checkRole } from "../middlewares/roleMiddleware";
import { PaymentStatus, UserRole } from "@prisma/client";

const router = Router();
const paymentService = new PaymentService();

// Todas las rutas requieren autenticación
const protectedRouter = Router();
protectedRouter.use(authenticateToken as any);

// Procesar un nuevo pago
protectedRouter.post("/process", async (req: Request, res: Response) => {
  try {
    const { orderId, paymentMethod, paymentDetails } = req.body;
    const payment = await paymentService.processPayment({
      orderId,
      userId: req.user!.id,
      paymentMethod,
      paymentDetails
    });

    res.json({
      ok: true,
      data: payment
    });
  } catch (error: any) {
    res.status(400).json({
      ok: false,
      error: error.message
    });
  }
});

// Verificar estado de un pago
protectedRouter.get("/:paymentId/status", async (req: Request, res: Response) => {
  try {
    const paymentId = parseInt(req.params.paymentId);
    const status = await paymentService.getPaymentStatus(paymentId, req.user!.id);

    res.json({
      ok: true,
      data: status
    });
  } catch (error: any) {
    res.status(400).json({
      ok: false,
      error: error.message
    });
  }
});

// Cancelar un pago (solo si está pendiente)
protectedRouter.post("/:paymentId/cancel", async (req: Request, res: Response) => {
  try {
    const paymentId = parseInt(req.params.paymentId);
    await paymentService.cancelPayment(paymentId, req.user!.id);

    res.json({
      ok: true,
      message: "Pago cancelado exitosamente"
    });
  } catch (error: any) {
    res.status(400).json({
      ok: false,
      error: error.message
    });
  }
});

// Rutas administrativas
const adminRouter = Router();
adminRouter.use(checkRole([UserRole.ADMIN]) as any);

adminRouter.get("/", async (req: Request, res: Response) => {
  try {
    const { status, startDate, endDate } = req.query;
    const payments = await paymentService.getAllPayments({
      status: status as PaymentStatus | undefined,
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined
    });

    res.json({
      ok: true,
      data: payments
    });
  } catch (error: any) {
    res.status(400).json({
      ok: false,
      error: error.message
    });
  }
});

adminRouter.post("/:paymentId/refund", async (req: Request, res: Response) => {
  try {
    const paymentId = parseInt(req.params.paymentId);
    const { reason } = req.body;
    const refund = await paymentService.refundPayment(paymentId, reason);

    res.json({
      ok: true,
      data: refund
    });
  } catch (error: any) {
    res.status(400).json({
      ok: false,
      error: error.message
    });
  }
});

// Montar los routers
router.use("/", protectedRouter);
router.use("/admin", adminRouter);

export default router; 
import { Router, Request, Response } from "express";
import { PackageService } from "../services/packageService";
import { authenticateToken } from "../middlewares/jwtMiddleware";
import { checkRole } from "../middlewares/roleMiddleware";

type UserRole = "CLIENT" | "SALES_AGENT" | "ADMIN";
const UserRole = {
  CLIENT: "CLIENT",
  SALES_AGENT: "SALES_AGENT",
  ADMIN: "ADMIN"
} as const;

type ProductType = "FLIGHT" | "ACCOMMODATION" | "TRANSFER" | "EXCURSION" | "INSURANCE" | "ASSISTANCE";
const ProductType = {
  FLIGHT: "FLIGHT",
  ACCOMMODATION: "ACCOMMODATION",
  TRANSFER: "TRANSFER",
  EXCURSION: "EXCURSION",
  INSURANCE: "INSURANCE",
  ASSISTANCE: "ASSISTANCE"
} as const;

const router = Router();
const packageService = new PackageService();

// Rutas públicas
router.get("/", async (req: Request, res: Response) => {
  try {
    const { category, destination, minPrice, maxPrice } = req.query;
    const packages = await packageService.getAllPackages();

    // Filtramos los paquetes según los criterios de búsqueda
    const filteredPackages = packages.filter(pkg => {
      const basePrice = pkg.items.reduce((total, item) => total + (item.product.basePrice * item.quantity), 0);
      if (category && pkg.items.some(item => item.product.type !== category)) return false;
      if (destination && !pkg.items.some(item => item.product.type === ProductType.ACCOMMODATION && item.product.name.includes(destination as string))) return false;
      if (minPrice && basePrice < parseFloat(minPrice as string)) return false;
      if (maxPrice && basePrice > parseFloat(maxPrice as string)) return false;
      return true;
    });

    res.json({
      ok: true,
      data: filteredPackages
    });
  } catch (error: any) {
    res.status(400).json({
      ok: false,
      error: error.message
    });
  }
});

router.get("/:packageId", async (req: Request, res: Response) => {
  try {
    const packageId = parseInt(req.params.packageId);
    const packageDetails = await packageService.getPackageById(packageId);

    res.json({
      ok: true,
      data: packageDetails
    });
  } catch (error: any) {
    res.status(400).json({
      ok: false,
      error: error.message
    });
  }
});

// Rutas protegidas para agentes y administradores
const protectedRouter = Router();
protectedRouter.use(authenticateToken as any);
protectedRouter.use(checkRole([UserRole.SALES_AGENT, UserRole.ADMIN]) as any);

// Crear un nuevo paquete
protectedRouter.post("/", async (req: Request, res: Response) => {
  try {
    const packageData = req.body;
    const newPackage = await packageService.createPackage(packageData);

    res.status(201).json({
      ok: true,
      data: newPackage
    });
  } catch (error: any) {
    res.status(400).json({
      ok: false,
      error: error.message
    });
  }
});

// Actualizar un paquete existente
protectedRouter.put("/:packageId", async (req: Request, res: Response) => {
  try {
    const packageId = parseInt(req.params.packageId);
    const packageData = req.body;
    const updatedPackage = await packageService.updatePackage(packageId, packageData);

    res.json({
      ok: true,
      data: updatedPackage
    });
  } catch (error: any) {
    res.status(400).json({
      ok: false,
      error: error.message
    });
  }
});

// Eliminar un paquete
protectedRouter.delete("/:packageId", async (req: Request, res: Response) => {
  try {
    const packageId = parseInt(req.params.packageId);
    await packageService.deletePackage(packageId);

    res.json({
      ok: true,
      message: "Paquete eliminado exitosamente"
    });
  } catch (error: any) {
    res.status(400).json({
      ok: false,
      error: error.message
    });
  }
});

// Gestión de disponibilidad
protectedRouter.post("/:packageId/availability", async (req: Request, res: Response) => {
  try {
    const packageId = parseInt(req.params.packageId);
    const { startDate, endDate, capacity } = req.body;
    const packageData = await packageService.getPackageById(packageId);
    
    if (!packageData) {
      throw new Error("Paquete no encontrado");
    }

    const updatedPackage = await packageService.updatePackage(packageId, {
      name: packageData.name,
      description: packageData.description || undefined,
      totalPrice: packageData.totalPrice,
      currency: packageData.currency,
      available: true
    });

    res.json({
      ok: true,
      message: "Disponibilidad actualizada exitosamente",
      data: updatedPackage
    });
  } catch (error: any) {
    res.status(400).json({
      ok: false,
      error: error.message
    });
  }
});

// Montar los routers
router.use("/admin", protectedRouter);

export default router; 
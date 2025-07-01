import { Router } from "express";
import { ProductService } from "../services/producService";
import { authenticateToken } from "../middlewares/jwtMiddleware";
import { checkRole } from "../middlewares/roleMiddleware";

type UserRole = "CLIENT" | "SALES_AGENT" | "ADMIN";
const UserRole = {
  CLIENT: "CLIENT",
  SALES_AGENT: "SALES_AGENT",
  ADMIN: "ADMIN"
} as const;

const router = Router();
const productService = new ProductService();

// Rutas públicas
router.get("/", async (req, res) => {
  try {
    const { category, minPrice, maxPrice, search } = req.query;
    const products = await productService.searchProducts({
      category: category as string,
      minPrice: minPrice ? parseFloat(minPrice as string) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice as string) : undefined,
      search: search as string
    });

    res.json({
      ok: true,
      data: products
    });
  } catch (error: any) {
    res.status(400).json({
      ok: false,
      error: error.message
    });
  }
});

router.get("/:productId", async (req, res) => {
  try {
    const productId = parseInt(req.params.productId);
    const product = await productService.getProductById(productId);

    res.json({
      ok: true,
      data: product
    });
  } catch (error: any) {
    res.status(400).json({
      ok: false,
      error: error.message
    });
  }
});

// Rutas protegidas para administradores y agentes de venta
router.use(authenticateToken);
router.use(checkRole([UserRole.ADMIN, UserRole.SALES_AGENT]));

router.post("/", async (req, res) => {
  try {
    const product = await productService.createProduct(req.body);
    res.status(201).json({
      ok: true,
      data: product
    });
  } catch (error: any) {
    res.status(400).json({
      ok: false,
      error: error.message
    });
  }
});

router.put("/:productId", async (req, res) => {
  try {
    const productId = parseInt(req.params.productId);
    const product = await productService.updateProduct(productId, req.body);

    res.json({
      ok: true,
      data: product
    });
  } catch (error: any) {
    res.status(400).json({
      ok: false,
      error: error.message
    });
  }
});

router.delete("/:productId", async (req, res) => {
  try {
    const productId = parseInt(req.params.productId);
    await productService.deleteProduct(productId);

    res.json({
      ok: true,
      message: "Producto eliminado exitosamente"
    });
  } catch (error: any) {
    res.status(400).json({
      ok: false,
      error: error.message
    });
  }
});

// Rutas adicionales para gestión de inventario
router.post("/:productId/stock", async (req, res) => {
  try {
    const productId = parseInt(req.params.productId);
    const { quantity } = req.body;
    await productService.updateStock(productId, quantity);

    res.json({
      ok: true,
      message: "Stock actualizado exitosamente"
    });
  } catch (error: any) {
    res.status(400).json({
      ok: false,
      error: error.message
    });
  }
});

router.get("/categories", async (req, res) => {
  try {
    const categories = await productService.getCategories();
    res.json({
      ok: true,
      data: categories
    });
  } catch (error: any) {
    res.status(400).json({
      ok: false,
      error: error.message
    });
  }
});

export default router; 
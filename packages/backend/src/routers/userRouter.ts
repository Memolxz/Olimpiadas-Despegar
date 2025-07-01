import { Router } from "express"
import { UserRole } from "@prisma/client"

import { UserService } from "../services/userService"
import { AuthService } from "../services/authService"
import { JwtService } from "../services/jwtService"
import { authenticateToken } from "../middlewares/jwtMiddleware"
import { checkRole } from "../middlewares/roleMiddleware"

const router = Router()
const userService = new UserService()
const authService = new AuthService()
const jwtService = new JwtService()

// Rutas públicas
router.post("/register", async (req, res) => {
  try {
    const user = await userService.createUser(req.body)
    const tokens = await jwtService.generateTokenPair(user)
    
    res.json({
      ok: true,
      data: {
        user,
        ...tokens
      }
    })
  } catch (error: any) {
    res.status(400).json({
      ok: false,
      error: error.message
    })
  }
})

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body
    const user = await authService.verifyUserCredentials(email, password)
    const tokens = await jwtService.generateTokenPair(user)
    
    res.json({
      ok: true,
      data: {
        user,
        ...tokens
      }
    })
  } catch (error: any) {
    res.status(401).json({
      ok: false,
      error: error.message
    })
  }
})

// Rutas protegidas
const protectedRouter = Router()
protectedRouter.use(authenticateToken)

// Rutas para todos los usuarios autenticados
protectedRouter.get("/profile", async (req, res) => {
  try {
    const user = await userService.getUserById(req.user!.id)
    res.json({
      ok: true,
      data: user
    })
  } catch (error: any) {
    res.status(400).json({
      ok: false,
      error: error.message
    })
  }
})

protectedRouter.put("/profile", async (req, res) => {
  try {
    const user = await userService.updateUser(req.user!.id, req.body)
    res.json({
      ok: true,
      data: user
    })
  } catch (error: any) {
    res.status(400).json({
      ok: false,
      error: error.message
    })
  }
})

protectedRouter.post("/preferences", async (req, res) => {
  try {
    const preferences = await userService.updateUserPreferences(req.user!.id, req.body)
    res.json({
      ok: true,
      data: preferences
    })
  } catch (error: any) {
    res.status(400).json({
      ok: false,
      error: error.message
    })
  }
})

protectedRouter.post("/logout", async (req, res) => {
  try {
    await jwtService.invalidateUserTokens(req.user!.id)
    res.json({
      ok: true,
      message: "Sesión cerrada exitosamente"
    })
  } catch (error: any) {
    res.status(400).json({
      ok: false,
      error: error.message
    })
  }
})

// Rutas solo para administradores
const adminRouter = Router()
adminRouter.use(checkRole([UserRole.ADMIN]))

adminRouter.get("/", async (req, res) => {
  try {
    const users = await userService.getAllUsers()
    res.json({
      ok: true,
      data: users
    })
  } catch (error: any) {
    res.status(400).json({
      ok: false,
      error: error.message
    })
  }
})

adminRouter.get("/by-role/:role", async (req, res) => {
  try {
    const users = await userService.getUsersByRole(req.params.role as UserRole)
    res.json({
      ok: true,
      data: users
    })
  } catch (error: any) {
    res.status(400).json({
      ok: false,
      error: error.message
    })
  }
})

adminRouter.delete("/:userId", async (req, res) => {
  try {
    await userService.deleteUser(parseInt(req.params.userId))
    res.json({
      ok: true,
      message: "Usuario eliminado exitosamente"
    })
  } catch (error: any) {
    res.status(400).json({
      ok: false,
      error: error.message
    })
  }
})

// Montar los routers protegidos
router.use(protectedRouter)
router.use("/admin", adminRouter)

export default router
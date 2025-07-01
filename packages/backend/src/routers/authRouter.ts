// src/routers/authRouter.ts
import { Router } from "express";
import { hash } from "bcrypt";
import { UserRole } from "@prisma/client";

import { AuthService } from "../services/authService";
import { JwtService } from "../services/jwtService";
import { jwtAuthMiddleware } from "../middlewares/jwtMiddleware";

const authService = new AuthService();
const jwtService = new JwtService();

export const authRouter = Router();

// Registro de usuarios
authRouter.post('/register', async (req, res) => {
  try {
    const { firstName, lastName, email, password, country, phone } = req.body;

    // Validaciones básicas
    if (!firstName || !lastName || !email || !password || !country) {
      return res.status(400).json({ 
        ok: false, 
        error: "Faltan campos obligatorios: firstName, lastName, email, password, country" 
      });
    }

    // Hash de la contraseña
    const hashedPassword = await hash(password, 10);

    // Crear usuario
    const user = await authService.registerUser({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      country,
      phone,
      role: UserRole.CLIENT
    });

    // Generar tokens
    const tokens = await jwtService.generateTokenPair(user);

    // Respuesta sin incluir la contraseña
    const { password: _, ...userResponse } = user;

    res.status(201).json({ 
      ok: true, 
      data: {
        user: userResponse,
        ...tokens
      }
    });
  } catch (error) {
    console.error("Error en registro:", error);
    res.status(400).json({ 
      ok: false, 
      error: (error as Error).message 
    });
  }
});

// Login de usuarios
authRouter.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        ok: false, 
        error: "Email y contraseña son requeridos" 
      });
    }

    // Verificar credenciales
    const user = await authService.verifyUserCredentials(email, password);

    // Generar tokens
    const tokens = await jwtService.generateTokenPair(user);

    // Respuesta sin incluir la contraseña
    const { password: _, ...userResponse } = user;

    res.status(200).json({ 
      ok: true, 
      data: {
        user: userResponse,
        ...tokens
      }
    });
  } catch (error) {
    console.error("Error en login:", error);
    res.status(401).json({ 
      ok: false, 
      error: (error as Error).message 
    });
  }
});

// Renovar token de acceso
authRouter.post('/refresh-token', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ 
        ok: false, 
        error: "Refresh token requerido" 
      });
    }

    const tokens = await jwtService.refreshAccessToken(refreshToken);

    res.status(200).json({ 
      ok: true, 
      data: tokens 
    });
  } catch (error) {
    console.error("Error renovando token:", error);
    res.status(401).json({ 
      ok: false, 
      error: (error as Error).message 
    });
  }
});

// Logout
authRouter.post('/logout', jwtAuthMiddleware, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        ok: false, 
        error: "Usuario no autenticado" 
      });
    }

    await jwtService.invalidateUserTokens(req.user.id);

    res.status(200).json({ 
      ok: true, 
      message: "Sesión cerrada exitosamente" 
    });
  } catch (error) {
    console.error("Error en logout:", error);
    res.status(500).json({ 
      ok: false, 
      error: "Error al cerrar sesión" 
    });
  }
});

// Obtener perfil del usuario autenticado
authRouter.get('/profile', jwtAuthMiddleware, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        ok: false, 
        error: "Usuario no autenticado" 
      });
    }

    const userProfile = await authService.getUserProfile(req.user.id);

    if (!userProfile) {
      return res.status(404).json({ 
        ok: false, 
        error: "Perfil de usuario no encontrado" 
      });
    }

    // Remover contraseña de la respuesta
    const { password: _, ...profileResponse } = userProfile;

    res.status(200).json({ 
      ok: true, 
      data: profileResponse 
    });
  } catch (error) {
    console.error("Error obteniendo perfil:", error);
    res.status(500).json({ 
      ok: false, 
      error: "Error al obtener perfil del usuario" 
    });
  }
});

// Actualizar perfil del usuario
authRouter.put('/profile', jwtAuthMiddleware, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        ok: false, 
        error: "Usuario no autenticado" 
      });
    }

    const updateData = req.body;
    
    // Remover campos que no se pueden actualizar
    delete updateData.id;
    delete updateData.email;
    delete updateData.password;
    delete updateData.role;
    delete updateData.createdAt;
    delete updateData.updatedAt;

    const updatedUser = await authService.updateUserProfile(req.user.id, updateData);

    // Remover contraseña de la respuesta
    const { password: _, ...userResponse } = updatedUser;

    res.status(200).json({ 
      ok: true, 
      data: userResponse 
    });
  } catch (error) {
    console.error("Error actualizando perfil:", error);
    res.status(400).json({ 
      ok: false, 
      error: (error as Error).message 
    });
  }
});

// Cambiar contraseña
authRouter.put('/change-password', jwtAuthMiddleware, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        ok: false, 
        error: "Usuario no autenticado" 
      });
    }

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ 
        ok: false, 
        error: "Contraseña actual y nueva contraseña son requeridas" 
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ 
        ok: false, 
        error: "La nueva contraseña debe tener al menos 6 caracteres" 
      });
    }

    await authService.changePassword(req.user.id, currentPassword, newPassword);

    res.status(200).json({ 
      ok: true, 
      message: "Contraseña actualizada exitosamente" 
    });
  } catch (error) {
    console.error("Error cambiando contraseña:", error);
    res.status(400).json({ 
      ok: false, 
      error: (error as Error).message 
    });
  }
});

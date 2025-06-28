import { NextFunction, Request, Response } from "express";

import { UserService } from "../services/userService";
import { User } from "@prisma/client";

const userService = new UserService();

export const sessionAuthMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization;

  if (!token) {
    res.status(401).json({ error: "No hay token!" })
    return;
  }
  
  try {
    const user = await userService.getUserByToken(token);
    req.user = user;
    next();
  } catch (error) {
    res.status(403).json({ error: (error as Error).message })
  }

}


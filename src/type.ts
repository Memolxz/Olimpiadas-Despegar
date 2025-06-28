import { User } from "@prisma/client";

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DATABASE_URL: string;
      JWT_SECRET: string; // Para JWT
      JWT_REFRESH_SECRET: string; // Para JWT
    }
  }
  namespace Express {
    interface Request {
      user?: User
      // Para JWT
      // user?: Pick<User, 'id' | 'email'>
    }
  }
}
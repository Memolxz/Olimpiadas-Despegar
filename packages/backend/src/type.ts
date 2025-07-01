import { User } from "@prisma/client";
import { Request } from "express";

// Enums
export enum UserRole {
  CLIENT = 'CLIENT',
  SALES_AGENT = 'SALES_AGENT',
  ADMIN = 'ADMIN'
}

export enum OrderStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED'
}

export enum PaymentMethod {
  CREDIT_CARD = 'CREDIT_CARD',
  DEBIT_CARD = 'DEBIT_CARD',
  BANK_TRANSFER = 'BANK_TRANSFER'
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED'
}

export enum ProductType {
  FLIGHT = 'FLIGHT',
  HOTEL = 'HOTEL',
  TRANSFER = 'TRANSFER',
  ACTIVITY = 'ACTIVITY',
  INSURANCE = 'INSURANCE'
}

export enum NotificationType {
  ORDER_CREATED = 'ORDER_CREATED',
  ORDER_PAID = 'ORDER_PAID',
  ORDER_STATUS_UPDATE = 'ORDER_STATUS_UPDATE',
  TRAVEL_REMINDER = 'TRAVEL_REMINDER'
}

// Interfaces
export interface BillingInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  postalCode: string;
}

export interface PaymentDetails {
  cardNumber?: string;
  cardHolder?: string;
  expirationMonth?: string;
  expirationYear?: string;
  cvv?: string;
  bankAccount?: string;
  bankName?: string;
}

// User type for request object
export interface AuthenticatedUser {
  id: number;
  email: string;
  role: UserRole;
}

// Extend Express Request
export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}

// Environment variables type definition
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      // Database
      DATABASE_URL: string;
      
      // Authentication
      JWT_SECRET: string;
      JWT_REFRESH_SECRET: string;
      JWT_EXPIRATION: string;
      
      // Server
      PORT: string;
      NODE_ENV: 'development' | 'production' | 'test';
      
      // Email
      SMTP_HOST: string;
      SMTP_PORT: string;
      SMTP_USER: string;
      SMTP_PASS: string;
      SMTP_FROM: string;
      
      // Payment
      MERCADOPAGO_ACCESS_TOKEN: string;
      MERCADOPAGO_PUBLIC_KEY: string;
      
      // Redis Cache
      REDIS_URL: string;
      REDIS_PORT: string;
      REDIS_PASSWORD: string;
    }
  }
}

// Ensure this file is treated as a module
export {};
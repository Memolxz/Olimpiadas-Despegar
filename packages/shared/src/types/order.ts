export enum OrderStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED'
}

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

export interface OrderItem {
  product: {
    id: number;
    name: string;
    price: number;
  };
  quantity: number;
  subtotal: number;
}

export interface Order {
  id: number;
  orderNumber: string;
  status: OrderStatus;
  totalAmount: number;
  currency: string;
  items: OrderItem[];
  billingInfo: BillingInfo;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateOrderRequest {
  billingInfo: BillingInfo;
  couponCode?: string;
}

export interface OrderListItem {
  id: number;
  orderNumber: string;
  status: OrderStatus;
  totalAmount: number;
  currency: string;
  createdAt: Date;
}

export interface OrderListResponse {
  items: OrderListItem[];
  total: number;
  page: number;
  limit: number;
}

export interface OrderFilters {
  page?: number;
  limit?: number;
  status?: OrderStatus;
  startDate?: Date;
  endDate?: Date;
} 
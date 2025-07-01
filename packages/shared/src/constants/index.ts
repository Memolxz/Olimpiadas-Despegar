export const DEFAULT_PAGE_SIZE = 10;
export const MAX_PAGE_SIZE = 100;

export const CURRENCIES = ['USD', 'EUR', 'ARS'] as const;
export type Currency = typeof CURRENCIES[number];

export const DEFAULT_CURRENCY: Currency = 'USD';

export const API_ROUTES = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout'
  },
  USERS: {
    PROFILE: '/users/profile'
  },
  PRODUCTS: {
    BASE: '/products',
    DETAIL: (id: number) => `/products/${id}`
  },
  ORDERS: {
    BASE: '/orders',
    DETAIL: (id: number) => `/orders/${id}`
  },
  PAYMENTS: {
    BASE: '/payments',
    ORDER: (orderId: number) => `/payments/orders/${orderId}`,
    DETAIL: (id: number) => `/payments/${id}`
  },
  NOTIFICATIONS: {
    BASE: '/notifications',
    READ: (id: number) => `/notifications/${id}/read`
  }
} as const; 
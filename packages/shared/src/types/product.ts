export enum ProductType {
  FLIGHT = 'FLIGHT',
  HOTEL = 'HOTEL',
  TRANSFER = 'TRANSFER',
  ACTIVITY = 'ACTIVITY',
  INSURANCE = 'INSURANCE'
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  type: 'flight' | 'hotel' | 'transfer' | 'activity' | 'insurance' | 'assistance';
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductListItem {
  id: number;
  name: string;
  description: string;
  type: ProductType;
  price: number;
  currency: string;
  provider: string;
  availability: boolean;
}

export interface CreateProductRequest {
  name: string;
  description: string;
  type: ProductType;
  price: number;
  currency: string;
  provider: string;
  details: Record<string, any>;
}

export interface UpdateProductRequest extends Partial<CreateProductRequest> {
  availability?: boolean;
}

export interface ProductListResponse {
  items: ProductListItem[];
  total: number;
  page: number;
  limit: number;
}

export interface ProductFilters {
  page?: number;
  limit?: number;
  search?: string;
  type?: ProductType;
  minPrice?: number;
  maxPrice?: number;
  provider?: string;
  availableOnly?: boolean;
}

export interface ProductCreateRequest {
  name: string;
  description: string;
  price: number;
  type: Product['type'];
}

export interface ProductUpdateRequest {
  name?: string;
  description?: string;
  price?: number;
  type?: Product['type'];
} 
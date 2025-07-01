export enum NotificationType {
  ORDER_CREATED = 'ORDER_CREATED',
  ORDER_PAID = 'ORDER_PAID',
  ORDER_STATUS_UPDATE = 'ORDER_STATUS_UPDATE',
  TRAVEL_REMINDER = 'TRAVEL_REMINDER'
}

export interface Notification {
  id: number;
  type: NotificationType;
  message: string;
  read: boolean;
  createdAt: Date;
}

export interface NotificationListResponse {
  items: Notification[];
  total: number;
  page: number;
  limit: number;
}

export interface NotificationFilters {
  page?: number;
  limit?: number;
  unreadOnly?: boolean;
} 
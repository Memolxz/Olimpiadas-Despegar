import { User, UserUpdateRequest } from '@olimpiadas-inet/shared';
import { api } from '../lib/api';

export const userService = {
  async getCurrentUser(): Promise<User> {
    const response = await api.get<User>('/users/me');
    return response.data;
  },

  async updateProfile(data: UserUpdateRequest): Promise<User> {
    const response = await api.put<User>('/users/me', data);
    return response.data;
  },

  async getNotifications(): Promise<Notification[]> {
    const response = await api.get<Notification[]>('/users/me/notifications');
    return response.data;
  },

  async markNotificationAsRead(notificationId: string): Promise<void> {
    await api.put(`/users/me/notifications/${notificationId}/read`);
  }
}; 
import { api } from './api';
import type { Seat } from '../types';

export const seatService = {
  async getEventSeats(eventId: number): Promise<Seat[]> {
    const response = await api.get<Seat[]>(`/events/${eventId}/seats`);
    return response.data;
  },
};

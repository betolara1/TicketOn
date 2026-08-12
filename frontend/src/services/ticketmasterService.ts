import { api } from './api';
import type { TicketmasterEventItem } from '../types';


export const ticketmasterService = {
  // busca dados na Ticketmaster
  async searchEvents(keyword?: string, city?: string): Promise<TicketmasterEventItem[]> {
    const response = await api.get<TicketmasterEventItem[]>('/ticketmaster/events', {
      params: { keyword, city },
    });
    
    return response.data;
  },
};
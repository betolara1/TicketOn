import { api } from './api';
import type { TicketValidateRequest } from '../types';


export const ticketmasterService = {
  // busca dados na Ticketmaster
  async searchEvents(keyword?: string, city?: string): Promise<TicketValidateRequest[]> {
    const response = await api.get<TicketValidateRequest[]>('/ticketmaster/events', {
      params: { keyword, city },
    });
    
    return response.data;
  },
};
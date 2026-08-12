import {api} from './api';
import type {Event} from '../types';

export const eventService = {
  // busca eventos com filtros
  async getPublishedEvents(params?: { category?: string; city?: string; search?: string }): Promise<Event[]> {
    const response = await api.get<Event[]>('/events', { params });
    return response.data;
  },


  // busca evento pelo ID
  async getEventById(id: number): Promise<Event> {
    const response = await api.get<Event>(`/events/${id}`);
    return response.data;
  },


  // cria um novo evento 
  async createEvent(eventData: Omit<Event, 'id' | 'organizer_id' | 'available_capacity' | 'status' | 'created_at'>): Promise<Event> {
    const response = await api.post<Event>('/events', eventData,{
      headers:{
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },


  // lista os eventos do organizador
  async getMyOrganizedEvents(): Promise<Event[]> {
    const response = await api.get<Event[]>('/events/organizer/my-events');
    return response.data;
  },
};

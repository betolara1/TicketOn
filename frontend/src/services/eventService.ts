import {api} from './api';
import type {Event} from '../types';

export interface EventFilter{
  caregory?: string;
  city?: string;
  search?: string;
  limit?: number;
}

export type CreateEventInput = Omit<
  Event,
  'id' | 'organizer_id' | 'available_capacity' | 'status' | 'created_at' | 'organizer'
>;


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


  // Cria um novo evento
  async createEvent(eventData: CreateEventInput): Promise<Event> {
    const response = await api.post<Event>('/events', eventData);
    return response.data;
  },


  // Atualiza um evento
  async updateEvent(id: number, eventData: Partial<CreateEventInput>): Promise<Event> {
    const response = await api.put<Event>(`/events/${id}`, eventData);
    return response.data;
  },


  // Exclui um evento
  async deleteEvent(id: number): Promise<void> {
    await api.delete(`/events/${id}`);
  },


  // lista os eventos do organizador
  async getMyOrganizedEvents(): Promise<Event[]> {
    const response = await api.get<Event[]>('/events/organizer/my-events');
    return response.data;
  },
};

import { api } from './api';
import type { Ticket, TicketValidateResponse } from '../types';
import axios from 'axios';

export const ticketService = {
  // Busca os ingressos do cliente logado
  async getMyTickets(): Promise<Ticket[]> {
    const response = await api.get<Ticket[]>('/tickets/my-tickets');
    return response.data;
  },

  // Busca um ingresso por link público de compartilhamento
  async getSharedTicket(shareLink: string): Promise<Ticket> {
    const response = await api.get<Ticket>(`/tickets/share/${shareLink}`);
    return response.data;
  },

  // Validação na Portaria (Leitura de Câmera ou Digitação Manual)
  async validateTicket(payload: TicketValidateResponse): Promise<TicketValidateResponse> {
    try {
      const response = await api.post<TicketValidateResponse>('/tickets/validate', {
        ticket_code: payload.ticket_code.trim(),
      });
      
      return response.data;
    } catch (error) {
      // Tratamento tipado de erros do Axios
      if (axios.isAxiosError(error) && error.response) {
        const errorDetail = error.response.data?.detail || 'Erro na validação do ingresso';

        // Detecção inteligente de status com base na resposta do backend
        if (errorDetail.includes('JÁ FOI UTILIZADO')) {
          return {
            success: false,
            status: 'USED',
            message: errorDetail,
            ticket_code: payload.ticket_code,
          };
        }

        if (errorDetail.includes('não encontrado') || errorDetail.includes('inválido')) {
          return {
            success: false,
            status: 'INVALID',
            message: 'Código de ingresso não encontrado ou inexistente no sistema.',
            ticket_code: payload.ticket_code,
          };
        }

        return {
          success: false,
          status: 'INVALID',
          message: errorDetail,
          ticket_code: payload.ticket_code,
        };
      }

      // Erro de rede ou desconhecido
      return {
        success: false,
        status: 'INVALID',
        message: 'Não foi possível conectar ao servidor para validar o ingresso.',
        ticket_code: payload.ticket_code,
      };
    }
  },
};

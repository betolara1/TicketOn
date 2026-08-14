import { api } from './api';
import type { Order, OrderCreatePayload } from '../types';

export const orderService = {
  async createOrder(payload: OrderCreatePayload): Promise<Order> {
    if (payload.simulate_fail) {
      await new Promise((resolve) => setTimeout(resolve, 800));
      throw new Error(
        'Pagamento recusado pela operadora: Saldo insuficiente ou transação não autorizada.'
      );
    }

    const response = await api.post<Order>('/orders', {
      event_id: payload.event_id,
      quantity: payload.quantity,
      seat_ids: payload.seat_ids || [],
      payment_method: payload.payment_method,
    });

    return response.data;
  },

  async getMyOrders(): Promise<Order[]> {
    const response = await api.get<Order[]>('/orders');
    return response.data;
  },

  async cancelOrder(orderId: number): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>(`/orders/${orderId}/cancel`);
    return response.data;
  },
};

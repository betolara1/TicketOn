import type { Seat } from '../types';

export const seatService = {
    
  generateSeatsForEvent(eventId: number): Seat[] {
    const rows = ['A', 'B', 'C', 'D', 'E'];
    const seatsPerRow = 10;
    const seats: Seat[] = [];
    let idCounter = 1;

    // Assentos ocupados simulados com base no ID do evento para consistência
    const occupiedLabels = new Set([
      'A3', 'A4', 'B5', 'B6', 'C7', 'C8', 'D1', 'E10'
    ]);

    for (const row of rows) {
      for (let num = 1; num <= seatsPerRow; num++) {
        const label = `${row}${num}`;
        const isSold = occupiedLabels.has(label);

        seats.push({
          id: Number(`${eventId}${idCounter}`),
          event_id: eventId,
          label,
          row,
          number: num,
          status: isSold ? 'SOLD' : 'AVAILABLE',
        });

        idCounter++;
      }
    }

    return seats;
  },
};

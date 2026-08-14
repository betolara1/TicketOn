import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { ticketService } from '../../services/ticketService';
import type { Ticket } from '../../types';

export const SharedLink: React.FC = () => {
  const { shareLink } = useParams<{ shareLink: string }>();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!shareLink) return;
    ticketService.getSharedTicket(shareLink)
      .then(setTicket)
      .catch(() => setError('Ingresso não encontrado ou link inválido.'));
  }, [shareLink]);

  if (error) return <p>{error}</p>;
  if (!ticket) return <p>Carregando ingresso...</p>;

  return (
    <div>
      <h1>{ticket.event?.title}</h1>
      <QRCodeSVG value={ticket.qr_payload} size={220} />
    </div>
  );
};

export default SharedLink;
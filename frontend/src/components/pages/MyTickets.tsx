import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { ticketService } from '../../services/ticketService';
import type { Ticket } from '../../types';
import { 
  Ticket as TicketIcon, 
  Calendar, 
  MapPin, 
  QrCode, 
  Share2, 
  Check, 
  X, 
  Loader2, 
  AlertCircle, 
  Sparkles, 
  ArrowRight 
} from 'lucide-react';
import styles from './MyTickets.module.css';

export const MyTickets: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filtro de abas
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');

  // Modal do QR Code
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  
  // Feedback de cópia do link
  const [copiedId, setCopiedId] = useState<number | null>(null);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await ticketService.getMyTickets();
        setTickets(data);
      } catch (err: any) {
        console.error('Erro ao buscar ingressos:', err);
        setError('Não foi possível carregar seus ingressos. Tente novamente mais tarde.');
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, []);

  const handleCopyShareLink = (ticket: Ticket) => {
    const fullUrl = `${window.location.origin}/tickets/share/${ticket.share_link}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedId(ticket.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'Data a definir';
    try {
      const date = new Date(dateStr);
      return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(date);
    } catch {
      return dateStr;
    }
  };

  // Separa ingressos válidos dos utilizados/cancelados
  const activeTickets = tickets.filter((t) => t.status === 'VALID');
  const historyTickets = tickets.filter((t) => t.status !== 'VALID');
  const displayedTickets = activeTab === 'active' ? activeTickets : historyTickets;

  return (
    <div className={styles.container}>
      
      {/* CABEÇALHO */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Meus Ingressos</h1>
          <p className={styles.subtitle}>
            Acesse seus ingressos digitais com QR Code e prepare-se para a sua diversão.
          </p>
        </div>

        <Link to="/" className={styles.exploreBtn}>
          <span>Explorar Mais Eventos</span>
          <ArrowRight size={16} />
        </Link>
      </div>

      {/* ABAS */}
      <div className={styles.tabs}>
        <button
          type="button"
          className={`${styles.tabBtn} ${activeTab === 'active' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('active')}
        >
          <Sparkles size={16} />
          <span>Ingressos Ativos</span>
          <span className={styles.badgeCount}>{activeTickets.length}</span>
        </button>

        <button
          type="button"
          className={`${styles.tabBtn} ${activeTab === 'history' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('history')}
        >
          <Calendar size={16} />
          <span>Histórico & Utilizados</span>
          <span className={styles.badgeCount}>{historyTickets.length}</span>
        </button>
      </div>

      {/* MENSAGEM DE ERRO */}
      {error && (
        <div className={styles.errorBanner}>
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {/* CONTEÚDO PRINCIPAL */}
      {loading ? (
        <div className={styles.loadingContainer}>
          <Loader2 size={40} className={styles.spinner} />
          <p>Buscando seus ingressos...</p>
        </div>
      ) : displayedTickets.length === 0 ? (
        <div className={styles.emptyState}>
          <TicketIcon size={52} className={styles.emptyIcon} />
          <h3>
            {activeTab === 'active' 
              ? 'Você não possui ingressos ativos no momento' 
              : 'Nenhum histórico de ingressos utilizado'}
          </h3>
          <p>Garanta já o seu lugar nos melhores shows e festivais!</p>
          <Link to="/" className={styles.actionBtn}>
            Ver Eventos Disponíveis
          </Link>
        </div>
      ) : (
        <div className={styles.ticketsGrid}>
          {displayedTickets.map((ticket) => {
            const isValid = ticket.status === 'VALID';

            return (
              <div key={ticket.id} className={`${styles.ticketCard} ${!isValid ? styles.ticketCardUsed : ''}`}>
                
                {/* LADO ESQUERDO: IMAGEM E DETALHES DO EVENTO */}
                <div className={styles.ticketMain}>
                  <div className={styles.imageWrapper}>
                    <img
                      src={ticket.event?.banner_url || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600&q=80'}
                      alt={ticket.event?.title || 'Evento'}
                      className={styles.bannerImage}
                    />
                    <span className={`${styles.statusBadge} ${styles[ticket.status.toLowerCase()]}`}>
                      {ticket.status === 'VALID' ? 'Válido' : ticket.status === 'USED' ? 'Utilizado' : 'Cancelado'}
                    </span>
                  </div>

                  <div className={styles.ticketBody}>
                    <span className={styles.categoryText}>{ticket.event?.category || 'Geral'}</span>
                    <h3 className={styles.eventTitle}>{ticket.event?.title || 'Evento'}</h3>

                    <div className={styles.infoList}>
                      <div className={styles.infoItem}>
                        <Calendar size={15} />
                        <span>{formatDate(ticket.event?.event_date)}</span>
                      </div>
                      <div className={styles.infoItem}>
                        <MapPin size={15} />
                        <span>{ticket.event?.venue_name} - {ticket.event?.venue_city}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* DIVISOR ESTILO BILHETE (PICOTE) */}
                <div className={styles.ticketDivider}>
                  <div className={styles.notchTop} />
                  <div className={styles.dashedLine} />
                  <div className={styles.notchBottom} />
                </div>

                {/* LADO DIREITO: QR CODE & AÇÕES */}
                <div className={styles.ticketStub}>
                  <div className={styles.qrWrapper} onClick={() => setSelectedTicket(ticket)}>
                    <QRCodeSVG
                      value={ticket.ticket_code}
                      size={100}
                      bgColor="#ffffff"
                      fgColor="#000000"
                      level="M"
                    />
                    <span className={styles.qrHint}>Toque para ampliar</span>
                  </div>

                  <div className={styles.codeText}>
                    <code>{ticket.ticket_code}</code>
                  </div>

                  <div className={styles.stubActions}>
                    <button
                      type="button"
                      onClick={() => setSelectedTicket(ticket)}
                      className={styles.viewQrBtn}
                    >
                      <QrCode size={15} />
                      <span>Ver QR Code</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleCopyShareLink(ticket)}
                      className={styles.shareBtn}
                      title="Copiar link do bilhete para enviar a um amigo"
                    >
                      {copiedId === ticket.id ? <Check size={16} /> : <Share2 size={16} />}
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* MODAL DE QR CODE AMPLIADO */}
      {selectedTicket && (
        <div className={styles.modalOverlay} onClick={() => setSelectedTicket(null)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className={styles.modalClose}
              onClick={() => setSelectedTicket(null)}
            >
              <X size={20} />
            </button>

            <div className={styles.modalHeader}>
              <h2>Ingresso de Acesso</h2>
              <p>{selectedTicket.event?.title}</p>
            </div>

            <div className={styles.modalQrBox}>
              <QRCodeSVG
                value={selectedTicket.ticket_code}
                size={220}
                bgColor="#ffffff"
                fgColor="#000000"
                level="H"
              />
            </div>

            <div className={styles.modalCodeBox}>
              <span className={styles.codeLabel}>Código do Bilhete</span>
              <code className={styles.codeBig}>{selectedTicket.ticket_code}</code>
            </div>

            <div className={styles.modalFooter}>
              <p>Apresente este QR Code na portaria para liberar a sua entrada.</p>
              <button
                type="button"
                className={styles.modalDoneBtn}
                onClick={() => setSelectedTicket(null)}
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default MyTickets;

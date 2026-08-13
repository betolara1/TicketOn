import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { eventService } from '../../../services/eventService';
import type { Event } from '../../../types';
import { 
  PlusCircle, 
  Calendar, 
  MapPin, 
  Ticket, 
  DollarSign, 
  Trash2, 
  ExternalLink, 
  Loader2, 
  AlertCircle 
} from 'lucide-react';
import styles from './OrganizerDashboard.module.css';

export const OrganizerDashboard: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Carrega os eventos do organizador
  const fetchMyEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await eventService.getMyOrganizedEvents();
      setEvents(data);
    } catch (err: any) {
      console.error('Erro ao buscar eventos:', err);
      
      // 🔹 Pega a mensagem real enviada pelo backend (se houver)
      const backendMessage = err.response?.data?.detail;
      const status = err.response?.status;
      if (status === 403) {
        setError('Acesso negado: Sua conta não tem perfil de Organizador de Eventos.');
      } else if (status === 401) {
        setError('Sessão expirada. Faça login novamente.');
      } else {
        setError(backendMessage || 'Não foi possível carregar seus eventos. Verifique a conexão com o servidor.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyEvents();
  }, []);

  // Excluir evento
  const handleDeleteEvent = async (id: number, title: string) => {
    if (!window.confirm(`Tem certeza que deseja excluir o evento "${title}"?`)) {
      return;
    }

    try {
      setDeletingId(id);
      await eventService.deleteEvent(id);
      setEvents((prev) => prev.filter((ev) => ev.id !== id));
    } catch (err: any) {
      alert('Erro ao excluir evento. Verifique se existem pedidos vinculados a ele.');
    } finally {
      setDeletingId(null);
    }
  };

  // Cálculos para os Cards de Resumo
  const totalEvents = events.length;
  const totalCapacity = events.reduce((acc, ev) => acc + ev.total_capacity, 0);
  const totalAvailable = events.reduce((acc, ev) => acc + ev.available_capacity, 0);
  const potentialRevenue = events.reduce(
    (acc, ev) => acc + (ev.total_capacity - ev.available_capacity) * ev.ticket_price,
    0
  );

  const formatDate = (dateStr: string) => {
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

  return (
    <div className={styles.container}>
      
      {/* CABEÇALHO */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Painel do Organizador</h1>
          <p className={styles.subtitle}>Gerencie todos os seus eventos, ingressos e vendas em um só lugar.</p>
        </div>

        <Link to="/organizer/events/new" className={styles.createBtn}>
          <PlusCircle size={18} />
          <span>Criar Novo Evento</span>
        </Link>
      </div>

      {/* METRICS CARDS */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIconWrapper}>
            <Calendar size={22} className={styles.statIcon} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Total de Eventos</span>
            <span className={styles.statValue}>{totalEvents}</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIconWrapper}>
            <Ticket size={22} className={styles.statIcon} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Ingressos Emitidos</span>
            <span className={styles.statValue}>{totalCapacity - totalAvailable} / {totalCapacity}</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIconWrapper}>
            <DollarSign size={22} className={styles.statIcon} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Receita de Vendas</span>
            <span className={styles.statValue}>R$ {potentialRevenue.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* MENSAGEM DE ERRO */}
      {error && (
        <div className={styles.errorBanner}>
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {/* LISTA DE EVENTOS */}
      <div className={styles.eventsSection}>
        <h2 className={styles.sectionTitle}>Seus Eventos Cadastrados</h2>

        {loading ? (
          <div className={styles.loadingWrapper}>
            <Loader2 size={36} className={styles.spinner} />
            <p>Carregando seus eventos...</p>
          </div>
        ) : events.length === 0 ? (
          <div className={styles.emptyState}>
            <Ticket size={48} className={styles.emptyIcon} />
            <h3>Você ainda não criou nenhum evento</h3>
            <p>Crie o seu primeiro evento e comece a vender ingressos pela TicketON!</p>
            <Link to="/organizer/events/new" className={styles.createBtn}>
              <PlusCircle size={18} />
              <span>Criar Primeiro Evento</span>
            </Link>
          </div>
        ) : (
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Evento</th>
                  <th>Data & Local</th>
                  <th>Preço</th>
                  <th>Vagas / Capacidade</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {events.map((ev) => {
                  const soldTickets = ev.total_capacity - ev.available_capacity;
                  const percentSold = ev.total_capacity > 0 
                    ? Math.round((soldTickets / ev.total_capacity) * 100) 
                    : 0;

                  return (
                    <tr key={ev.id}>
                      {/* Coluna Evento */}
                      <td>
                        <div className={styles.eventCell}>
                          <img
                            src={ev.banner_url || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=200&q=80'}
                            alt={ev.title}
                            className={styles.eventThumb}
                          />
                          <div>
                            <span className={styles.eventName}>{ev.title}</span>
                            <span className={styles.eventCategory}>{ev.category || 'Geral'}</span>
                          </div>
                        </div>
                      </td>

                      {/* Coluna Data & Local */}
                      <td>
                        <div className={styles.infoCell}>
                          <div className={styles.infoRow}>
                            <Calendar size={14} />
                            <span>{formatDate(ev.event_date)}</span>
                          </div>
                          <div className={styles.infoRow}>
                            <MapPin size={14} />
                            <span>{ev.venue_name}, {ev.venue_city}</span>
                          </div>
                        </div>
                      </td>

                      {/* Coluna Preço */}
                      <td>
                        <span className={styles.priceText}>
                          {ev.ticket_price === 0 ? 'Gratuito' : `R$ ${ev.ticket_price.toFixed(2)}`}
                        </span>
                      </td>

                      {/* Coluna Capacidade */}
                      <td>
                        <div className={styles.capacityWrapper}>
                          <div className={styles.capacityHeader}>
                            <span>{soldTickets} vendidos</span>
                            <span>{ev.total_capacity} total</span>
                          </div>
                          <div className={styles.progressBarBg}>
                            <div
                              className={styles.progressBarFill}
                              style={{ width: `${percentSold}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Coluna Status */}
                      <td>
                        <span className={`${styles.statusBadge} ${styles[ev.status.toLowerCase()] || styles.published}`}>
                          {ev.status === 'PUBLISHED' ? 'Publicado' : ev.status}
                        </span>
                      </td>

                      {/* Coluna Ações */}
                      <td style={{ textAlign: 'right' }}>
                        <div className={styles.actionsCell}>
                          <Link
                            to={`/eventos/${ev.id}`}
                            className={styles.actionBtn}
                            title="Ver página pública do evento"
                          >
                            <ExternalLink size={16} />
                          </Link>

                          <button
                            onClick={() => handleDeleteEvent(ev.id, ev.title)}
                            disabled={deletingId === ev.id}
                            className={`${styles.actionBtn} ${styles.deleteBtn}`}
                            title="Excluir evento"
                          >
                            {deletingId === ev.id ? (
                              <Loader2 size={16} className={styles.spinner} />
                            ) : (
                              <Trash2 size={16} />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};

export default OrganizerDashboard;

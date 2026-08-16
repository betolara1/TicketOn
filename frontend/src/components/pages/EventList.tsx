import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { eventService } from '../../services/eventService';
import { ticketmasterService } from '../../services/ticketmasterService';
import type { Event, TicketmasterEventItem } from '../../types';
import {
  Search,
  MapPin,
  Calendar,
  Tag,
  Ticket,
  Globe,
  Sparkles,
  PlusCircle,
  Loader2
} from 'lucide-react';
import styles from './EventList.module.css';

export const EventList: React.FC = () => {
  const { isOrganizer } = useAuth();
  const navigate = useNavigate();

  // Estados de dados
  const [localEvents, setLocalEvents] = useState<Event[]>([]);
  const [tmEvents, setTmEvents] = useState<TicketmasterEventItem[]>([]);

  // Estados de UI e Filtros
  const [activeTab, setActiveTab] = useState<'ticketon' | 'ticketmaster'>('ticketon');
  const [searchTerm, setSearchTerm] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [loading, setLoading] = useState(true);

  // Carrega eventos locais do TicketON
  const fetchLocalEvents = async () => {
    try {
      setLoading(true);
      const data = await eventService.getPublishedEvents({
        search: searchTerm || undefined,
        city: cityFilter || undefined,
        category: categoryFilter || undefined,
      });
      setLocalEvents(data);
    } catch (error) {
      console.error('Erro ao carregar eventos do TicketON:', error);
    } finally {
      setLoading(false);
    }
  };

  // Carrega atrações da Ticketmaster
  const fetchTmEvents = async () => {
    try {
      setLoading(true);
      const data = await ticketmasterService.searchEvents(
        searchTerm || undefined,
        cityFilter || undefined
      );
      setTmEvents(data);
    } catch (error) {
      console.error('Erro ao buscar Ticketmaster:', error);
    } finally {
      setLoading(false);
    }
  };

  // Dispara a busca quando a aba ou os filtros mudam
  useEffect(() => {
    if (activeTab === 'ticketon') {
      fetchLocalEvents();
    } else {
      fetchTmEvents();
    }
  }, [activeTab, categoryFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === 'ticketon') {
      fetchLocalEvents();
    } else {
      fetchTmEvents();
    }
  };

  // Redireciona o Organizador para criar evento pré-preenchido com dados da Ticketmaster
  const handleImportToEvent = (tm: TicketmasterEventItem) => {
    navigate('/organizer/events/new', {
      state: {
        title: tm.title,
        category: tm.category || 'Música',
        banner_url: tm.banner_url || '',
        venue_name: tm.suggested_venue || '',
        venue_city: tm.suggested_city || '',
        external_tm_id: tm.external_id,
      },
    });
  };

  // Formatação de data amigável
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

      {/* CABEÇALHO HERO */}
      <section className={styles.hero}>
        <h1 className={styles.heroTitle}>
          Garantindo a diversão em <span className={styles.highlight}>um Ticket</span>
        </h1>

        {/* BARRA DE PESQUISA */}
        <form onSubmit={handleSearchSubmit} className={styles.searchBar}>
          <div className={styles.searchInputWrapper}>
            <Search size={20} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Buscar por evento, filme ou atração..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
          </div>

          <div className={styles.searchInputWrapper}>
            <MapPin size={20} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Cidade (ex: São Paulo)"
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              className={styles.searchInput}
            />
          </div>

          <button type="submit" className={styles.searchBtn}>
            Buscar
          </button>
        </form>
      </section>

      {/* SELETOR DE ABAS */}
      <div className={styles.tabContainer}>
        <div className={styles.tabs}>
          <button
            type="button"
            className={`${styles.tabBtn} ${activeTab === 'ticketon' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('ticketon')}
          >
            <Ticket size={18} />
            <span>Eventos no TicketON</span>
            <span className={styles.badgeCount}>{localEvents.length}</span>
          </button>

          <button
            type="button"
            className={`${styles.tabBtn} ${activeTab === 'ticketmaster' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('ticketmaster')}
          >
            <Globe size={18} />
            <span>Atrações Globais (Ticketmaster)</span>
            <span className={styles.badgeCount}>{tmEvents.length}</span>
          </button>
        </div>

        {/* FILTRO DE CATEGORIAS (para eventos locais) */}
        {activeTab === 'ticketon' && (
          <div className={styles.categories}>
            {['', 'Música', 'Teatro', 'Festival', 'Esporte', 'Tecnologia'].map((cat) => (
              <button
                key={cat}
                type="button"
                className={`${styles.catBtn} ${categoryFilter === cat ? styles.catBtnActive : ''}`}
                onClick={() => setCategoryFilter(cat)}
              >
                {cat || 'Todos'}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ESTADO DE CARREGAMENTO */}
      {loading ? (
        <div className={styles.loadingContainer}>
          <Loader2 size={36} className={styles.spinner} />
          <p>Buscando eventos incríveis para você...</p>
        </div>
      ) : (
        <>
          {/* GRID DE EVENTOS DO TICKETON */}
          {activeTab === 'ticketon' && (
            localEvents.length === 0 ? (
              <div className={styles.emptyState}>
                <Ticket size={48} className={styles.emptyIcon} />
                <h3>Nenhum evento encontrado</h3>
                <p>Tente ajustar os filtros ou pesquisar por outro termo.</p>
              </div>
            ) : (
              <div className={styles.grid}>
                {localEvents.map((event) => (
                  <div key={event.id} className={styles.card}>
                    <div className={styles.cardImageWrapper}>
                      <img
                        src={event.banner_url || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=80'}
                        alt={event.title}
                        className={styles.cardImage}
                      />
                      <span className={styles.tagBadge}>
                        <Tag size={12} /> {event.category || 'Geral'}
                      </span>
                    </div>

                    <div className={styles.cardBody}>
                      <h3 className={styles.cardTitle}>{event.title}</h3>

                      <div className={styles.cardInfo}>
                        <div className={styles.infoRow}>
                          <Calendar size={15} />
                          <span>{formatDate(event.event_date)}</span>
                        </div>
                        <div className={styles.infoRow}>
                          <MapPin size={15} />
                          <span>{event.venue_name} - {event.venue_city}</span>
                        </div>
                      </div>

                      <div className={styles.cardFooter}>
                        <div className={styles.priceContainer}>
                          <span className={styles.priceLabel}>A partir de</span>
                          <span className={styles.priceValue}>
                            {event.ticket_price === 0 ? 'Gratuito' : `R$ ${event.ticket_price.toFixed(2)}`}
                          </span>
                        </div>

                        <Link to={`/eventos/${event.id}`} className={styles.buyBtn}>
                          Ver Ingressos
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}

          {/* GRID DE ATRAÇÕES DA TICKETMASTER */}
          {activeTab === 'ticketmaster' && (
            tmEvents.length === 0 ? (
              <div className={styles.emptyState}>
                <Globe size={48} className={styles.emptyIcon} />
                <h3>Nenhuma atração encontrada na Ticketmaster</h3>
                <p>Experimente buscar por artistas internacionais como "Coldplay", "Rock" ou cidades como "São Paulo".</p>
              </div>
            ) : (
              <div className={styles.grid}>
                {tmEvents.map((tm) => (
                  <div key={tm.external_id} className={`${styles.card} ${styles.tmCard}`}>
                    <div className={styles.cardImageWrapper}>
                      <img
                        src={tm.banner_url || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&q=80'}
                        alt={tm.title}
                        className={styles.cardImage}
                      />
                      <span className={`${styles.tagBadge} ${styles.tmBadge}`}>
                        <Sparkles size={12} /> Ticketmaster Global
                      </span>
                    </div>

                    <div className={styles.cardBody}>
                      <h3 className={styles.cardTitle}>{tm.title}</h3>

                      <div className={styles.cardInfo}>
                        <div className={styles.infoRow}>
                          <Tag size={15} />
                          <span>{tm.category || 'Show / Atração'}</span>
                        </div>
                        <div className={styles.infoRow}>
                          <MapPin size={15} />
                          <span>{tm.suggested_venue} - {tm.suggested_city}</span>
                        </div>
                      </div>

                      <div className={styles.cardFooter}>
                        {isOrganizer ? (
                          <button
                            onClick={() => handleImportToEvent(tm)}
                            className={styles.importBtn}
                            type="button"
                          >
                            <PlusCircle size={16} /> Criar Evento Aqui
                          </button>
                        ) : (
                          <span className={styles.tmInfoText}>Atração Internacional</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </>
      )}

    </div>
  );
};

export default EventList;

import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { eventService, type CreateEventInput } from '../../../services/eventService';
import { 
  ArrowLeft, 
  Calendar, 
  MapPin, 
  Image as ImageIcon, 
  Tag, 
  DollarSign, 
  Users, 
  Sparkles, 
  AlertCircle, 
  Loader2 
} from 'lucide-react';
import styles from './EventForm.module.css';

export const EventForm: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Dados recebidos caso venha de uma importação da Ticketmaster
  const tmData = location.state as Partial<CreateEventInput> | null;

  // Estados dos campos do formulário
  const [title, setTitle] = useState(tmData?.title || '');
  const [description, setDescription] = useState(tmData?.description || '');
  const [bannerUrl, setBannerUrl] = useState(tmData?.banner_url || '');
  const [category, setCategory] = useState(tmData?.category || 'Música');
  const [venueName, setVenueName] = useState(tmData?.venue_name || '');
  const [venueCity, setVenueCity] = useState(tmData?.venue_city || '');
  const [eventDate, setEventDate] = useState('');
  const [totalCapacity, setTotalCapacity] = useState<number>(500);
  const [ticketPrice, setTicketPrice] = useState<number>(100);
  const [externalTmId] = useState<string | undefined>(tmData?.external_tm_id);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title || !venueName || !venueCity || !eventDate) {
      setError('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    try {
      setLoading(true);

      const payload: CreateEventInput = {
        title,
        description: description || undefined,
        banner_url: bannerUrl || undefined,
        category,
        venue_name: venueName,
        venue_city: venueCity,
        event_date: new Date(eventDate).toISOString(),
        total_capacity: Number(totalCapacity),
        ticket_price: Number(ticketPrice),
        external_tm_id: externalTmId,
      };

      await eventService.createEvent(payload);
      navigate('/organizer/dashboard');
    } catch (err: any) {
      console.error('Erro ao criar evento:', err);
      const msg = err.response?.data?.detail || 'Erro ao criar evento. Verifique os dados.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      
      {/* CABEÇALHO */}
      <div className={styles.header}>
        <Link to="/organizer/dashboard" className={styles.backBtn}>
          <ArrowLeft size={20} />
          <span>Voltar para o Painel</span>
        </Link>
        <h1 className={styles.title}>Criar Novo Evento</h1>
        <p className={styles.subtitle}>
          Cadastre seu show, festival ou apresentação e comece a vender ingressos.
        </p>

        {externalTmId && (
          <div className={styles.tmBanner}>
            <Sparkles size={18} />
            <span>Evento pré-preenchido a partir da <strong>Ticketmaster Global</strong></span>
          </div>
        )}
      </div>

      {error && (
        <div className={styles.errorMessage}>
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {/* LAYOUT EM GRID: FORMULÁRIO + PREVIEW */}
      <div className={styles.contentGrid}>
        
        {/* FORMULÁRIO */}
        <form onSubmit={handleSubmit} className={styles.formCard}>
          
          {/* Seção 1: Informações Gerais */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>1. Informações Básicas</h2>
            
            <div className={styles.inputGroup}>
              <label htmlFor="title">Nome do Evento *</label>
              <input
                id="title"
                type="text"
                placeholder="Ex: Festival de Verão 2026"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className={styles.row}>
              <div className={styles.inputGroup}>
                <label htmlFor="category">Categoria</label>
                <select
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className={styles.select}
                >
                  <option value="Música">Música / Shows</option>
                  <option value="Festival">Festival</option>
                  <option value="Teatro">Teatro & Espetáculos</option>
                  <option value="Stand-up">Stand-up & Comédia</option>
                  <option value="Esporte">Esportes</option>
                  <option value="Tecnologia">Tecnologia & Conferência</option>
                  <option value="Gastronomia">Gastronomia</option>
                  <option value="Outros">Outros</option>
                </select>
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="bannerUrl">URL da Imagem / Banner</label>
                <div className={styles.inputWithIcon}>
                  <ImageIcon size={18} className={styles.inputIcon} />
                  <input
                    id="bannerUrl"
                    type="url"
                    placeholder="https://exemplo.com/banner.jpg"
                    value={bannerUrl}
                    onChange={(e) => setBannerUrl(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="description">Descrição do Evento</label>
              <textarea
                id="description"
                rows={4}
                placeholder="Conte mais sobre as atrações, horários, classificação etária, etc."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>

          {/* Seção 2: Local e Horário */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>2. Data e Local</h2>

            <div className={styles.inputGroup}>
              <label htmlFor="eventDate">Data e Hora do Evento *</label>
              <input
                id="eventDate"
                type="datetime-local"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                required
              />
            </div>

            <div className={styles.row}>
              <div className={styles.inputGroup}>
                <label htmlFor="venueName">Local / Estabelecimento *</label>
                <div className={styles.inputWithIcon}>
                  <MapPin size={18} className={styles.inputIcon} />
                  <input
                    id="venueName"
                    type="text"
                    placeholder="Ex: Allianz Parque"
                    value={venueName}
                    onChange={(e) => setVenueName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="venueCity">Cidade *</label>
                <input
                  id="venueCity"
                  type="text"
                  placeholder="Ex: São Paulo"
                  value={venueCity}
                  onChange={(e) => setVenueCity(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          {/* Seção 3: Ingressos e Capacidade */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>3. Ingressos e Lotação</h2>

            <div className={styles.row}>
              <div className={styles.inputGroup}>
                <label htmlFor="totalCapacity">Capacidade Total (Vagas) *</label>
                <div className={styles.inputWithIcon}>
                  <Users size={18} className={styles.inputIcon} />
                  <input
                    id="totalCapacity"
                    type="number"
                    min="1"
                    placeholder="500"
                    value={totalCapacity}
                    onChange={(e) => setTotalCapacity(Number(e.target.value))}
                    required
                  />
                </div>
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="ticketPrice">Preço do Ingresso (R$) *</label>
                <div className={styles.inputWithIcon}>
                  <DollarSign size={18} className={styles.inputIcon} />
                  <input
                    id="ticketPrice"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="150.00"
                    value={ticketPrice}
                    onChange={(e) => setTicketPrice(Number(e.target.value))}
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* BOTÃO DE SUBMISSÃO */}
          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? (
              <>
                <Loader2 size={20} className={styles.spinner} />
                <span>Publicando Evento...</span>
              </>
            ) : (
              'Publicar Evento no TicketON'
            )}
          </button>
        </form>

        {/* PRÉVIA EM TEMPO REAL (CARD PREVIEW) */}
        <aside className={styles.previewContainer}>
          <h3 className={styles.previewHeading}>Prévia na Vitrine</h3>
          
          <div className={styles.previewCard}>
            <div className={styles.previewImageWrapper}>
              <img
                src={bannerUrl || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=80'}
                alt={title || 'Prévia do Evento'}
                className={styles.previewImage}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=80';
                }}
              />
              <span className={styles.previewBadge}>
                <Tag size={12} /> {category || 'Geral'}
              </span>
            </div>

            <div className={styles.previewBody}>
              <h4 className={styles.previewTitle}>
                {title || 'Título do seu evento incrível'}
              </h4>

              <div className={styles.previewInfo}>
                <div className={styles.previewRow}>
                  <Calendar size={14} />
                  <span>{eventDate ? new Date(eventDate).toLocaleString('pt-BR') : 'Data a definir'}</span>
                </div>
                <div className={styles.previewRow}>
                  <MapPin size={14} />
                  <span>{venueName || 'Local'}, {venueCity || 'Cidade'}</span>
                </div>
              </div>

              <div className={styles.previewFooter}>
                <div className={styles.previewPrice}>
                  <span>A partir de</span>
                  <strong>{ticketPrice > 0 ? `R$ ${Number(ticketPrice).toFixed(2)}` : 'Gratuito'}</strong>
                </div>
                <button type="button" className={styles.previewBtn} disabled>
                  Comprar
                </button>
              </div>
            </div>
          </div>
        </aside>

      </div>

    </div>
  );
};

export default EventForm;

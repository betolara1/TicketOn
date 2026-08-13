import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { eventService } from '../../services/eventService';
import { orderService } from '../../services/orderService';
import type { Event, PaymentMethod } from '../../types';
import { 
  Calendar, 
  MapPin, 
  Tag, 
  Users, 
  CreditCard, 
  QrCode, 
  CheckCircle2, 
  AlertCircle, 
  ArrowLeft, 
  Loader2, 
  Minus, 
  Plus, 
  ShieldCheck, 
  Ticket 
} from 'lucide-react';
import styles from './EventDetail.module.css';

export const EventDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, isStaff } = useAuth();

  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados de Compra
  const [quantity, setQuantity] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('PIX');
  const [buying, setBuying] = useState(false);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);
  const [purchaseError, setPurchaseError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvent = async () => {
      if (!id) return;
      try {
        setLoading(true);
        setError(null);
        const data = await eventService.getEventById(Number(id));
        setEvent(data);
      } catch (err: any) {
        console.error('Erro ao buscar evento:', err);
        setError('Evento não encontrado ou indisponível no momento.');
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  const handleQuantityChange = (delta: number) => {
    setQuantity((prev) => {
      const next = prev + delta;
      if (next < 1) return 1;
      if (event && next > event.available_capacity) return prev;
      return next;
    });
  };

  const handleCheckout = async () => {
    if (!isAuthenticated) {
      alert('Você precisa estar conectado em uma conta para comprar ingressos.');
      return;
    }

    if (!event) return;

    try {
      setBuying(true);
      setPurchaseError(null);

      await orderService.createOrder({
        event_id: event.id,
        quantity,
        payment_method: paymentMethod,
      });

      setPurchaseSuccess(true);
      setTimeout(() => {
        navigate('/my-tickets');
      }, 2000);
    } catch (err: any) {
      console.error('Erro no checkout:', err);
      const msg = err.response?.data?.detail || 'Erro ao processar pagamento. Tente novamente.';
      setPurchaseError(msg);
    } finally {
      setBuying(false);
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return new Intl.DateTimeFormat('pt-BR', {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(date);
    } catch {
      return dateStr;
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <Loader2 size={40} className={styles.spinner} />
        <p>Carregando informações do evento...</p>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className={styles.errorContainer}>
        <AlertCircle size={48} className={styles.errorIcon} />
        <h2>Ops! Evento não encontrado</h2>
        <p>{error || 'O evento que você procura não está disponível.'}</p>
        <Link to="/" className={styles.backHomeBtn}>
          <ArrowLeft size={18} />
          <span>Voltar para Eventos</span>
        </Link>
      </div>
    );
  }

  const isSoldOut = event.available_capacity <= 0;
  const totalPrice = quantity * event.ticket_price;

  return (
    <div className={styles.container}>
      
      {/* BOTÃO VOLTAR */}
      <Link to="/" className={styles.backLink}>
        <ArrowLeft size={18} />
        <span>Voltar para todos os eventos</span>
      </Link>

      {/* HERO / BANNER PRINCIPAL */}
      <div className={styles.heroBanner}>
        <img
          src={event.banner_url || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1400&q=80'}
          alt={event.title}
          className={styles.heroImage}
        />
        <div className={styles.heroOverlay}>
          <span className={styles.categoryBadge}>
            <Tag size={14} /> {event.category || 'Geral'}
          </span>
          <h1 className={styles.eventTitle}>{event.title}</h1>
          <div className={styles.heroMeta}>
            <div className={styles.metaItem}>
              <Calendar size={16} />
              <span>{formatDate(event.event_date)}</span>
            </div>
            <div className={styles.metaItem}>
              <MapPin size={16} />
              <span>{event.venue_name} - {event.venue_city}</span>
            </div>
          </div>
        </div>
      </div>

      {/* GRID COM DETALHES E CARD DE COMPRA */}
      <div className={styles.detailsGrid}>
        
        {/* COLUNA ESQUERDA: INFORMAÇÕES */}
        <div className={styles.mainInfo}>
          
          {/* Descrição */}
          <section className={styles.infoCard}>
            <h2 className={styles.cardTitle}>Sobre o Evento</h2>
            <p className={styles.description}>
              {event.description || 'Nenhuma descrição detalhada foi informada pelo organizador.'}
            </p>
          </section>

          {/* Localização e Capacidade */}
          <section className={styles.infoCard}>
            <h2 className={styles.cardTitle}>Local & Informações</h2>
            <div className={styles.venueInfo}>
              <div className={styles.venueItem}>
                <strong>Local:</strong>
                <span>{event.venue_name}</span>
              </div>
              <div className={styles.venueItem}>
                <strong>Cidade:</strong>
                <span>{event.venue_city}</span>
              </div>
              <div className={styles.venueItem}>
                <strong>Capacidade Total:</strong>
                <span>{event.total_capacity} pessoas</span>
              </div>
              <div className={styles.venueItem}>
                <strong>Ingressos Restantes:</strong>
                <span className={isSoldOut ? styles.soldOutText : styles.availableText}>
                  {event.available_capacity} disponíveis
                </span>
              </div>
            </div>
          </section>

          {/* Vantagens / Segurança */}
          <section className={styles.infoCard}>
            <h2 className={styles.cardTitle}>Entrada e Validação</h2>
            <div className={styles.featuresList}>
              <div className={styles.featureItem}>
                <QrCode size={22} className={styles.featureIcon} />
                <div>
                  <h4>Ingresso Digital com QR Code</h4>
                  <p>Apresente o QR Code direto no celular na entrada do evento.</p>
                </div>
              </div>

              <div className={styles.featureItem}>
                <ShieldCheck size={22} className={styles.featureIcon} />
                <div>
                  <h4>Compra 100% Segura</h4>
                  <p>Seus ingressos ficam salvos na sua conta e validados na portaria.</p>
                </div>
              </div>
            </div>
          </section>

        </div>

        {/* COLUNA DIREITA: CARD DE COMPRA (CHECKOUT) */}
        <aside className={styles.checkoutWrapper}>
          <div className={styles.checkoutCard}>
            <div className={styles.checkoutHeader}>
              <span className={styles.priceLabel}>Valor do Ingresso</span>
              <div className={styles.priceBig}>
                {event.ticket_price === 0 ? 'Gratuito' : `R$ ${event.ticket_price.toFixed(2)}`}
              </div>
            </div>

            {purchaseSuccess ? (
              <div className={styles.successState}>
                <CheckCircle2 size={48} className={styles.successIcon} />
                <h3>Compra Realizada com Sucesso!</h3>
                <p>Redirecionando para seus ingressos...</p>
              </div>
            ) : isSoldOut ? (
              <div className={styles.soldOutBanner}>
                <Ticket size={28} />
                <h3>Ingressos Esgotados</h3>
                <p>Todas as vagas para este evento foram preenchidas.</p>
              </div>
            ) : (
              <>
                {/* Seletor de Quantidade */}
                <div className={styles.quantitySection}>
                  <label>Quantidade de Ingressos:</label>
                  <div className={styles.quantityControls}>
                    <button
                      type="button"
                      onClick={() => handleQuantityChange(-1)}
                      disabled={quantity <= 1}
                      className={styles.qtyBtn}
                    >
                      <Minus size={16} />
                    </button>
                    <span className={styles.qtyValue}>{quantity}</span>
                    <button
                      type="button"
                      onClick={() => handleQuantityChange(1)}
                      disabled={quantity >= event.available_capacity}
                      className={styles.qtyBtn}
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>

                {/* Forma de Pagamento */}
                <div className={styles.paymentSection}>
                  <label>Forma de Pagamento:</label>
                  <div className={styles.paymentOptions}>
                    <button
                      type="button"
                      className={`${styles.paymentBtn} ${paymentMethod === 'PIX' ? styles.paymentBtnActive : ''}`}
                      onClick={() => setPaymentMethod('PIX')}
                    >
                      PIX
                    </button>
                    <button
                      type="button"
                      className={`${styles.paymentBtn} ${paymentMethod === 'CREDIT_CARD' ? styles.paymentBtnActive : ''}`}
                      onClick={() => setPaymentMethod('CREDIT_CARD')}
                    >
                      Crédito
                    </button>
                    <button
                      type="button"
                      className={`${styles.paymentBtn} ${paymentMethod === 'DEBIT_CARD' ? styles.paymentBtnActive : ''}`}
                      onClick={() => setPaymentMethod('DEBIT_CARD')}
                    >
                      Débito
                    </button>
                  </div>
                </div>

                {/* Resumo do Total */}
                <div className={styles.summarySection}>
                  <div className={styles.summaryRow}>
                    <span>{quantity}x Ingresso</span>
                    <span>R$ {totalPrice.toFixed(2)}</span>
                  </div>
                  <div className={`${styles.summaryRow} ${styles.summaryTotal}`}>
                    <strong>Total a Pagar</strong>
                    <strong>R$ {totalPrice.toFixed(2)}</strong>
                  </div>
                </div>

                {purchaseError && (
                  <div className={styles.purchaseError}>
                    <AlertCircle size={16} />
                    <span>{purchaseError}</span>
                  </div>
                )}

                {/* Botão de Compra */}
                <button
                  type="button"
                  onClick={handleCheckout}
                  disabled={buying}
                  className={styles.buyNowBtn}
                >
                  {buying ? (
                    <>
                      <Loader2 size={18} className={styles.spinner} />
                      <span>Processando Pedido...</span>
                    </>
                  ) : !isAuthenticated ? (
                    'Entrar para Comprar'
                  ) : (
                    'Garantir Meu Ingresso'
                  )}
                </button>
              </>
            )}

          </div>
        </aside>

      </div>

    </div>
  );
};

export default EventDetail;

// src/components/modals/SeatSelectionModal.tsx
import React, { useState, useEffect } from 'react';
import { seatService } from '../../services/seatService';
import type { Event, Seat } from '../../types';
import { 
  X, 
  MapPin, 
  Calendar, 
  User, 
  Loader2, 
  Check, 
  AlertCircle 
} from 'lucide-react';
import styles from './SeatSelectionModal.module.css';

interface SeatSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: Event;
  requiredQuantity: number;
  onConfirm: (selectedSeatIds: number[]) => void;
  loadingCheckout: boolean;
}

export const SeatSelectionModal: React.FC<SeatSelectionModalProps> = ({
  isOpen,
  onClose,
  event,
  requiredQuantity,
  onConfirm,
  loadingCheckout,
}) => {
  const [seats, setSeats] = useState<Seat[]>([]);
  const [selectedSeatIds, setSelectedSeatIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && event.id) {
      const loadSeats = async () => {
        try {
          setLoading(true);
          setError(null);
          const data = await seatService.getEventSeats(event.id);
          setSeats(data);
          setSelectedSeatIds([]);
        } catch (err: any) {
          console.error('Erro ao buscar assentos:', err);
          setError('Não foi possível carregar o mapa de assentos.');
        } finally {
          setLoading(false);
        }
      };

      loadSeats();
    }
  }, [isOpen, event.id]);

  if (!isOpen) return null;

  const handleSeatClick = (seat: Seat) => {
    if (seat.status !== 'AVAILABLE') return; // Assento ocupado não pode ser clicado

    const isSelected = selectedSeatIds.includes(seat.id);

    if (isSelected) {
      // Remove da seleção
      setSelectedSeatIds((prev) => prev.filter((id) => id !== seat.id));
    } else {
      // Se já atingiu a quantidade máxima, remove o mais antigo e adiciona o novo
      if (selectedSeatIds.length >= requiredQuantity) {
        setSelectedSeatIds((prev) => [...prev.slice(1), seat.id]);
      } else {
        setSelectedSeatIds((prev) => [...prev, seat.id]);
      }
    }
  };

  // Agrupa os assentos por letra da fileira (ex: "A", "B", "C")
  const groupedSeats: { [row: string]: Seat[] } = {};
  seats.forEach((seat) => {
    const rowLetter = seat.label.charAt(0);
    if (!groupedSeats[rowLetter]) {
      groupedSeats[rowLetter] = [];
    }
    groupedSeats[rowLetter].push(seat);
  });

  const selectedLabels = seats
    .filter((s) => selectedSeatIds.includes(s.id))
    .map((s) => s.label)
    .join(', ');

  const isSelectionComplete = selectedSeatIds.length === requiredQuantity;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        
        {/* BOTÃO FECHAR */}
        <button type="button" className={styles.closeBtn} onClick={onClose}>
          <X size={20} />
        </button>

        {/* BARRA SUPERIOR (ESTILO CINEMA) */}
        <div className={styles.topBar}>
          <div className={styles.topBarItem}>
            <MapPin size={16} />
            <span>{event.venue_name} - {event.venue_city}</span>
          </div>
          <div className={styles.topBarItem}>
            <Calendar size={16} />
            <span>{new Date(event.event_date).toLocaleDateString('pt-BR')} às {new Date(event.event_date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </div>

        {/* AVISO DE SELEÇÃO */}
        <div className={styles.alertBanner}>
          <span>
            Selecione <strong>{requiredQuantity} {requiredQuantity === 1 ? 'assento' : 'assentos'}</strong> no mapa abaixo para a sua sessão.
          </span>
        </div>

        {/* LEGENDA */}
        <div className={styles.legend}>
          <div className={styles.legendItem}>
            <span className={`${styles.seatCircle} ${styles.seatAvailable}`} />
            <span>Disponível</span>
          </div>
          <div className={styles.legendItem}>
            <span className={`${styles.seatCircle} ${styles.seatSelected}`} />
            <span>Selecionado</span>
          </div>
          <div className={styles.legendItem}>
            <span className={`${styles.seatCircle} ${styles.seatSold}`}>
              <User size={10} />
            </span>
            <span>Ocupado</span>
          </div>
        </div>

        {/* MAPA DE ASSENTOS */}
        <div className={styles.mapContainer}>
          {loading ? (
            <div className={styles.loadingWrapper}>
              <Loader2 size={36} className={styles.spinner} />
              <p>Carregando mapa de assentos...</p>
            </div>
          ) : error ? (
            <div className={styles.errorWrapper}>
              <AlertCircle size={28} />
              <p>{error}</p>
            </div>
          ) : (
            <div className={styles.seatsGrid}>
              {Object.keys(groupedSeats).map((rowLetter) => (
                <div key={rowLetter} className={styles.row}>
                  <span className={styles.rowLabel}>{rowLetter}</span>
                  
                  <div className={styles.seatsInRow}>
                    {groupedSeats[rowLetter].map((seat) => {
                      const isSelected = selectedSeatIds.includes(seat.id);
                      const isSold = seat.status !== 'AVAILABLE';

                      return (
                        <button
                          key={seat.id}
                          type="button"
                          disabled={isSold}
                          onClick={() => handleSeatClick(seat)}
                          className={`
                            ${styles.seat} 
                            ${isSelected ? styles.selected : ''} 
                            ${isSold ? styles.sold : styles.available}
                          `}
                          title={`Assento ${seat.label}`}
                        >
                          {isSold ? <User size={12} /> : seat.label.slice(1)}
                        </button>
                      );
                    })}
                  </div>

                  <span className={styles.rowLabel}>{rowLetter}</span>
                </div>
              ))}
            </div>
          )}

          {/* INDICADOR DE PALCO / TELA */}
          <div className={styles.screenBar}>
            <div className={styles.screenLine} />
            <span>PALCO / TELA</span>
          </div>
        </div>

        {/* RODAPÉ COM RESUMO E BOTÃO DE CONFIRMAR */}
        <div className={styles.footer}>
          <div className={styles.summary}>
            <div className={styles.summarySeats}>
              <span>Assentos escolhidos:</span>
              <strong>{selectedLabels || 'Nenhum assento selecionado'}</strong>
            </div>
            <div className={styles.summaryCounter}>
              {selectedSeatIds.length} de {requiredQuantity} selecionados
            </div>
          </div>

          <button
            type="button"
            disabled={!isSelectionComplete || loadingCheckout}
            onClick={() => onConfirm(selectedSeatIds)}
            className={styles.confirmBtn}
          >
            {loadingCheckout ? (
              <>
                <Loader2 size={18} className={styles.spinner} />
                <span>Processando Compra...</span>
              </>
            ) : (
              <>
                <Check size={18} />
                <span>Confirmar e Finalizar Compra</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};

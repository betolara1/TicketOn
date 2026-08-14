import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { ticketService } from '../../services/ticketService';
import type { TicketValidateResponse } from '../../types';
import { 
  Camera, 
  CameraOff, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  QrCode, 
  Search, 
  Loader2, 
  RefreshCw, 
  User, 
  Calendar, 
  ShieldCheck
} from 'lucide-react';
import styles from './DoorScanner.module.css';

export const DoorScanner: React.FC = () => {
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [lastValidation, setLastValidation] = useState<TicketValidateResponse | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const isScanningRef = useRef(false);

  // Iniciar Câmera
  const startCamera = async () => {
    try {
      setCameraError(null);
      const scanner = new Html5Qrcode('qr-reader');
      html5QrCodeRef.current = scanner;

      await scanner.start(
        { facingMode: 'environment' }, // Câmera traseira no celular
        {
          fps: 10,
          qrbox: { width: 260, height: 260 },
        },
        async (decodedText) => {
          if (!isScanningRef.current) {
            isScanningRef.current = true;
            await handleValidate(decodedText);
            // Pausa breve de 2s para evitar leituras repetidas do mesmo código
            setTimeout(() => {
              isScanningRef.current = false;
            }, 2500);
          }
        },
        (_errorMessage) => {
          // Leituras em frames sem QR Code são ignoradas silenciosamente
        }
      );

      setIsCameraActive(true);
    } catch (err: any) {
      console.error('Erro ao abrir câmera:', err);
      setCameraError(
        'Não foi possível acessar a câmera. Verifique as permissões do navegador ou digite o código manualmente.'
      );
      setIsCameraActive(false);
    }
  };

  // Parar Câmera
  const stopCamera = async () => {
    if (html5QrCodeRef.current) {
      try {
        if (html5QrCodeRef.current.isScanning) {
          await html5QrCodeRef.current.stop();
        }
        html5QrCodeRef.current.clear();
      } catch (err) {
        console.error('Erro ao parar câmera:', err);
      } finally {
        setIsCameraActive(false);
      }
    }
  };

  // Limpa a câmera ao sair da tela
  useEffect(() => {
    return () => {
      if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
        html5QrCodeRef.current.stop().catch(console.error);
      }
    };
  }, []);

  // Processa a validação do ingresso
  const handleValidate = async (code: string) => {
    if (!code || loading) return;

    try {
      setLoading(true);
      const result = await ticketService.validateTicket({ ticket_code: code });
      
      setLastValidation(result);
      setManualCode('');
    } catch (err: any) {
      console.error('Erro na validação:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleValidate(manualCode.trim());
  };

  return (
    <div className={styles.container}>
      
      {/* CABEÇALHO */}
      <div className={styles.header}>
        <div className={styles.badgeStaff}>
          <ShieldCheck size={16} />
          <span>Controle de Portaria & Acesso</span>
        </div>
        <h1 className={styles.title}>Validação de Ingressos</h1>
        <p className={styles.subtitle}>
          Escaneie o QR Code do participante ou faça a busca pelo código do bilhete.
        </p>
      </div>

      <div className={styles.mainGrid}>
        
        {/* COLUNA ESQUERDA: CÂMERA E BUSCA MANUAL */}
        <div className={styles.scannerSection}>
          
          {/* Card da Câmera */}
          <div className={styles.cameraCard}>
            <div className={styles.cameraHeader}>
              <div className={styles.cameraTitle}>
                <Camera size={20} />
                <span>Leitor de Câmera</span>
              </div>

              <button
                type="button"
                onClick={isCameraActive ? stopCamera : startCamera}
                className={`${styles.toggleCameraBtn} ${isCameraActive ? styles.btnStop : styles.btnStart}`}
              >
                {isCameraActive ? (
                  <>
                    <CameraOff size={16} />
                    <span>Desativar Câmera</span>
                  </>
                ) : (
                  <>
                    <Camera size={16} />
                    <span>Ativar Câmera</span>
                  </>
                )}
              </button>
            </div>

            {cameraError && (
              <div className={styles.cameraErrorBanner}>
                <AlertTriangle size={18} />
                <span>{cameraError}</span>
              </div>
            )}

            {/* Container onde a biblioteca do QR code renderiza a imagem */}
            <div className={styles.cameraViewportWrapper}>
              <div id="qr-reader" className={styles.qrReaderBox} />
              
              {!isCameraActive && (
                <div className={styles.cameraPlaceholder}>
                  <QrCode size={56} className={styles.placeholderIcon} />
                  <p>Câmera desativada</p>
                  <span>Clique em <strong>Ativar Câmera</strong> para iniciar a leitura automática.</span>
                </div>
              )}
            </div>
          </div>

          {/* Card de Busca Manual */}
          <div className={styles.manualCard}>
            <h3 className={styles.manualTitle}>Validação Manual por Código</h3>
            
            <form onSubmit={handleManualSubmit} className={styles.manualForm}>
              <div className={styles.inputWrapper}>
                <Search size={18} className={styles.searchIcon} />
                <input
                  type="text"
                  placeholder="Ex: TKT-1A2B3C4D ou Código do Ingresso"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  className={styles.manualInput}
                />
              </div>

              <button
                type="submit"
                disabled={!manualCode || loading}
                className={styles.manualSubmitBtn}
              >
                {loading ? <Loader2 size={18} className={styles.spinner} /> : 'Validar'}
              </button>
            </form>
          </div>

        </div>

        {/* COLUNA DIREITA: RESULTADO E HISTÓRICO */}
        <div className={styles.resultSection}>
          
          {/* CARD DE RESULTADO DA ÚLTIMA LEITURA */}
          <div className={styles.resultCard}>
            <h3 className={styles.resultHeading}>Status do Último Ingresso</h3>

            {loading ? (
              <div className={styles.resultLoading}>
                <Loader2 size={36} className={styles.spinner} />
                <p>Verificando no servidor...</p>
              </div>
            ) : !lastValidation ? (
              <div className={styles.resultEmpty}>
                <QrCode size={48} className={styles.emptyIcon} />
                <p>Aguardando leitura de ingresso</p>
                <span>Aponte a câmera para o bilhete do participante.</span>
              </div>
            ) : (
              <div className={`${styles.statusBox} ${styles[lastValidation.status.toLowerCase()]}`}>
                
                {/* Ícone e Título do Status */}
                <div className={styles.statusHeader}>
                  {lastValidation.status === 'VALID' && <CheckCircle2 size={36} className={styles.iconValid} />}
                  {lastValidation.status === 'USED' && <AlertTriangle size={36} className={styles.iconUsed} />}
                  {lastValidation.status === 'INVALID' && <XCircle size={36} className={styles.iconInvalid} />}

                  <div>
                    <h2 className={styles.statusTitle}>
                      {lastValidation.status === 'VALID' && 'ENTRADA LIBERADA!'}
                      {lastValidation.status === 'USED' && 'INGRESSO JÁ UTILIZADO!'}
                      {lastValidation.status === 'INVALID' && 'INGRESSO INVÁLIDO!'}
                    </h2>
                    <p className={styles.statusMsg}>{lastValidation.message}</p>
                  </div>
                </div>

                {/* Detalhes do Ingresso */}
                <div className={styles.ticketDetails}>
                  {lastValidation.participant_name && (
                    <div className={styles.detailRow}>
                      <User size={16} />
                      <span>Participante: <strong>{lastValidation.participant_name}</strong></span>
                    </div>
                  )}

                  {lastValidation.event_title && (
                    <div className={styles.detailRow}>
                      <Calendar size={16} />
                      <span>Evento: <strong>{lastValidation.event_title}</strong></span>
                    </div>
                  )}

                  {lastValidation.ticket_code && (
                    <div className={styles.detailRow}>
                      <QrCode size={16} />
                      <span>Código: <code>{lastValidation.ticket_code}</code></span>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setLastValidation(null)}
                  className={styles.resetBtn}
                >
                  <RefreshCw size={16} />
                  <span>Próximo Participante</span>
                </button>
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};

export default DoorScanner;

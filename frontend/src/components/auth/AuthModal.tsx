import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authServices';
import type { UserRole } from '../../types';
import { X, Mail, Lock, User as UserIcon, AlertCircle, Loader2 } from 'lucide-react';
import styles from './AuthModal.module.css';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
}) => {
  const { login } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  
  // Estados do formulário
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('CUSTOMER');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setError(null);
    }
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        const data = await authService.login(email, password);
        login(data.access_token, data.user);
        onClose();
      } 
      else {
        await authService.register(name, email, password, role);

        const loginData = await authService.login(email, password);
        login(loginData.access_token, loginData.user);
        onClose();
      }
    } 
    catch (err: any) {
      const msg = err.response?.data?.detail || 'Ocorreu um erro ao processar. Verifique os dados.';
      setError(msg);
    } 
    finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      {/* Impede que o clique dentro do modal feche a janela */}
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        
        {/* Botão de Fechar */}
        <button className={styles.closeButton} onClick={onClose} aria-label="Fechar">
          <X size={20} />
        </button>

        {/* Abas / Título */}
        <div className={styles.header}>
          <h2 className={styles.title}>
            {mode === 'login' ? 'Bem-vindo de volta!' : 'Criar nova conta'}
          </h2>
          <p className={styles.subtitle}>
            {mode === 'login'
              ? 'Acesse sua conta para gerenciar ingressos e eventos'
              : 'Cadastre-se para comprar ou criar eventos no TicketON'}
          </p>
        </div>

        {/* Mensagem de Erro */}
        {error && (
          <div className={styles.errorMessage}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* Formulário */}
        <form onSubmit={handleSubmit} className={styles.form}>
          {mode === 'register' && (
            <div className={styles.inputGroup}>
              <label htmlFor="name">Nome Completo</label>
              <div className={styles.inputWrapper}>
                <UserIcon size={18} className={styles.inputIcon} />
                <input
                  id="name"
                  type="text"
                  placeholder="Seu nome"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>
          )}

          <div className={styles.inputGroup}>
            <label htmlFor="email">E-mail</label>
            <div className={styles.inputWrapper}>
              <Mail size={18} className={styles.inputIcon} />
              <input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="password">Senha</label>
            <div className={styles.inputWrapper}>
              <Lock size={18} className={styles.inputIcon} />
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          {mode === 'register' && (
            <div className={styles.inputGroup}>
              <label htmlFor="role">Tipo de Conta</label>
              <select
                id="role"
                className={styles.select}
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
              >
                <option value="CUSTOMER">Usuário Padrão</option>
                <option value="ORGANIZER">Organizador de Eventos</option>
                <option value="STAFF">Equipe</option>
              </select>
            </div>
          )}

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? (
              <Loader2 size={20} className={styles.spinner} />
            ) : mode === 'login' ? (
              'Entrar'
            ) : (
              'Cadastrar'
            )}
          </button>
        </form>

        {/* Alternar entre Login e Cadastro */}
        <div className={styles.footer}>
          {mode === 'login' ? (
            <p>
              Não tem uma conta?{' '}
              <button
                type="button"
                className={styles.switchBtn}
                onClick={() => {
                  setMode('register');
                  setError(null);
                }}
              >
                Cadastre-se
              </button>
            </p>
          ) : (
            <p>
              Já possui conta?{' '}
              <button
                type="button"
                className={styles.switchBtn}
                onClick={() => {
                  setMode('login');
                  setError(null);
                }}
              >
                Fazer login
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

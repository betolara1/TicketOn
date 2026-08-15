import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authServices';
import type { UserRole } from '../../types';
import { X, Mail, Lock, User as UserIcon, AlertCircle, Loader2, Check, Eye, EyeOff } from 'lucide-react';
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
  const [showPassword, setShowPassword] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Requisitos de validação da senha
  const passwordRequirements = [
    { label: 'Mínimo de 8 caracteres', met: password.length >= 8 },
    { label: 'Uma letra maiúscula (A-Z)', met: /[A-Z]/.test(password) },
    { label: 'Uma letra minúscula (a-z)', met: /[a-z]/.test(password) },
    { label: 'Um número (0-9)', met: /[0-9]/.test(password) },
    { label: 'Um caractere especial (@, $, !, %, etc.)', met: /[@$!%*?&#^()_\-+={}[\]:;<>,.?/|~]/.test(password) },
  ];

  const metCount = passwordRequirements.filter((r) => r.met).length;
  const isPasswordValid = metCount === passwordRequirements.length;

  const getStrengthInfo = () => {
    if (password.length === 0) return { label: '', color: 'transparent', width: '0%' };
    if (metCount <= 2) return { label: 'Fraca', color: '#ef4444', width: '33%' };
    if (metCount <= 4) return { label: 'Média', color: '#f59e0b', width: '66%' };
    return { label: 'Forte', color: '#22c55e', width: '100%' };
  };

  const strength = getStrengthInfo();

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setError(null);
      setShowPassword(false);
    }
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (mode === 'register' && !isPasswordValid) {
      setError('Por favor, atenda a todos os requisitos de segurança da senha.');
      return;
    }

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
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className={styles.togglePasswordBtn}
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? 'Ocultar senha' : 'Exibir senha'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {mode === 'register' && (
              <div className={styles.passwordValidation}>
                {password.length > 0 && (
                  <div className={styles.strengthContainer}>
                    <div className={styles.strengthTrack}>
                      <div
                        className={styles.strengthBar}
                        style={{
                          width: strength.width,
                          backgroundColor: strength.color,
                        }}
                      />
                    </div>
                    <span className={styles.strengthText} style={{ color: strength.color }}>
                      {strength.label}
                    </span>
                  </div>
                )}

                <div className={styles.requirementsList}>
                  {passwordRequirements.map((req, idx) => (
                    <div
                      key={idx}
                      className={`${styles.reqItem} ${req.met ? styles.reqMet : styles.reqUnmet}`}
                    >
                      {req.met ? (
                        <Check size={14} className={styles.reqIconMet} />
                      ) : (
                        <span className={styles.reqDot} />
                      )}
                      <span>{req.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
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

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Ticket, LogOut, User, PlusCircle, QrCode, Calendar } from 'lucide-react';
import { AuthModal } from '../auth/AuthModal';
import styles from './Navbar.module.css';
import logoImg from '../../assets/logo.jpeg';

export const Navbar: React.FC = () => {
    const { user, isAuthenticated, isOrganizer, isStaff, logout } = useAuth();
    const navigate = useNavigate();

    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');

    const handleOpenAuth = (mode: 'login' | 'register') => {
        setAuthModalMode(mode);
        setIsAuthModalOpen(true);
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <>
            <nav className={styles.nav}>
                <div className={styles.container}>
                    
                    {/* LOGO */}
                    <Link to="/" className={styles.logo}> 
                        <span className={styles.logoText}>TicketOn</span>
                    </Link>

                    {/* LINKS CENTRAIS */}
                    <div className={styles.links}>
                        <Link to="/" className={styles.link}>
                            <Calendar size={18} />
                            <span>Eventos</span>
                        </Link>

                        {isAuthenticated && !isOrganizer && !isStaff && (
                            <Link to="/my-tickets" className={styles.link}>
                                <Ticket size={18} />
                                <span>Meus Ingressos</span>
                            </Link>
                        )}
                        
                        {isOrganizer && (
                            <>
                                <Link to="/organizer/dashboard" className={styles.link}>
                                    <span>Meus Eventos</span>
                                </Link>
                                <Link to="/organizer/events/new" className={styles.buttonCreate}>
                                    <PlusCircle size={18} />
                                    <span>Criar Evento</span>
                                </Link>
                            </>
                        )}

                        {isStaff && (
                            <Link to="/doorman/scanner" className={styles.buttonStaff}>
                                <QrCode size={18} />
                                <span>Scanner Portaria</span>
                            </Link>
                        )}
                    </div>

                    {/* ÁREA DO USUÁRIO / LOGIN */}
                    <div className={styles.userSection}>
                        {isAuthenticated && user ? (
                            <div className={styles.userInfo}>
                                <div className={styles.badge}>
                                    <User size={14} />
                                    <span>{user.name}</span>
                                </div>

                                <button onClick={handleLogout} className={styles.logoutButton} title="Sair">
                                    <LogOut size={18} />
                                </button>
                            </div>
                        ) : (
                            <div className={styles.authButtons}>
                                <button 
                                    onClick={() => handleOpenAuth('login')} 
                                    className={styles.loginBtn}
                                    type="button"
                                >
                                    Entrar
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </nav>

            {/* Modal de Autenticação */}
            <AuthModal 
                isOpen={isAuthModalOpen}
                initialMode={authModalMode}
                onClose={() => setIsAuthModalOpen(false)}
            />
        </>
    );
};

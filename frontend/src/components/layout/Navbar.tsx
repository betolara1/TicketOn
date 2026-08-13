import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Ticket, LogOut, User, PlusCircle, QrCode, Calendar } from 'lucide-react';
import styles from './Navbar.module.css';
import logoImg from '../../assets/logo.jpeg';


export const Navbar: React.FC = () => {
    const { user, isAuthenticated, isOrganizer, isStaff, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };


    return(
        <nav className = {styles.nav}>
            <div className = {styles.container}>
                {/* LOGO DO TICKETON */}
                <Link to="/" className = {styles.logo}> 
                    <img src={logoImg} alt="TicketOn Logo" className={styles.logoImage} />
                </Link>
            </div>

            {/* LINKS CENTRAIS */}
            <div className={styles.links}>

                {/* LINKS GERAIS */}
                <Link to="/" className={styles.link}>
                    <Calendar size={18} />
                    <span>Eventos</span>
                </Link>

                {/* Links pra CLIENTE */}
                {isAuthenticated && !isOrganizer && !isStaff && (
                    <Link to="/my-tickets" className={styles.link}>
                    <Ticket size={18} />
                    <span>Meus Ingressos</span>
                    </Link>
                )}
                
                {/* Links pro ORGANIZADOR */}
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

                {/* Links pra PORTARIA / STAFF */}
                {isStaff && (
                    <Link to="/doorman/scanner" className={styles.buttonStaff}>
                    <QrCode size={18} />
                    <span>Scanner Portaria</span>
                    </Link>
                )}


                {/* ÁREA DO USUÁRIO / LOGIN */}
                <div className={styles.userSection}>
                    {isAuthenticated && user ? (
                        <div className={styles.userInfo}>
                            <div className={styles.badge}>
                                <User size={14} />
                                <span>{user.name} ({user.role})</span>
                            </div>

                            <button onClick={handleLogout} className={styles.logoutButton} title="Sair">
                                <LogOut size={18} />
                            </button>
                        </div>
                    ) : (
                        <div className={styles.authButtons}>
                            <Link to="/login" className={styles.loginBtn}>Entrar</Link>
                            <Link to="/register" className={styles.registerBtn}>Criar Conta</Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};
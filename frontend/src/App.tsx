import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/layout/Navbar';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        {/* Renderiza a Navbar no topo */}
        <Navbar />

        {/* Conteúdo temporário de teste */}
        <main style={{ maxWidth: '1200px', margin: '2rem auto', padding: '0 1.5rem', color: '#ffffff' }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>
            Bem-vindo à plataforma <span style={{ color: '#6366f1' }}>TicketOn</span> 🎟️
          </h1>
          <p style={{ color: '#94a3b8' }}>
            Garantindo a diversão em um clique!
          </p>
        </main>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;

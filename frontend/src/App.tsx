import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/layout/Navbar';
import { ProtectedRoute } from './routes/ProtectedRoute';

import { EventList } from './components/pages/EventList';
import { EventDetail } from './components/pages/EventDetail';
import { Login } from './components/pages/Login';
import { MyTickets } from './components/pages/MyTickets';
import { OrganizerDashboard } from './components/pages/organizer/OrganizerDashboard';
import { EventForm } from './components/pages/organizer/EventForm';
import { DoorScanner } from './components/pages/DoorScanner';
import { SharedLink } from './components/pages/SharedLink';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />

        <main style={{ maxWidth: '1200px', margin: '2rem auto', padding: '0 1.5rem' }}>
          <Routes>
            {/* Rotas públicas — qualquer um acessa, logado ou não */}
            <Route path="/" element={<EventList />} />
            <Route path="/eventos/:id" element={<EventDetail />} />
            <Route path="/login" element={<Login />} />
            <Route path="/tickets/share/:shareLink" element={<SharedLink />} />

            {/* Rotas protegidas de CLIENTE */}
            <Route element={<ProtectedRoute allowedRoles={['CUSTOMER']} />}>
              <Route path="/my-tickets" element={<MyTickets />} />
            </Route>

            {/* Rotas protegidas de ORGANIZADOR */}
            <Route element={<ProtectedRoute allowedRoles={['ORGANIZER']} />}>
              <Route path="/organizer/dashboard" element={<OrganizerDashboard />} />
              <Route path="/organizer/events/new" element={<EventForm />} />
            </Route>

            {/* Rota protegida de PORTARIA */}
            <Route element={<ProtectedRoute allowedRoles={['STAFF']} />}>
              <Route path="/doorman/scanner" element={<DoorScanner />} />
            </Route>
          </Routes>
        </main>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
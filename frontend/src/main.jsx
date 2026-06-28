import React, { createContext, useContext, useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { auth } from './services/api';
import LoginPage from './pages/LoginPage';
import PacientesPage from './pages/PacientesPage';
import ViagensPage from './pages/ViagensPage';

const AuthContext = createContext(null);

export function useAuth() {
  return useContext(AuthContext);
}

function AuthProvider({ children }) {
  const [autenticado, setAutenticado] = useState(null);

  useEffect(() => {
    auth.me()
      .then(() => setAutenticado(true))
      .catch(() => setAutenticado(false));
  }, []);

  function login() { setAutenticado(true); }
  function logout() { setAutenticado(false); }

  if (autenticado === null) {
    return <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>Carregando...</div>;
  }

  return (
    <AuthContext.Provider value={{ autenticado, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

function PrivateRoute({ children }) {
  const { autenticado } = useAuth();
  return autenticado ? children : <Navigate to="/login" replace />;
}

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/pacientes"
          element={<PrivateRoute><PacientesPage /></PrivateRoute>}
        />
        <Route
          path="/viagens/*"
          element={<PrivateRoute><ViagensPage /></PrivateRoute>}
        />
        <Route path="/" element={<Navigate to="/viagens" replace />} />
        <Route
          path="/*"
          element={
            <PrivateRoute>
              <PlaceholderPrivate />
            </PrivateRoute>
          }
        />
      </Routes>
    </AuthProvider>
  );
}

function PlaceholderPrivate() {
  return <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>Área privada — rotas serão adicionadas nas próximas fases.</div>;
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);

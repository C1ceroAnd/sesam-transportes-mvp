const express = require('express');
const cors = require('cors');
const session = require('express-session');

if (process.env.NODE_ENV === 'production' && !process.env.SESSION_SECRET) {
  throw new Error('SESSION_SECRET env var is required in production');
}

const authRoutes = require('./api/auth');
const pacientesRoutes = require('./api/pacientes');
const motoristasRoutes = require('./api/motoristas');
const viagensRoutes = require('./api/viagens');
const agendamentosRootRoutes = require('./api/agendamentosRoot');

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));

app.use(express.json());

app.use(session({
  secret: process.env.SESSION_SECRET || 'sesam-dev-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 8 * 60 * 60 * 1000,
  },
}));

app.use('/api/auth', authRoutes);
app.use('/api/pacientes', pacientesRoutes);
app.use('/api/motoristas', motoristasRoutes);
app.use('/api/viagens', viagensRoutes);
app.use('/api/agendamentos', agendamentosRootRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Erro interno do servidor' });
});

module.exports = app;

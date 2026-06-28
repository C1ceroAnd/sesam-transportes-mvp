const express = require('express');
const cors = require('cors');
const session = require('express-session');
const path = require('path');

if (process.env.NODE_ENV === 'production' && !process.env.SESSION_SECRET) {
  throw new Error('SESSION_SECRET env var is required in production');
}

const authRoutes = require('./api/auth');
const pacientesRoutes = require('./api/pacientes');
const motoristasRoutes = require('./api/motoristas');
const viagensRoutes = require('./api/viagens');
const agendamentosRootRoutes = require('./api/agendamentosRoot');

const app = express();

app.set('trust proxy', 1);

app.use(cors({
  origin: true,
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
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 24 * 60 * 60 * 1000,
  },
}));

app.use('/api/auth', authRoutes);
app.use('/api/pacientes', pacientesRoutes);
app.use('/api/motoristas', motoristasRoutes);
app.use('/api/viagens', viagensRoutes);
app.use('/api/agendamentos', agendamentosRootRoutes);

const distPath = path.join(__dirname, '../../frontend/dist');
app.use(express.static(distPath));
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Erro interno do servidor' });
});

module.exports = app;

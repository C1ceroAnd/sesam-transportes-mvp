const express = require('express');
const { requireAuth } = require('../middleware/auth');
const svc = require('../services/viagemService');
const agendamentosRoutes = require('./agendamentos');

const router = express.Router();

router.use(requireAuth);

router.post('/', (req, res) => {
  try {
    const viagem = svc.createViagem(req.body);
    res.status(201).json(viagem);
  } catch (err) {
    res.status(err.code || 500).json({ error: err.message });
  }
});

router.get('/', (req, res) => {
  try {
    const viagens = svc.getViagens(req.query.data);
    res.json(viagens);
  } catch (err) {
    res.status(err.code || 500).json({ error: err.message });
  }
});

router.get('/:id', (req, res) => {
  try {
    const viagem = svc.getViagemById(Number(req.params.id));
    res.json(viagem);
  } catch (err) {
    res.status(err.code || 500).json({ error: err.message });
  }
});

router.put('/:id', (req, res) => {
  try {
    const viagem = svc.updateViagem(Number(req.params.id), req.body);
    res.json(viagem);
  } catch (err) {
    res.status(err.code || 500).json({ error: err.message });
  }
});

// Nested agendamentos: POST /api/viagens/:id/agendamentos
router.use('/:viagem_id/agendamentos', agendamentosRoutes);

module.exports = router;

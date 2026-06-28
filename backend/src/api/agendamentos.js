const express = require('express');
const { requireAuth } = require('../middleware/auth');
const svc = require('../services/agendamentoService');

const router = express.Router({ mergeParams: true });

router.use(requireAuth);

// POST /api/viagens/:viagem_id/agendamentos
router.post('/', (req, res) => {
  try {
    const agendamento = svc.createAgendamento(Number(req.params.viagem_id), req.body);
    res.status(201).json(agendamento);
  } catch (err) {
    res.status(err.code || 500).json({ error: err.message });
  }
});

module.exports = router;

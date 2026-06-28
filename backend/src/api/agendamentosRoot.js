const express = require('express');
const { requireAuth } = require('../middleware/auth');
const svc = require('../services/agendamentoService');

const router = express.Router();

router.use(requireAuth);

// DELETE /api/agendamentos/:id
router.delete('/:id', (req, res) => {
  try {
    svc.cancelAgendamento(Number(req.params.id));
    res.status(204).end();
  } catch (err) {
    res.status(err.code || 500).json({ error: err.message });
  }
});

// PATCH /api/agendamentos/:id/presenca
router.patch('/:id/presenca', (req, res) => {
  try {
    const result = svc.updatePresenca(Number(req.params.id), req.body.status);
    res.json(result);
  } catch (err) {
    res.status(err.code || 500).json({ error: err.message });
  }
});

// PATCH /api/agendamentos/:id/retorno
router.patch('/:id/retorno', (req, res) => {
  try {
    const result = svc.updateRetorno(Number(req.params.id), req.body.status);
    res.json(result);
  } catch (err) {
    res.status(err.code || 500).json({ error: err.message });
  }
});

module.exports = router;

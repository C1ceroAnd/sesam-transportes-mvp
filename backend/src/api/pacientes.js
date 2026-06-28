const express = require('express');
const { requireAuth } = require('../middleware/auth');
const svc = require('../services/pacienteService');
const relatorioSvc = require('../services/relatorioService');

const router = express.Router();

router.use(requireAuth);

router.post('/', (req, res) => {
  try {
    const paciente = svc.createPaciente(req.body);
    res.status(201).json(paciente);
  } catch (err) {
    res.status(err.code || 500).json({ error: err.message });
  }
});

router.get('/', (req, res) => {
  try {
    const pacientes = svc.getPacientes(req.query.q);
    res.json(pacientes);
  } catch (err) {
    res.status(err.code || 500).json({ error: err.message });
  }
});

router.get('/:id', (req, res) => {
  try {
    const paciente = svc.getPacienteById(Number(req.params.id));
    res.json(paciente);
  } catch (err) {
    res.status(err.code || 500).json({ error: err.message });
  }
});

router.put('/:id', (req, res) => {
  try {
    const paciente = svc.updatePaciente(Number(req.params.id), req.body);
    res.json(paciente);
  } catch (err) {
    res.status(err.code || 500).json({ error: err.message });
  }
});

router.put('/:id/acompanhante', (req, res) => {
  try {
    const acompanhante = svc.upsertAcompanhante(Number(req.params.id), req.body);
    res.json(acompanhante);
  } catch (err) {
    res.status(err.code || 500).json({ error: err.message });
  }
});

router.delete('/:id/acompanhante', (req, res) => {
  try {
    svc.deleteAcompanhante(Number(req.params.id));
    res.status(204).end();
  } catch (err) {
    res.status(err.code || 500).json({ error: err.message });
  }
});

router.get('/:id/relatorio', async (req, res) => {
  try {
    const result = await relatorioSvc.generatePDF(Number(req.params.id));
    if (!result) return res.status(204).end();
    const { buffer, nome } = result;
    const data = new Date().toISOString().slice(0, 10);
    const nomeSlug = nome.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    res.set('Content-Type', 'application/pdf');
    res.set('Content-Disposition', `attachment; filename="relatorio-${nomeSlug}-${data}.pdf"`);
    res.send(buffer);
  } catch (err) {
    res.status(err.code || 500).json({ error: err.message });
  }
});

module.exports = router;

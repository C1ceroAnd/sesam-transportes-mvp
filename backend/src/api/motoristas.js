const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { getSugestaoEscala } = require('../services/viagemService');

const router = express.Router();

router.use(requireAuth);

router.get('/', (req, res) => {
  try {
    const data = getSugestaoEscala();
    res.json(data);
  } catch (err) {
    res.status(err.code || 500).json({ error: err.message });
  }
});

module.exports = router;

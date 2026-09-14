const express = require('express');
const { getTasas } = require('./bcv.cjs');

const app = express();
const PORT = 3001;

// Server solo de desarrollo; en producción se usan las funciones de /api
const ALLOWED_ORIGINS = [process.env.ALLOWED_ORIGIN, 'http://localhost:5173'].filter(Boolean);
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (ALLOWED_ORIGINS.includes(origin)) res.setHeader('Access-Control-Allow-Origin', origin);
  next();
});

// GET /api/bcv/tasas
app.get('/api/bcv/tasas', async (req, res) => {
  try {
    const force = req.query.force === '1';
    const data = await getTasas(force);
    res.json(data);
  } catch (err) {
    console.error('[BCV]', err.message);
    res.status(502).json({ error: 'No se pudo conectar con el BCV' });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor BCV corriendo en http://localhost:${PORT}`);
});

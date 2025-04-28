const express = require('express');
const Redis = require('ioredis');
const { nanoid } = require('nanoid');

const app = express();
const redis = new Redis(); // Conexão padrão localhost:6379

app.use(express.json());

// Endpoint para encurtar URL
app.post('/shorten', async (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'URL é obrigatória' });
  }

  const shortCode = nanoid(6); // gera um código curto de 6 caracteres

  await redis.set(shortCode, url);

  res.json({
    shortUrl: `${req.protocol}://${req.get('host')}/${shortCode}`
  });
});

// Endpoint para redirecionar
app.get('/:code', async (req, res) => {
  const { code } = req.params;

  const originalUrl = await redis.get(code);

  if (originalUrl) {
    return res.redirect(originalUrl);
  } else {
    return res.status(404).json({ error: 'URL não encontrada' });
  }
});

// Inicializando servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});

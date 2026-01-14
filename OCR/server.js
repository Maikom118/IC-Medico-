const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

// ===============================
// MEMÓRIA DO ÚLTIMO RG OCR
// ===============================
let ultimoRG = null;

// ===============================
// RECEBE DADOS DO OCR
// ===============================
app.post('/api/rg', (req, res) => {
  ultimoRG = req.body;

  console.log('📥 DADOS RECEBIDOS DO OCR:');
  console.log(ultimoRG);

  res.json({
    status: 'ok',
    mensagem: 'RG recebido com sucesso'
  });
});

// ===============================
// FRONT BUSCA ÚLTIMO RG
// ===============================
app.get('/api/rg/ultimo', (req, res) => {
  if (!ultimoRG) {
    return res.status(404).json({
      status: 'erro',
      mensagem: 'Nenhum RG disponível'
    });
  }

  res.json(ultimoRG);
});

// ===============================
const PORT = 8000;
app.listen(PORT, () => {
  console.log(`🚀 API rodando em http://localhost:${PORT}`);
});

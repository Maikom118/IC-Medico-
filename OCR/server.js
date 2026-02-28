const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { processarOCR } = require('./ocr-limpo');

const app = express();

// Configurar CORS para produção
const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'https://www.iamedbr.com',
  'https://iamedbr.com',
];

app.use(cors({
  origin: function (origin, callback) {
    // Permitir requisições sem origin (por exemplo, mobile apps ou curl)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 500 * 1024 * 1024 // 5MB
  }
});

app.post('/api/ocr', upload.single('image'), async (req, res) => {
  
  // Logs iniciais para ver o que o Multer e o Express receberam
  console.log('🔍 [OCR] Nova requisição recebida');
  console.log('   - Content-Type:', req.headers['content-type']);
  console.log('   - Content-Length:', req.headers['content-length']);
  console.log('   - Tem body parseado?', !!req.body);
  console.log('   - Tem arquivo (req.file)?', !!req.file);
  
  if (req.file) {
    console.log('   Arquivo recebido com sucesso:');
    console.log('     - Nome original:', req.file.originalname);
    console.log('     - Tamanho (bytes):', req.file.size);
    console.log('     - MIME type:', req.file.mimetype);
    console.log('     - Buffer length:', req.file.buffer?.length || 'sem buffer');
  } else {
    console.log('   ❌ Nenhum arquivo detectado pelo multer');
    console.log('   Possíveis causas:');
    console.log('     - Campo enviado com nome diferente de "image"');
    console.log('     - Nenhum arquivo foi anexado na requisição');
    console.log('     - Requisição não é multipart/form-data');
  }

  // Log dos campos normais (se houver outros além do arquivo)
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('   Campos normais recebidos (req.body):', req.body);
  }

  if (!req.file) {
    return res.status(400).json({
      status: 'erro',
      mensagem: 'Imagem não enviada'
    });
  }

  try {
    const resultado = await processarOCR(req.file.buffer);

    res.json(resultado);

  } catch (err) {
    res.status(500).json({
      status: 'erro',
      mensagem: 'Erro ao processar OCR'
    });
  }
});

app.listen(8000, () => {
  console.log('🚀 OCR API rodando em http://localhost:8000');
});

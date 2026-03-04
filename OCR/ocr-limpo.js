const express = require('express');
const cors = require('cors');
const multer = require('multer');
const sharp = require('sharp');
const { createWorker } = require('tesseract.js');

const app = express();

// Configurar multer com limite de tamanho
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 500 * 1024 * 1024 // 500MB
  }
});

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
app.use(express.json());

/* ======================================================
   HEALTH CHECK
====================================================== */
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy', 
    service: 'ocr',
    timestamp: new Date().toISOString()
  });
});

/* ======================================================
   ARMAZENAMENTO DO ÚLTIMO RG
====================================================== */
let ultimoRG = null;

/* ======================================================
   OCR AUXILIAR
====================================================== */
async function executarOCR(worker, buffer) {
  const { data: { text } } = await worker.recognize(buffer);
  return text;
}

/* ======================================================
   PROCESSAMENTO OCR
====================================================== */
async function processarOCR(imagemBuffer) {
  const bufferBase = await sharp(imagemBuffer)
    .rotate()
    .resize({ width: 2500 })
    .grayscale()
    .gamma(2.2)
    .sharpen({ sigma: 1 })
    .toBuffer();

  const bufferRed = await sharp(imagemBuffer)
    .rotate()
    .resize({ width: 2500 })
    .extractChannel('red')
    .linear(2, -50)
    .threshold(140)
    .toBuffer();

  const worker = await createWorker('por');
  await worker.setParameters({ tessedit_pageseg_mode: '3' });

  const rawTextBase = await executarOCR(worker, bufferBase);
  const rawTextRed = await executarOCR(worker, bufferRed);

  await worker.terminate();

  /* ======================================================
     EXTRAÇÃO
  ====================================================== */

  // CPF
  let cpfFinal = null;
  const matchCPF = rawTextBase.match(/\d{3}[\.\s]?\d{3}[\.\s]?\d{3}[-\/\s]?\d{2}/);
  if (matchCPF) {
    const nums = matchCPF[0].replace(/\D/g, '');
    if (nums.length === 11) {
      cpfFinal = nums.replace(
        /(\d{3})(\d{3})(\d{3})(\d{2})/,
        "$1.$2.$3-$4"
      );
    }
  }

  // RG
  const textoRedNorm = rawTextRed
    .toUpperCase()
    .replace(/\|/g, 'I')
    .replace(/O(?=\d)/g, '0');

  const textoBaseNorm = rawTextBase
    .toUpperCase()
    .replace(/\|/g, 'I');

  const matchRGRed = textoRedNorm.match(/\d{1,2}\.\d{3}\.\d{3}-\d/);
  const matchRGBase = textoBaseNorm.match(/\d{1,2}[\.\s]?\d{3}[\.\s]?\d{3}[-\s]?[\dX]/);

  const rgFinal = matchRGRed?.[0] || matchRGBase?.[0] || null;

  // Nome
  let nomeFinal = null;
  const linhas = rawTextBase.split('\n');

  for (let l of linhas) {
    let linha = l.toUpperCase().replace('NOME', '').trim();
    if (linha.includes('REPUBLICA') || linha.includes('IDENTIDADE')) continue;

    if (/^([A-ZÁÉÍÓÚÃÕÇ]{3,}\s+)+[A-ZÁÉÍÓÚÃÕÇ]{3,}$/.test(linha)) {
      nomeFinal = linha;
      break;
    }
  }

  // Data nascimento
  let dataNascimento = null;
  const datas = rawTextBase.match(/\d{2}\/\d{2}\/\d{4}/g) || [];
  if (datas.length) dataNascimento = datas.sort()[0];

  return {
    status: (cpfFinal || rgFinal) ? 'sucesso' : 'erro',
    dados: {
      nome: nomeFinal,
      cpf: cpfFinal,
      rg: rgFinal,
      data_nascimento: dataNascimento
    }
  };
}

/* ======================================================
   POST /api/ocr
====================================================== */
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

    ultimoRG = resultado;
    res.json(resultado);

  } catch (err) {
    console.error(err);
    res.status(500).json({ 
      status: 'erro',
      mensagem: 'Erro ao processar OCR' 
    });
  }
});

/* ======================================================
   GET /api/rg/ultimo
====================================================== */
app.get('/api/rg/ultimo', (req, res) => {
  if (!ultimoRG) {
    return res.status(404).json({ erro: 'Nenhum RG processado ainda' });
  }

  res.json(ultimoRG);
});

/* ======================================================
   START
====================================================== */
const PORT = 8000;
app.listen(PORT, () => {
  console.log(`🚀 API OCR rodando em http://localhost:${PORT}`);
});

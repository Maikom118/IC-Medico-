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
  try {
    console.log('🔄 Iniciando reconhecimento de texto...');
    const { data: { text } } = await worker.recognize(buffer);
    console.log('✅ Texto extraído com sucesso');
    return text;
  } catch (err) {
    console.error('❌ Erro durante OCR:', err.message);
    throw new Error(`Erro ao executar OCR: ${err.message}`);
  }
}

/* ======================================================
   PROCESSAMENTO OCR
====================================================== */
async function processarOCR(imagemBuffer) {
  let worker = null;
  try {
    console.log('📸 Iniciando processamento de imagem...');
    
    const bufferBase = await sharp(imagemBuffer)
      .rotate()
      .resize({ width: 2500 })
      .grayscale()
      .gamma(2.2)
      .sharpen({ sigma: 1 })
      .toBuffer();
    console.log('✅ Imagem base processada');

    const bufferRed = await sharp(imagemBuffer)
      .rotate()
      .resize({ width: 2500 })
      .extractChannel('red')
      .linear(2, -50)
      .threshold(140)
      .toBuffer();
    console.log('✅ Imagem red processada');

    console.log('🤖 Inicializando Tesseract worker...');
    worker = await createWorker('por');
    console.log('✅ Tesseract worker inicializado');
    
    await worker.setParameters({ tessedit_pageseg_mode: '3' });

    const rawTextBase = await executarOCR(worker, bufferBase);
    const rawTextRed = await executarOCR(worker, bufferRed);

    await worker.terminate();
    worker = null;

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
  } catch (err) {
    console.error('❌ Erro no processamento OCR:', err.message);
    // Garantir que o worker seja finalizado em caso de erro
    if (worker) {
      try {
        await worker.terminate();
      } catch (termErr) {
        console.error('⚠️ Erro ao finalizar worker:', termErr.message);
      }
    }
    throw err;
  }

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
    console.log('   ❌ Retornando erro 400 - sem arquivo');
    return res.status(400).json({
      status: 'erro',
      mensagem: 'Imagem não enviada'
    });
  }

  try {
    console.log('⏳ Iniciando processamento OCR...');
    const resultado = await processarOCR(req.file.buffer);

    ultimoRG = resultado;
    console.log('✅ OCR processado com sucesso');
    res.json(resultado);

  } catch (err) {
    console.error('❌ [ERRO] Falha no processamento OCR:', err);
    console.error('   Stack:', err.stack);
    res.status(500).json({ 
      status: 'erro',
      mensagem: 'Erro ao processar OCR',
      detalhes: process.env.NODE_ENV === 'development' ? err.message : undefined

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
const PORT = process.env.PORT || 8000;

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log('\n');
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║                                                            ║');
  console.log('║     🚀 OCR SERVICE - TESSERACT + EXPRESS                   ║');
  console.log('║                                                            ║');
  console.log(`║     Servidor rodando em http://0.0.0.0:${PORT}                        ║`);
  console.log(`║     Ambiente: ${process.env.NODE_ENV || 'development'}                                   ║`);
  console.log('║     Português OCR ativado ✅                              ║');
  console.log('║                                                            ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log('\n');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('📋 SIGTERM recebido, fechando aplicação...');
  server.close(() => {
    console.log('✅ Servidor encerrado com sucesso');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('📋 SIGINT recebido, fechando aplicação...');
  server.close(() => {
    console.log('✅ Servidor encerrado com sucesso');
    process.exit(0);
  });
});

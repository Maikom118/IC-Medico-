const { createWorker } = require('tesseract.js');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const axios = require('axios');


const NOME_ARQUIVO = './OCR/imagens/RGPatrick.png';
const CAMINHO_IMAGEM = path.resolve(NOME_ARQUIVO);

async function executarOCR(worker, buffer) {
  const { data: { text } } = await worker.recognize(buffer);
  return text;
}

async function ocrScannerCorrection() {
  console.log('--- OCR CORRIGIDO: CPF DO CÓDIGO 1 + RG DO CÓDIGO 2 ---\n');

  if (!fs.existsSync(CAMINHO_IMAGEM)) {
    console.error('❌ Arquivo não encontrado.');
    return;
  }

async function enviarParaAPI(dadosRG) {
  try {
    const response = await axios.post(
      'http://localhost:8000/api/rg',
      dadosRG,
      {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 10000
      }
    );

    console.log('📡 Enviado para API com sucesso!');
    console.log('🟢 Resposta da API:', response.data);

  } catch (error) {
    console.error('❌ Erro ao enviar para API');

    console.error('➡️ Mensagem:', error.message);

    if (error.code) {
      console.error('➡️ Código:', error.code);
    }

    if (error.response) {
      console.error('➡️ Status HTTP:', error.response.status);
      console.error('➡️ Dados:', error.response.data);
    } else {
      console.error('➡️ Sem resposta da API (erro de conexão)');
    }
  }
}

  try {
    /* ======================================================
       1. PREPARAÇÃO (MANTENDO O QUE FUNCIONA)
    ======================================================  */
    
    // BASE: Exatamente como no Código 1 (Gamma 2.2)
    // Isso é o que fazia o CPF funcionar (fundo branco, letra preta)
    const bufferBase = await sharp(CAMINHO_IMAGEM)
      .rotate()
      .resize({ width: 2500 })
      .grayscale()
      .gamma(2.2)            
      .sharpen({ sigma: 1 }) 
      .toBuffer();

    // RED: Exatamente como no Código 2
    // Isso é o que faz o RG (número vermelho) funcionar melhor
    const bufferRed = await sharp(CAMINHO_IMAGEM)
      .rotate()
      .resize({ width: 2500 })
      .extractChannel('red') 
      .linear(2, -50)        
      .threshold(140)        
      .toBuffer();

    /* ======================================================
       2. OCR
    ====================================================== */
    
    const worker = await createWorker('por');
    await worker.setParameters({ tessedit_pageseg_mode: '3' });

    console.log('🧠 Lendo Camada Base (CPF/Nome)...');
    // Pegamos o texto CRU, sem limpar nada ainda, igual ao código 1
    const rawTextBase = await executarOCR(worker, bufferBase);

    console.log('🧠 Lendo Camada Vermelha (RG)...');
    const rawTextRed = await executarOCR(worker, bufferRed);

    await worker.terminate();

    /* ======================================================
       3. EXTRAÇÃO DE DADOS
    ====================================================== */
    console.log('⛏️  Minerando dados...');

    // --- A. CPF (LÓGICA RESTAURADA DO CÓDIGO 1) ---
    // Usamos o rawTextBase direto.
    // Regex original: aceita pontos, espaços E BARRAS (\/) que o código 2 ignorava
    const matchCPF = rawTextBase.match(/\d{3}[\.\s]?\d{3}[\.\s]?\d{3}[-\/\s]?\d{2}/);
    
    let cpfFinal = null;
    if (matchCPF) {
        // Limpa tudo que não é número
        const nums = matchCPF[0].replace(/\D/g, '');
        // Valida se tem 11 dígitos
        if (nums.length === 11) {
            cpfFinal = nums.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
        }
    }

    // --- B. RG (LÓGICA DO CÓDIGO 2 - CANAL VERMELHO) ---
    // Normalizamos só aqui para ajudar a achar o RG
    const textoRedNorm = rawTextRed.toUpperCase().replace(/\|/g, 'I').replace(/O(?=\d)/g, '0');
    const textoBaseNorm = rawTextBase.toUpperCase().replace(/\|/g, 'I');

    let rgFinal = null;
    // Prioridade 1: Canal Vermelho (formato perfeito)
    const matchRGRed = textoRedNorm.match(/\d{1,2}[\.]\d{3}[\.]\d{3}[-]\d/);
    
    if (matchRGRed) {
        rgFinal = matchRGRed[0];
    } else {
        // Prioridade 2: Canal Base (Lógica flexível do Codigo 1)
        const matchRGBase = textoBaseNorm.match(/\d{1,2}[\.\s]?\d{3}[\.\s]?\d{3}[-\s]?[\dX]/);
        if (matchRGBase) rgFinal = matchRGBase[0];
    }

    // --- C. NOME (HÍBRIDO) ---
    let nomeFinal = null;
    const linhas = rawTextBase.split('\n'); // Usa o texto base original
    
    for (let l of linhas) {
        // Limpeza básica da linha
        let linha = l.toUpperCase().replace('NOME', '').trim();
        
        // Ignora cabeçalhos
        if (linha.includes("REPUBLICA") || linha.includes("IDENTIDADE") || linha.includes("VALIDA")) continue;
        
        // Regex de Nome: 2+ palavras, só letras, min 3 chars
        if (/^([A-ZÁÉÍÓÚÃÕÇ]{3,}\s+)+[A-ZÁÉÍÓÚÃÕÇ]{3,}$/.test(linha)) {
            nomeFinal = linha;
            break; 
        }
    }

    // --- D. DATA NASCIMENTO ---
    let dataNascimento = null;
    const datas = rawTextBase.match(/\d{2}\/\d{2}\/\d{4}/g) || [];
    if (datas.length > 0) {
        datas.sort((a, b) => {
            const [d1, m1, y1] = a.split('/');
            const [d2, m2, y2] = b.split('/');
            return new Date(`${y1}-${m1}-${d1}`) - new Date(`${y2}-${m2}-${d2}`);
        });
        dataNascimento = datas[0];
    }

    /* ======================================================
       4. RESULTADO
    ====================================================== */
        const resultadoFinal = {
      status: (cpfFinal || rgFinal) ? "sucesso" : "erro",
      dados: {
        nome: nomeFinal,
        cpf: cpfFinal,
        rg: rgFinal,
        data_nascimento: dataNascimento
      }
    };

    console.log('\n✅ JSON FINAL:');
    console.log(JSON.stringify(resultadoFinal, null, 2));

    // 👉 ENVIO PARA API
    if (resultadoFinal.status === "sucesso") {
      await enviarParaAPI(resultadoFinal.dados);
    } else {
      console.log('⚠️ Dados insuficientes, não enviado para API.');
    }
    } catch (erro) {
    console.error('🚨 Erro:', erro);
  }
}

ocrScannerCorrection();

  

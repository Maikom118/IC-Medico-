// ============================================
// CONFIGURAÇÃO DE AMBIENTE - PRODUÇÃO/DESENVOLVIMENTO
// ============================================

const isDevelopment = import.meta.env.DEV;
const isProduction = import.meta.env.PROD;

// URLs de produção (www.iamedbr.com)
const PRODUCTION_CONFIG = {
  BACKEND_URL: 'https://www.iamedbr.com',
  OCR_URL: 'https://www.iamedbr.com/ocr',
  IA_URL: 'https://www.iamedbr.com/ia',
  TRANSCRICAO_URL: 'https://www.iamedbr.com/transcricao',
};

// URLs de desenvolvimento (localhost)
const DEVELOPMENT_CONFIG = {
  BACKEND_URL: 'http://localhost:8100',
  OCR_URL: 'http://localhost:8000',
  IA_URL: 'http://localhost:8200',
  TRANSCRICAO_URL: 'http://localhost:8300',
};

// Seleciona a configuração baseada no ambiente
const config = isProduction ? PRODUCTION_CONFIG : DEVELOPMENT_CONFIG;

// Exporta as URLs
export const API_CONFIG = {
  // Backend API
  BACKEND_URL: import.meta.env.VITE_BACKEND_URL || config.BACKEND_URL,
  
  // Serviços específicos
  OCR_URL: import.meta.env.VITE_OCR_URL || config.OCR_URL,
  IA_URL: import.meta.env.VITE_IA_URL || config.IA_URL,
  TRANSCRICAO_URL: import.meta.env.VITE_TRANSCRICAO_URL || config.TRANSCRICAO_URL,
  
  // Helpers
  isDevelopment,
  isProduction,
  
  // Endpoints completos
  getBackendUrl: (path: string) => `${config.BACKEND_URL}${path}`,
  getOcrUrl: (path: string) => `${config.OCR_URL}${path}`,
  getIaUrl: (path: string) => `${config.IA_URL}${path}`,
  getTranscricaoUrl: (path: string) => `${config.TRANSCRICAO_URL}${path}`,
};

// Log da configuração em desenvolvimento
if (isDevelopment) {
  console.log('🔧 [API CONFIG] Modo DESENVOLVIMENTO');
  console.log('Backend:', API_CONFIG.BACKEND_URL);
  console.log('OCR:', API_CONFIG.OCR_URL);
  console.log('IA:', API_CONFIG.IA_URL);
  console.log('Transcrição:', API_CONFIG.TRANSCRICAO_URL);
}

export default API_CONFIG;

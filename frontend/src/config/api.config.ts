// ============================================
// CONFIGURAÇÃO DE AMBIENTE - PRODUÇÃO/DESENVOLVIMENTO
// ============================================

const isDevelopment = import.meta.env.DEV;
const isProduction = import.meta.env.PROD;

// URLs de produção (www.iamedbr.com)
const PRODUCTION_CONFIG = {
  BASE_URL: 'https://www.iamedbr.com',
  BACKEND_URL: 'https://www.iamedbr.com',
  OCR_BASE: 'http://www.iamedbr.com:8000',  // HTTP only - no SSL on port 8000
};

// URLs de desenvolvimento (localhost)
const DEVELOPMENT_CONFIG = {
  BASE_URL: 'http://localhost:5173', // Frontend
  BACKEND_URL: 'http://localhost:8100',
};

// Seleciona a configuração baseada no ambiente
const config = isProduction ? PRODUCTION_CONFIG : DEVELOPMENT_CONFIG;

// Exporta as URLs
export const API_CONFIG = {
  // Base URL (limpo, sem serviços específicos)
  BASE_URL: import.meta.env.VITE_BASE_URL || config.BASE_URL,
  
  // Backend API
  BACKEND_URL: import.meta.env.VITE_BACKEND_URL || config.BACKEND_URL,
  
  // Helpers para construir URLs de serviços
  isDevelopment,
  isProduction,
  
  // Service endpoints (construídos dinamicamente)
  getBackendUrl: (path: string) => `${config.BACKEND_URL}${path}`,
  getOcrUrl: (path: string) => isProduction && (config as any).OCR_BASE 
    ? `${(config as any).OCR_BASE}${path}` 
    : `http://localhost:8000${path}`,
  getIaUrl: (path: string) => `${config.BASE_URL}/ia${path}`,
  getTranscricaoUrl: (path: string) => `${config.BASE_URL}/transcricao${path}`,
};

// Log da configuração em desenvolvimento
if (isDevelopment) {
  console.log('🔧 [API CONFIG] Modo DESENVOLVIMENTO');
  console.log('Base URL:', API_CONFIG.BASE_URL);
  console.log('Backend:', API_CONFIG.BACKEND_URL);
  console.log('OCR:', API_CONFIG.getOcrUrl('/ocr'));
  console.log('IA:', API_CONFIG.getIaUrl(''));
  console.log('Transcrição:', API_CONFIG.getTranscricaoUrl(''));
}

export default API_CONFIG;

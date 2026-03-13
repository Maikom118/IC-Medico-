// ============================================
// CONFIGURAÇÃO DE AMBIENTE - PRODUÇÃO/DESENVOLVIMENTO
// ============================================

const isDevelopment = import.meta.env.DEV;

// Em produção/homolog, o frontend roda atrás do mesmo host do reverse proxy.
// Usar caminhos relativos evita acoplamento com domínio fixo.
const PRODUCTION_CONFIG = {
  BACKEND_URL: '/api',
  OCR_URL: '',
  IA_URL: '',
  TRANSCRICAO_URL: '',
};

// URLs de desenvolvimento (localhost)
const DEVELOPMENT_CONFIG = {
  BACKEND_URL: 'http://localhost:8100/api',
  OCR_URL: 'http://localhost:8000',
  IA_URL: 'http://localhost:8200',
  TRANSCRICAO_URL: 'http://localhost:8300',
};

// Seleciona a configuração baseada no ambiente
const config = isDevelopment ? DEVELOPMENT_CONFIG : PRODUCTION_CONFIG;

// Mantém suporte a override via VITE_*, inclusive para string vazia.
const envOrDefault = (value: string | undefined, fallback: string) =>
  value !== undefined ? value : fallback;

const resolvedConfig = {
  BACKEND_URL: envOrDefault(import.meta.env.VITE_BACKEND_URL, config.BACKEND_URL),
  OCR_URL: envOrDefault(import.meta.env.VITE_OCR_URL, config.OCR_URL),
  IA_URL: envOrDefault(import.meta.env.VITE_IA_URL, config.IA_URL),
  TRANSCRICAO_URL: envOrDefault(import.meta.env.VITE_TRANSCRICAO_URL, config.TRANSCRICAO_URL),
};

// Exporta as URLs
export const API_CONFIG = {
  // Backend
  BACKEND_URL: resolvedConfig.BACKEND_URL,
  
  // Serviços específicos
  OCR_URL: resolvedConfig.OCR_URL,
  IA_URL: resolvedConfig.IA_URL,
  TRANSCRICAO_URL: resolvedConfig.TRANSCRICAO_URL,
  
  isDevelopment,
  isProduction: !isDevelopment,
  
  // Helpers para endpoints
  getBackendUrl: (path: string) => `${resolvedConfig.BACKEND_URL}${path}`,
  getOcrUrl: (path: string) => `${resolvedConfig.OCR_URL}${path}`,
  getIaUrl: (path: string) => `${resolvedConfig.IA_URL}${path}`,
  getTranscricaoUrl: (path: string) => `${resolvedConfig.TRANSCRICAO_URL}${path}`,
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

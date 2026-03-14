import { API_CONFIG } from '../src/config/api.config';
import { getAuthHeaders } from '../src/utils/auth';

const API_URL = API_CONFIG.BACKEND_URL;

export interface LaudoDashboard {
  id: number;
  paciente_id: number;
  paciente_nome: string | null;
  tipo_laudo_id: number;
  tipo_laudo_nome: string | null;
  status: string;
  criado_em: string;
}

// READ – Todos os laudos (para o dashboard)
export async function listarTodosLaudos(): Promise<LaudoDashboard[]> {
  const response = await fetch(`${API_URL}/laudos/todos`, {
    headers: {
      ...getAuthHeaders(),
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || 'Erro ao buscar laudos');
  }

  return response.json();
}

// PATCH – Atualizar status de um laudo
export async function atualizarStatusLaudo(laudoId: number, status: string): Promise<void> {
  const response = await fetch(`${API_URL}/laudos/paciente/${laudoId}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify({ status }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || 'Erro ao atualizar status do laudo');
  }
}

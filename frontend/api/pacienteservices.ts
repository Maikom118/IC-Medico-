const API_URL = "http://localhost:8100";

// CREATE
export async function criarPaciente(paciente: any) {
  const response = await fetch(`${API_URL}/pacientes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(paciente),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || "Erro ao criar paciente");
  }

  return response.json();
}


// UPDATE
export async function atualizarPaciente(id: string, paciente: any) {
  const response = await fetch(`${API_URL}/pacientes/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(paciente),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || "Erro ao atualizar paciente");
  }

  return response.json();
}


// DELETE
export async function deletarPaciente(id: string) {
  const response = await fetch(`${API_URL}/pacientes/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || "Erro ao deletar paciente");
  }
}

import { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import {
  Menu,
  Users,
  FileText,
  MessageSquare,
  LogOut,
  FileStack,
  UserPlus,
} from "lucide-react";

/*
  DashboardLayout

  Este componente é o layout principal do dashboard.
  Ele define:

  - Sidebar (menu lateral de navegação)
  - Header (topo com usuário e botão de toggle)
  - Área principal onde as páginas são renderizadas (Outlet)

  Todas as rotas filhas do dashboard serão renderizadas dentro do <Outlet />.
*/

export default function DashboardLayout() {
  const navigate = useNavigate();

  // Controla se a sidebar está aberta ou fechada
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen bg-gray-50">

      {/* =========================
          SIDEBAR
         ========================= */}
      <aside
        className={`${isSidebarOpen ? "w-64" : "w-0"}
        bg-blue-600 text-white transition-all duration-300 overflow-hidden relative`}
      >
        <div className="p-6">
          {/* Título do sistema */}
          <h1 className="text-2xl font-bold mb-8">
            MediPlataforma
          </h1>

          {/* Navegação principal */}
          <nav className="space-y-2">

            {/* Cada botão navega para uma rota específica */}
            <NavButton
              icon={<Menu size={20} />}
              text="Dashboard"
              onClick={() => navigate("/dashboard")}
            />

            <NavButton
              icon={<UserPlus size={20} />}
              text="Cadastro"
              onClick={() => navigate("/registration")}
            />

            <NavButton
              icon={<Users size={20} />}
              text="Pacientes"
              onClick={() => navigate("/patients")}
            />

            <NavButton
              icon={<FileText size={20} />}
              text="Laudos"
              onClick={() => navigate("/reports")}
            />

            <NavButton
              icon={<FileStack size={20} />}
              text="Modelos"
              onClick={() => navigate("/templates")}
            />

            <NavButton
              icon={<MessageSquare size={20} />}
              text="IA Assistente"
              onClick={() => navigate("/chat")}
            />

            <NavButton
              icon={<FileText size={20} />}
              text="Gestão de laudo"
              onClick={() => navigate("/gestao-de-laudos")}
            />

          </nav>
        </div>

        {/* Botão fixado na parte inferior da sidebar */}
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-blue-500">
            <LogOut size={20} />
            <span>Sair</span>
          </button>
        </div>
      </aside>

      {/* =========================
          CONTEÚDO PRINCIPAL
         ========================= */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* =========================
            HEADER
           ========================= */}
        <header className="bg-white shadow-sm px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Menu size={24} />
          </button>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium">
                Dr. João Silva
              </p>
              <p className="text-xs text-gray-500">
                Radiologista
              </p>
            </div>
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
              JS
            </div>
          </div>
        </header>

        {/* =========================
            ÁREA DINÂMICA DAS ROTAS
           ========================= */}
        <main className="flex-1 overflow-auto p-6">
          {/*
            O <Outlet /> renderiza o componente
            da rota filha ativa.

            Exemplo:
            /dashboard -> DashboardPage
            /patients -> PatientsPage
          */}
          <Outlet />
        </main>

      </div>
    </div>
  );
}

/*
  NavButton

  Componente reutilizável para os botões da sidebar.
  Recebe:

  - icon: ícone do lucide
  - text: texto do botão
  - onClick: função de navegação

  Isso evita repetição de código na sidebar.
*/
function NavButton({ icon, text, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-blue-500 transition"
    >
      {icon}
      <span>{text}</span>
    </button>
  );
}
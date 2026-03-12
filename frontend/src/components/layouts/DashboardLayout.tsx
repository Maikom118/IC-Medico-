import { useState } from "react";
import { Outlet } from "react-router-dom";
import SideBar from "../Sidebar/index";
import { Menu } from "lucide-react";

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
  // Controla se a sidebar está aberta ou fechada
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const showSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  }


  return (
    <div className="flex h-screen bg-gray-50">

      {/* =========================
          SIDEBAR
         ========================= */}
      <SideBar info={isSidebarOpen} />
      {/* =========================
          CONTEÚDO PRINCIPAL
         ========================= */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* =========================
            HEADER
           ========================= */}
        <header className="bg-white shadow-sm px-6 py-4 flex items-center justify-between">
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

          <button
            onClick={() => showSidebar()}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Menu size={24} />
          </button>
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
import { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import SideBar from "../Sidebar/index";
import { Menu, LogOut } from "lucide-react";
import { clearAuthUser, getAuthUser } from "../../utils/auth";

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
  const user = getAuthUser();
  const isSecretaria = user?.role === "secretaria";
  // Controla se a sidebar está aberta ou fechada
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const showSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };


  const handleLogout = () => {
    clearAuthUser();
    navigate("/");
  };

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
                {user?.name ?? "Usuário"}
              </p>
              <p className="text-xs text-gray-500">
                {isSecretaria ? "Secretária" : "Médico"}
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
          <button
            onClick={handleLogout}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Sair"
          >
            <LogOut size={20} />
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

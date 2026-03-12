import { Link, useLocation } from "react-router-dom";
import {
  Menu,
  Users,
  FileText,
  MessageSquare,
  LogOut,
  FileStack,
  UserPlus,
  ChevronRight,
} from "lucide-react";
import "./index.css";
import { useState, useEffect, useRef } from "react";

type NavItem = {
  icon: React.ReactNode;
  text: string;
  path: string;
};

type Props = {
  info: boolean;
};

const SideBar = ({ info }: Props) => {
  const location = useLocation();
  const sidebarRef = useRef<HTMLDivElement>(null);

  // ===== NAV ITEMS =====
  const navItems: NavItem[] = [
    { icon: <Menu size={20} />, text: "Dashboard", path: "/dashboard" },
    { icon: <UserPlus size={20} />, text: "Cadastro", path: "/registration" },
    { icon: <Users size={20} />, text: "Pacientes", path: "/patients" },
    { icon: <FileText size={20} />, text: "Laudos", path: "/reports" },
    { icon: <FileStack size={20} />, text: "Modelos", path: "/templates" },
    { icon: <MessageSquare size={20} />, text: "IA Assistente", path: "/chat" },
    { icon: <FileText size={20} />, text: "Gestão de laudo", path: "/gestao-de-laudos" },
  ];

  // ===== ESTADOS =====
  const [isOpen, setIsOpen] = useState(info);
  const [visibilityText, setVisibilityText] = useState(info ? "opacity-1" : "opacity");

  // Sincroniza prop info
  useEffect(() => {
    setIsOpen(info);
    setVisibilityText(info ? "opacity-1" : "opacity");
  }, [info]);

  // Toggle sidebar
  const handleSidebar = () => {
    const newState = !isOpen;
    setIsOpen(newState);
    setVisibilityText(newState ? "opacity-1" : "opacity");
  };

  // Fechar sidebar ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setVisibilityText("opacity");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Pega as 2 primeiras letras do nome
  const handleName = (name: string) => name.slice(0, 2);

  // ===== ESTILOS DINÂMICOS =====
  const sidebarStyles = {
    rotateButtonSidebar: isOpen ? "toogle-menu-open" : "toogle-menu-close",
    width: isOpen ? "w-64 transition-all duration-300" : "width-side-bar transition-all duration-300",
    name: isOpen ? "IA MedBR" : handleName("IA MedBR"),
    padding: isOpen ? "padding" : "padding-off",
    buttonExit: isOpen ? "flex" : "flex items-center justify-center",
  };

  return (
    <div id="navigation" className={sidebarStyles.width} ref={sidebarRef}>
      {/* BOTÃO TOGGLE */}
      <button onClick={handleSidebar} className="absolute bg-white button-toggle-sidebar p-1">
        <ChevronRight className={sidebarStyles.rotateButtonSidebar} size={20} />
      </button>

      <aside className={`flex flex-col justify-between bg-blue-600 text-white h-screen w-full overflow-hidden mobile-sidebar ${sidebarStyles.padding}`}>
        {/* LOGO */}
        <div className="logo-empresa">
          <h1 className="text-2xl font-bold nav-menu-sidebar text-center hidden-mobile">{sidebarStyles.name}</h1>
          <h1 className="text-2xl font-bold nav-menu-sidebar text-center hidden-desktop">IA MedBR</h1>
        </div>

        {/* NAVEGAÇÃO */}
        <nav>
          <ul className="flex flex-col gap-4">
            {navItems.map((item, index) => {
              const isActive = location.pathname === item.path;
              return (
                <li key={index}>
                  <Link
                    to={item.path}
                    className={`flex gap-4 p-3 items-center nav-menu-sidebar transition-all duration-300 
                      ${isActive ? "bg-blue-700" : "hover:bg-blue-700"}`}
                  >
                    <div>{item.icon}</div>
                    <div className={visibilityText}>{item.text}</div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* FOOTER */}
        <div className="exit">
          <div className={sidebarStyles.buttonExit}>
            <button style={{ cursor: "pointer" }}>
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
};

export default SideBar;
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
import { useState } from "react";

type NavItem = {
 icon: React.ReactNode;
 text: string;
 path: string;
};

const SideBar = () => {

 const location = useLocation();

 const navItems: NavItem[] = [
  { icon: <Menu size={20} />, text: "Dashboard", path: "/dashboard" },
  { icon: <UserPlus size={20} />, text: "Cadastro", path: "/registration" },
  { icon: <Users size={20} />, text: "Pacientes", path: "/patients" },
  { icon: <FileText size={20} />, text: "Laudos", path: "/reports" },
  { icon: <FileStack size={20} />, text: "Modelos", path: "/templates" },
  { icon: <MessageSquare size={20} />, text: "IA Assistente", path: "/chat" },
  { icon: <FileText size={20} />, text: "Gestão de laudo", path: "/gestao-de-laudos" },
 ];

 const handleName = (name: string) => {
  return name.slice(0, 2);
 };

 const [toggleSidebar, setToggleSidebar] = useState({
    rotateButtonSidebar: "toogle-menu-close",
    width: "width-side-bar transition-all duration-300",
    padding: "p-6",
    opacity: "opacity-0",
    name: handleName("IA MedBR"),
    buttonExit: "flex items-center justify-center",
    open: false
 });

 const handleSidebar = () => {
  if (toggleSidebar.open) {
   setToggleSidebar({
    rotateButtonSidebar: "toogle-menu-close",
    width: "width-side-bar transition-all duration-300",
    padding: "p-6",
    opacity: "opacity-0",
    name: handleName("IA MedBR"),
    buttonExit: "flex items-center justify-center",
    open: false
   });
  } else {
   setToggleSidebar({
    rotateButtonSidebar: "toogle-menu-open",
    width: "w-64 transition-all duration-300",
    padding: "p-6",
    opacity: "opacity-100",
    name: "IA MedBR",
    buttonExit: "flex",
    open: true
   });
  }
 };

 return (
  <div id="navigation" className={toggleSidebar.width}>

   <button
    onClick={handleSidebar}
    className="absolute bg-white button-toggle-sidebar p-1"
   >
    <ChevronRight
     className={toggleSidebar.rotateButtonSidebar}
     size={20}
    />
   </button>

   <aside className={`flex flex-col justify-between ${toggleSidebar.padding} bg-blue-600 text-white h-screen w-full overflow-hidden`}>

    {/* Logo */}
    <div className="logo-empresa">
     <h1 className="text-2xl font-bold nav-menu-sidebar text-center">
      {toggleSidebar.name}
     </h1>
    </div>

    {/* Navegação */}
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

          <div>
           {item.icon}
          </div>

          <div className={toggleSidebar.opacity}>
           {item.text}
          </div>

         </Link>
        </li>
       );
      })}

     </ul>
    </nav>

    {/* Footer */}
    <div className="exit">
     <div className={toggleSidebar.buttonExit}>
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
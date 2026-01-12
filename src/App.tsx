import { useState } from "react";
import { Dashboard } from "./components/Dashboard";
import { PatientList } from "./components/PatientList";
import { ReportEditor } from "./components/ReportEditor";
import { AIChat } from "./components/AIChat";
import { ReportTemplates } from "./components/ReportTemplates";
import { PatientRegistration } from "./components/PatientRegistration";
import {
  Menu,
  Users,
  FileText,
  MessageSquare,
  LogOut,
  FileStack,
  UserPlus,
} from "lucide-react";

export type Patient = {
  id: string;
  name: string;
  age: number;
  gender: string;
  record: string;
  lastVisit: string;
};

export type Report = {
  id: string;
  patientId: string;
  patientName: string;
  date: string;
  type: string;
  content: string;
  images: string[];
};

export type ReportTemplate = {
  id: string;
  name: string;
  category: string;
  content: string;
  createdAt: string;
};

export default function App() {
  const [currentView, setCurrentView] = useState<
      "dashboard" | "patients" | "reports" | "chat" | "templates" | "registration"
  >("dashboard");
  const [selectedPatient, setSelectedPatient] =
    useState<Patient | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [templates, setTemplates] = useState<ReportTemplate[]>([
    {
      id: "1",
      name: "Raio-X de Tórax Normal",
      category: "Raio-X",
      content:
        "INDICAÇÃO CLÍNICA:\n\nTÉCNICA: Radiografia de tórax em incidências PA e perfil.\n\nDESCRIÇÃO:\nPulmões bem expandidos e transparentes.\nÍndice cardiotorácico dentro dos limites da normalidade.\nSeios costofrênicos livres.\nMediastino centrado.\nEstrutura óssea sem alterações.\n\nCONCLUSÃO:\nRadiografia de tórax sem alterações pleuropulmonares.",
      createdAt: "2026-01-01",
    },
    {
      id: "2",
      name: "Tomografia de Abdome",
      category: "Tomografia",
      content:
        "INDICAÇÃO CLÍNICA:\n\nTÉCNICA: Exame realizado em equipamento de tomografia computadorizada helicoidal, com administração de contraste iodado endovenoso.\n\nDESCRIÇÃO:\nFígado de dimensões normais, contornos regulares e densidade preservada.\nVesícula biliar sem alterações.\nPâncreas, baço e adrenais sem particularidades.\nRins tópicos, de dimensões normais, sem sinais de dilatação pielocalicial.\nAlças intestinais sem alterações.\n\nCONCLUSÃO:\nExame dentro dos limites da normalidade.",
      createdAt: "2026-01-01",
    },
  ]);

  const handlePatientSelect = (patient: Patient) => {
    setSelectedPatient(patient);
    setCurrentView("reports");
  };

  const handleAddTemplate = (template: ReportTemplate) => {
    setTemplates([...templates, template]);
  };

  const handleDeleteTemplate = (id: string) => {
    setTemplates(templates.filter((t) => t.id !== id));
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`${
          isSidebarOpen ? "w-64" : "w-0"
        } bg-blue-600 text-white transition-all duration-300 overflow-hidden relative`}
      >
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-8">
            MediPlataforma
          </h1>

          <nav className="space-y-2">
            <button
              onClick={() => setCurrentView("dashboard")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                currentView === "dashboard"
                  ? "bg-blue-700"
                  : "hover:bg-blue-500"
              }`}
            >
              <Menu size={20} />
              <span>Dashboard</span>
            </button>
<button
              onClick={() => {
                setCurrentView("registration");
                //closeSidebarOnMobile();
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                currentView === "registration"
                  ? "bg-blue-700"
                  : "hover:bg-blue-500"
              }`}
            >
              <UserPlus size={20} className="flex-shrink-0" />
              <span>Cadastro</span>
            </button>

            <button
              onClick={() => setCurrentView("patients")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                currentView === "patients"
                  ? "bg-blue-700"
                  : "hover:bg-blue-500"
              }`}

              
            >
              
              <Users size={20} />
              <span>Pacientes</span>
            </button>

            <button
              onClick={() => setCurrentView("reports")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                currentView === "reports"
                  ? "bg-blue-700"
                  : "hover:bg-blue-500"
              }`}
            >
              <FileText size={20} />
              <span>Laudos</span>
            </button>

            <button
              onClick={() => setCurrentView("templates")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                currentView === "templates"
                  ? "bg-blue-700"
                  : "hover:bg-blue-500"
              }`}
            >
              <FileStack size={20} />
              <span>Modelos de Laudos</span>
            </button>

            <button
              onClick={() => setCurrentView("chat")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                currentView === "chat"
                  ? "bg-blue-700"
                  : "hover:bg-blue-500"
              }`}
            >
              <MessageSquare size={20} />
              <span>IA Assistente</span>
            </button>
          </nav>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-6">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-blue-500 transition-colors text-left">
            <LogOut size={20} className="flex-shrink-0" />
            <span className="truncate">Sair</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
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

        {/* Content Area */}
        <main className="flex-1 overflow-auto p-6">
          {currentView === "dashboard" && (
            <Dashboard onNavigate={setCurrentView} />
          )}

 {currentView === "registration" && (
    <PatientRegistration />
  )}

          {currentView === "patients" && (
            <PatientList
              onPatientSelect={handlePatientSelect}
            />
          )}
          {currentView === "reports" && (
            <ReportEditor
              selectedPatient={selectedPatient}
              templates={templates}
            />
          )}
          {currentView === "templates" && (
            <ReportTemplates
              templates={templates}
              onAddTemplate={handleAddTemplate}
              onDeleteTemplate={handleDeleteTemplate}
            />
          )}
          {currentView === "chat" && <AIChat />}
        </main>
      </div>
    </div>
  );
}
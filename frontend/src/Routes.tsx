import { Routes, Route } from "react-router-dom";
import DashboardLayout from "./components/layouts/DashboardLayout";

import Login from "./components/Login";
import { Dashboard } from "./components/Dashboard";
import { PatientList } from "./components/PatientList";
import { ReportEditor } from "./components/ReportEditor";
import { AIChat } from "./components/AIChat";
import { ReportTemplates } from "./components/ReportTemplates";
import { PatientRegistration } from "./components/PatientRegistration";
import QuadroLaudo from "./components/QuadroLaudo";

export default function App() {
  return (
    <Routes>

      {/* 🔐 Rota Pública */}
      <Route path="/" element={<Login />} />



      {/* Leia os arquivo "layouts/DashboardLayout.tsx" */}

      {/* 🔒 Rotas Privadas com Layout */}
      <Route element={<DashboardLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/registration" element={<PatientRegistration />} />
        <Route path="/patients" element={<PatientList />} />
        <Route path="/reports" element={<ReportEditor />} />
        <Route path="/templates" element={<ReportTemplates />} />
        <Route path="/chat" element={<AIChat />} />
        <Route path="/quadrolaudo" element={<QuadroLaudo />} />

      </Route>

    </Routes>
  );
}
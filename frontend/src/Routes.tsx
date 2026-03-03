import { Routes, Route, Navigate } from "react-router-dom";
import DashboardLayout from "./components/layouts/DashboardLayout";

import Login from "./components/Login";
import { Dashboard } from "./components/Dashboard";
import { PatientList } from "./components/PatientList";
import { ReportEditor } from "./components/ReportEditor";
import { AIChat } from "./components/AIChat";
import { ReportTemplates } from "./components/ReportTemplates";
import { PatientRegistration } from "./components/PatientRegistration";
import QuadroLaudo from "./components/QuadroLaudo";
import { getAuthUser } from "./utils/auth";

function RequireAuth({ children }: { children: JSX.Element }) {
  const user = getAuthUser();
  if (!user) return <Navigate to="/" replace />;
  return children;
}

function HomeRedirect() {
  const user = getAuthUser();
  if (!user) return <Login />;
  return user.role === "secretaria"
    ? <Navigate to="/registration" replace />
    : <Navigate to="/dashboard" replace />;
}

function RoleRoute({
  children,
  allow,
}: {
  children: JSX.Element;
  allow: "medico" | "secretaria";
}) {
  const user = getAuthUser();
  if (!user) return <Navigate to="/" replace />;
  if (user.role !== allow) {
    return user.role === "secretaria"
      ? <Navigate to="/registration" replace />
      : <Navigate to="/dashboard" replace />;
  }
  return children;
}

export default function App() {
  return (
    <Routes>

      {/* 🔐 Rota Pública */}
      <Route path="/" element={<HomeRedirect />} />



      {/* Leia os arquivo "layouts/DashboardLayout.tsx" */}

      {/* 🔒 Rotas Privadas com Layout */}
      <Route element={<RequireAuth><DashboardLayout /></RequireAuth>}>
        <Route
          path="/dashboard"
          element={<RoleRoute allow="medico"><Dashboard /></RoleRoute>}
        />
        <Route
          path="/registration"
          element={<RoleRoute allow="secretaria"><PatientRegistration /></RoleRoute>}
        />
        <Route
          path="/patients"
          element={<RoleRoute allow="medico"><PatientList /></RoleRoute>}
        />
        <Route
          path="/reports"
          element={<RoleRoute allow="medico"><ReportEditor /></RoleRoute>}
        />
        <Route
          path="/templates"
          element={<RoleRoute allow="medico"><ReportTemplates /></RoleRoute>}
        />
        <Route
          path="/chat"
          element={<RoleRoute allow="medico"><AIChat /></RoleRoute>}
        />
        <Route
          path="/quadrolaudo"
          element={<RoleRoute allow="medico"><QuadroLaudo /></RoleRoute>}
        />
        <Route path="*" element={<HomeRedirect />} />

      </Route>

    </Routes>
  );
}
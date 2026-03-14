// src/App.jsx
import { useState } from "react";
import { AppProvider, useApp } from "./context/AppContext";
import Sidebar from "./components/layout/Sidebar";
import Header from "./components/layout/Header";

import Dashboard from "./pages/admin/Dashboard";
import Employes from "./pages/admin/Employes";
import Departements from "./pages/admin/Departements";
import Salaires from "./pages/admin/Salaires";
import Conges from "./pages/admin/Conges";
import Presences from "./pages/admin/Presences";
import Promotions from "./pages/admin/Promotions";
import Utilisateurs from "./pages/admin/Utilisateurs";

import DashboardEmploye from "./pages/employe/DashboardEmploye";
import MonSalaire from "./pages/employe/MonSalaire";
import MesConges from "./pages/employe/MesConges";
import MesPresences from "./pages/employe/MesPresences";

import Login from "./pages/Login";


function AppContent() {

  const { currentUser } = useApp();

  const [page, setPage] = useState("dashboard");

  if (!currentUser) return <Login />;

  const isAdmin = currentUser?.role === "ADMIN";

  const pages = isAdmin
    ? {
        dashboard: <Dashboard />,
        employes: <Employes />,
        departements: <Departements />,
        salaires: <Salaires />,
        conges: <Conges />,
        presences: <Presences />,
        promotions: <Promotions />,
        utilisateurs: <Utilisateurs />,
      }
    : {
        "dashboard-employe": <DashboardEmploye />,
        "mon-salaire": <MonSalaire />,
        "mes-conges": <MesConges />,
        "mes-presences": <MesPresences />,
      };

  const defaultPage = isAdmin ? "dashboard" : "dashboard-employe";

  return (

    <div style={{ display: "flex", minHeight: "100vh", background: "#f0f4f8" }}>

      <Sidebar page={page} setPage={setPage} />

      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>

        <Header page={page} />

        <main style={{ flex: 1, padding: "24px", overflowY: "auto" }}>
          {pages[page] || pages[defaultPage]}
        </main>

      </div>

    </div>

  );

}

export default function App() {

  return (

    <AppProvider>
      <AppContent />
    </AppProvider>

  );

}
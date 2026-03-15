import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
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



function Layout({ children }) {

  return (

    <div style={{ display: "flex", minHeight: "100vh", background: "#f0f4f8" }}>

      <Sidebar />

      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>

        <Header />

        <main style={{ flex: 1, padding: "24px", overflowY: "auto" }}>
          {children}
        </main>

      </div>

    </div>

  );

}



function AppRoutes() {

  const { currentUser } = useApp();

  if (!currentUser) {
    return <Login />;
  }

  const isAdmin = currentUser.role === "ADMIN";

  return (

    <Routes>

      {/* ADMIN ROUTES */}

      {isAdmin && (
        <>
          <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
          <Route path="/employees" element={<Layout><Employes /></Layout>} />
          <Route path="/departments" element={<Layout><Departements /></Layout>} />
          <Route path="/salaries" element={<Layout><Salaires /></Layout>} />
          <Route path="/leaves" element={<Layout><Conges /></Layout>} />
          <Route path="/attendance" element={<Layout><Presences /></Layout>} />
          <Route path="/promotions" element={<Layout><Promotions /></Layout>} />
          <Route path="/users" element={<Layout><Utilisateurs /></Layout>} />
        </>
      )}

      {/* EMPLOYEE ROUTES */}

      {!isAdmin && (
        <>
          <Route path="/dashboard" element={<Layout><DashboardEmploye /></Layout>} />
          <Route path="/my-salary" element={<Layout><MonSalaire /></Layout>} />
          <Route path="/my-leaves" element={<Layout><MesConges /></Layout>} />
          <Route path="/my-attendance" element={<Layout><MesPresences /></Layout>} />
        </>
      )}

      {/* DEFAULT */}

      <Route path="*" element={<Navigate to="/dashboard" />} />

    </Routes>

  );

}



export default function App() {

  return (

    <AppProvider>

      <BrowserRouter>

        <AppRoutes />

      </BrowserRouter>

    </AppProvider>

  );

}
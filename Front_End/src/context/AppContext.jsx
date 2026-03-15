import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AppContext = createContext();

export const useApp = () => useContext(AppContext);

export const AppProvider = ({ children }) => {

  const API = "http://127.0.0.1:8000/api";

  const [token, setToken] = useState(localStorage.getItem("token"));
  const [currentUser, setCurrentUser] = useState(null);

  const [employes, setEmployes] = useState([]);
  const [departements, setDepartements] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [conges, setConges] = useState([]);
  const [presences, setPresences] = useState([]);
  const [salaires, setSalaires] = useState([]);

  const [loading, setLoading] = useState(true);

  // =============================
  // AXIOS
  // =============================

  const api = axios.create({
    baseURL: API
  });

  api.interceptors.request.use((config) => {

    const savedToken = localStorage.getItem("token");

    if (savedToken) {
      config.headers.Authorization = `Token ${savedToken}`;
    }

    return config;

  });

  // =============================
  // LOGIN
  // =============================

  const login = async (email, password) => {

    try {

      const res = await axios.post(`${API}/users/login/`, {
        email: email.trim(),
        password: password
      });

      const data = res.data;

      localStorage.setItem("token", data.token);

      setToken(data.token);

      setCurrentUser({
        id: data.id,
        email: data.email,username: data.username,
        role: data.role
      });

      await loadData();

      return true;

    } catch (error) {

      console.error("Erreur login :", error);
      return false;

    }

  };

  // =============================
  // LOGOUT
  // =============================

  const logout = () => {

    localStorage.removeItem("token");
    setToken(null);
    setCurrentUser(null);

  };

  // =============================
  // LOAD DATA
  // =============================

  const loadData = async () => {

    try {

      const [
        employeesRes,
        departmentsRes,
        promotionsRes,
        leavesRes,
        attendanceRes,
        salariesRes
      ] = await Promise.all([

        api.get("/employees/"),
        api.get("/departments/"),
        api.get("/promotions/"),
        api.get("/leaves/"),
        api.get("/attendance/"),
        api.get("/salaries/")

      ]);

      setEmployes(employeesRes.data.results || employeesRes.data);
      setDepartements(departmentsRes.data.results || departmentsRes.data);
      setPromotions(promotionsRes.data.results || promotionsRes.data);
      setConges(leavesRes.data.results || leavesRes.data);
      setPresences(attendanceRes.data.results || attendanceRes.data);
      setSalaires(salariesRes.data.results || salariesRes.data);

    } catch (error) {

      console.error("Erreur chargement données :", error);

    }

  };

  // =============================
  // EMPLOYEES
  // =============================

  const addEmploye = async (data) => {

    const res = await api.post("/employees/", data);

    setEmployes(prev => [...prev, res.data]);

  };

  const updateEmploye = async (id, data) => {

    const res = await api.put(`/employees/${id}/`, data);

    setEmployes(prev =>
      prev.map(e => (e.id === id ? res.data : e))
    );

  };

  const deleteEmploye = async (id) => {

    await api.delete(`/employees/${id}/`);

    await loadData();

  };

  // =============================
  // DEPARTEMENTS
  // =============================

  const addDepartement = async (data) => {

    const res = await api.post("/departments/", data);

    setDepartements(prev => [...prev, res.data]);

  };

  const deleteDepartement = async (id) => {

    await api.delete(`/departments/${id}/`);

    setDepartements(prev =>
      prev.filter(d => d.id !== id)
    );

  };

  // =============================
  // PROMOTIONS
  // =============================

  const addPromotion = async (data) => {

    const res = await api.post("/promotions/", data);

    setPromotions(prev => [...prev, res.data]);

  };

  const deletePromotion = async (id) => {

    await api.delete(`/promotions/${id}/`);

    setPromotions(prev =>
      prev.filter(p => p.id !== id)
    );

  };

  // =============================
  // SALAIRES
  // =============================

  const addSalaire = async (data) => {

    const res = await api.post("/salaries/", data);

    setSalaires(prev => [...prev, res.data]);

  };

  const deleteSalaire = async (id) => {

    await api.delete(`/salaries/${id}/`);

    setSalaires(prev =>
      prev.filter(s => s.id !== id)
    );

  };

  // =============================
  // CONGES
  // =============================

  const addConge = async (data) => {

    const res = await api.post("/leaves/", data);

    setConges(prev => [...prev, res.data]);

  };

  const updateCongeStatus = async (id, status) => {

    const res = await api.patch(`/leaves/${id}/`, {
      status: status
    });

    setConges(prev =>
      prev.map(c => (c.id === id ? res.data : c))
    );

  };

  // =============================
  // PRESENCES
  // =============================

  const checkIn = async () => {

  try {

    const res = await api.post("/attendance/check-in/");

    setPresences(prev => [...prev, res.data]);

  } catch (error) {

    console.error("Erreur check-in:", error);

  }

};

const checkOut = async () => {

  try {

    const res = await api.post("/attendance/check-out/");

    setPresences(prev =>
      prev.map(p =>
        p.id === res.data.id ? res.data : p
      )
    );

  } catch (error) {

    console.error("Erreur check-out:", error);

  }

};

  // =============================
  // INIT
  // =============================

  useEffect(() => {

  const initAuth = async () => {

    const savedToken = localStorage.getItem("token");

    if (savedToken) {

      setToken(savedToken);

      try {

        const res = await api.get("/users/me/");

        setCurrentUser(res.data);

        await loadData();

      } catch (error) {

        console.error("Token invalide");

        localStorage.removeItem("token");
        setToken(null);
      }

    }

    setLoading(false);

  };

  initAuth();

}, []);
  const value = {

    currentUser,
    token,

    login,
    logout,

    employes,
    departements,
    promotions,
    conges,
    presences,
    salaires,

    addEmploye,
    updateEmploye,
    deleteEmploye,

    addDepartement,
    deleteDepartement,

    addPromotion,
    deletePromotion,

    addSalaire,
    deleteSalaire,

    addConge,
    updateCongeStatus,

    checkIn,
    checkOut

  };

  if (loading) return null;

  return (

    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>

  );

};
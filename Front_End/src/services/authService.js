// src/services/authService.js
import api from "./api";

export const authService = {

  login: async (email, password) => {
    const response = await api.post("/users/login/", {
      email,
      password,
    });

    return response.data;
  },

  logout: async () => {
    localStorage.removeItem("token");
  },

  getCurrentUser: async () => {
    const response = await api.get("/users/me/");
    return response.data;
  }

};
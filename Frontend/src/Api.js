import axios from "axios";

export const API = axios.create({
  baseURL: "http://localhost:5001/api/auth",  // ✅ correct baseURL
  headers: {
    "Content-Type": "application/json"
  },
  withCredentials: true
});

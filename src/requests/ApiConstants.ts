import axios from "axios";

export const lxBackendUrl = import.meta.env.VITE_LX_BACKEND ?? "http://localhost:8000";

export const csBackend = axios.create({
    baseURL: lxBackendUrl
});

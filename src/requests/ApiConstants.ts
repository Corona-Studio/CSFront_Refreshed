import axios from "axios";

export const lxBackendUrl = import.meta.env.VITE_LX_BACKEND ?? "https://api.corona.studio";

export const csBackend = axios.create({
    baseURL: lxBackendUrl
});

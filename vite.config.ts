import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";
import { patchCssModules } from "vite-css-modules";

// https://vite.dev/config/
export default defineConfig({
    plugins: [patchCssModules(), react(), tailwindcss()]
});

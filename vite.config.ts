import { compress } from "@mongodb-js/zstd";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";
import { patchCssModules } from "vite-css-modules";
import { compression } from "vite-plugin-compression2";

// https://vite.dev/config/
export default defineConfig({
    plugins: [
        patchCssModules(),
        react(),
        tailwindcss(),
        compression<{ level: number }>({
            algorithm(buf, opt) {
                return compress(buf as never, opt.level);
            },
            compressionOptions: {
                level: 9
            },
            filename: "[path][base].zst",
            deleteOriginalAssets: true
        })
    ]
});

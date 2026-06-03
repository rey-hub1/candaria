import { defineConfig } from "vite";
import laravel from "laravel-vite-plugin";
import react from "@vitejs/plugin-react";

export default defineConfig({
    plugins: [
        laravel({
            input: "resources/js/app.jsx",
            refresh: true,
        }),
        react(),
    ],
    // TAMBAHKAN CONFIG INI 👇
    server: {
        host: "0.0.0.0", // Biar Vite bisa diakses dari jaringan luar
        hmr: {
            host: "localhost", // Tetap arahkan Hot Module Replacement ke localhost kamu
        },
    },
});

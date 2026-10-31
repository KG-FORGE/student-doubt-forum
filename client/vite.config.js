import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    proxy: {
      // Forward all /api/* requests to the Express backend.
      // The browser sees these as same-origin (localhost:5173), so:
      //   - No CORS preflight needed in development
      //   - HttpOnly cookies work without SameSite=None
      "/api": {
        target: "http://localhost:5001",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});

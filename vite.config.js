import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base:"ButtonOpenStandaloneV1/",
  server: {
    port: 5173,
    open: true
  }
});

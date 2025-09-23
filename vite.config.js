import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Use "/" in dev to avoid base-path refresh issues.
// For production builds under a subfolder, override VITE_BASE at build time.
const base = process.env.VITE_BASE || "/";

export default defineConfig({
  plugins: [react()],
  base,
  server: {
    port: 5173,
    open: false
  },
});

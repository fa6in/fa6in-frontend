// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'

// // https://vite.dev/config/
// export default defineConfig({
//   plugins: [react()],
//   // server : {
//   //   port:5000,
//   //   host : '192.168.0.133'
//   // }
// })


import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "http://159.223.114.190/",
        changeOrigin: true,
        secure: false,
      },
      "/media": {
        target: "http://159.223.114.190/",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});

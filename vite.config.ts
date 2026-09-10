import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import { defineConfig, Plugin } from 'vite';

// LINT.IfChange(aistudio_media_plugin)
function aistudioMediaPlugin(): Plugin {
  return {
    name: 'aistudio-media-plugin',
    configureServer(server) {
      server.middlewares.use('/media', (req, res, next) => {
        const filePath = path.join(__dirname, 'media', req.url || '');
        if (fs.existsSync(filePath)) {
          res.end(fs.readFileSync(filePath));
        } else {
          next();
        }
      });
    },
  };
}
// LINT.ThenChange()

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), aistudioMediaPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    // No base needed for Vercel — served from root
    build: {
      outDir: 'dist',
    },
  };
});

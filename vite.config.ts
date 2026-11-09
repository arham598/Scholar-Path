import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import express from 'express';
import { defineConfig, Plugin } from 'vite';
import { evaluateEligibilityWithGemini, generateApplicationDraftWithGemini } from './server/geminiService';

function apiPlugin(): Plugin {
  return {
    name: 'scholarpath-api-plugin',
    configureServer(server) {
      server.middlewares.use(express.json());

      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/api/')) {
          return next();
        }

        res.setHeader('Content-Type', 'application/json');

        try {
          if (req.url === '/api/health') {
            res.statusCode = 200;
            res.end(JSON.stringify({ status: 'ok', service: 'ScholarPath API' }));
            return;
          }

          if (req.url === '/api/gemini/evaluate-eligibility' && req.method === 'POST') {
            const body = (req as any).body || {};
            const evaluation = await evaluateEligibilityWithGemini(body.studentProfile, body.scholarship);
            res.statusCode = 200;
            res.end(JSON.stringify(evaluation));
            return;
          }

          if (req.url === '/api/gemini/generate-draft' && req.method === 'POST') {
            const body = (req as any).body || {};
            const draft = await generateApplicationDraftWithGemini(body);
            res.statusCode = 200;
            res.end(JSON.stringify(draft));
            return;
          }

          res.statusCode = 404;
          res.end(JSON.stringify({ error: 'Endpoint not found' }));
        } catch (err: any) {
          console.error('API Error:', err);
          res.statusCode = 500;
          res.end(JSON.stringify({ error: err.message || 'Internal server error' }));
        }
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), apiPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});

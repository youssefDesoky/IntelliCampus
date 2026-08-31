import { defineConfig } from 'vite'
import mkcert from 'vite-plugin-mkcert'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'
import fs from 'fs'

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  plugins: [
    {
      name: 'dev-sw',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url !== '/sw.js' && !req.url.startsWith('/sw.js?')) {
            return next();
          }
          try {
            const pushContent = fs.readFileSync(path.resolve(__dirname, 'src/sw/push.js'), 'utf-8');
            const swContent = fs.readFileSync(path.resolve(__dirname, 'src/sw/sw.js'), 'utf-8');
            const devSW = pushContent + '\n\n' + swContent
              .replace("import { precacheAndRoute } from 'workbox-precaching';", '')
              .replace("import './push.js';", '')
              .replace("precacheAndRoute(self.__WB_MANIFEST);", '// dev mode - no precaching')
              + '\n\n// Minimal fetch handler so the browser treats this as an installable PWA\nself.addEventListener("fetch", (event) => { event.respondWith(fetch(event.request)); });\n';
            res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
            res.setHeader('Service-Worker-Allowed', '/');
            res.end(devSW);
          } catch (err) {
            console.error('[dev-sw] Failed to serve SW:', err);
            next();
          }
        });
      },
    },
    mkcert(),
    tailwindcss(),
    VitePWA({
      registerType: 'prompt',
      strategies: 'injectManifest',
      srcDir: 'src/sw',
      filename: 'sw.js',
      injectRegister: null,
      injectManifest: {
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
      },
      devOptions: { enabled: true, type: 'module' },
      manifest: {
        name: 'IntelliCampus',
        short_name: 'IntelliCampus',
        description: 'University platform for courses, grades, attendance, and campus life',
        theme_color: '#3b82f6',
        background_color: '#f5f7fa',
        display: 'standalone',
        start_url: '/',
        scope: '/',
        icons: [
          { src: 'pwa-64x64.png', sizes: '64x64', type: 'image/png' },
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: 'maskable-icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        runtimeCaching: [
          {
            urlPattern: /^\/hubs\//,
            handler: 'NetworkOnly',
          },
          {
            urlPattern: /^\/api\/auth\//,
            handler: 'NetworkOnly',
          },
          {
            urlPattern: /^\/api\/devices\//,
            handler: 'NetworkOnly',
          },
          {
            urlPattern: /^\/api\/(chat|messages|friends|groups)\//,
            handler: 'NetworkOnly',
          },
          {
            urlPattern: /^\/api\//,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 5 * 60,
              },
              networkTimeoutSeconds: 3,
            },
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'image-cache',
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 30 * 24 * 60 * 60,
              },
            },
          },
        ],
      },
    }),
  ],
  server: {
    host: '0.0.0.0',
    port: 5173,
    https: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5122',
        changeOrigin: true,
        secure: false,
      },
      '/materials': {
        target: 'http://localhost:5122',
        changeOrigin: true,
        secure: false,
      },
      '/uploads': {
        target: 'http://localhost:5122',
        changeOrigin: true,
        secure: false,
      },
      '/announcements': {
        target: 'http://localhost:5122',
        changeOrigin: true,
        secure: false,
      },
      '/images': {
        target: 'http://localhost:5122',
        changeOrigin: true,
        secure: false,
      },
      '/hubs': {
        target: 'http://localhost:5122',
        changeOrigin: true,
        secure: false,
        ws: true,
      },
    },
  },
  preview: {
    host: '0.0.0.0',
    port: 4173,
    https: true,
  }
})

import path from 'path';
import { defineConfig } from 'vite';

const rawPort = process.env.PORT;

if (!rawPort) {
  throw new Error(
    'PORT environment variable is required but was not provided.',
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

const basePath = process.env.BASE_PATH;

if (!basePath) {
  throw new Error(
    'BASE_PATH environment variable is required but was not provided.',
  );
}

const root = path.resolve(import.meta.dirname);

// This is a static, framework-free multi-page site (pure HTML/CSS/vanilla JS).
// Every .html file in the project root is registered as its own Rollup entry
// so `vite build` emits each page instead of a single bundled index.
const htmlEntries = [
  'index.html',
  'shop.html',
  'product.html',
  'men.html',
  'women.html',
  'shoes.html',
  'accessories.html',
  'about.html',
  'contact.html',
  'cart.html',
  'wishlist.html',
  'login.html',
  'register.html',
  'checkout.html',
  '404.html',
];

export default defineConfig({
  base: basePath,
  plugins: [
    ...(process.env.NODE_ENV !== 'production' &&
    process.env.REPL_ID !== undefined
      ? [
          await import('@replit/vite-plugin-cartographer').then((m) =>
            m.cartographer({
              root: path.resolve(import.meta.dirname, '..'),
            }),
          ),
          await import('@replit/vite-plugin-dev-banner').then((m) =>
            m.devBanner(),
          ),
        ]
      : []),
  ],
  root,
  build: {
    outDir: path.resolve(import.meta.dirname, 'dist/public'),
    emptyOutDir: true,
    rollupOptions: {
      input: Object.fromEntries(
        htmlEntries.map((file) => [
          file.replace(/\.html$/, ''),
          path.resolve(root, file),
        ]),
      ),
    },
  },
  server: {
    port,
    strictPort: true,
    host: '0.0.0.0',
    allowedHosts: true,
    fs: {
      strict: true,
    },
  },
  preview: {
    port,
    host: '0.0.0.0',
    allowedHosts: true,
  },
});

import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig, loadEnv } from "vite"; // Import loadEnv
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig(({ mode }) => { // Accept mode parameter
  // Load environment variables from .env file
  // The third parameter '' loads all env variables, regardless of VITE_ prefix
  const env = loadEnv(mode, process.cwd(), '');

  return {
    server: {
      proxy: {
        '/.well-known': {
          target: 'http://localhost:5173',
          bypass: () => null
        }
      }
    },
    build: {
      // Output client assets to dist/client
      outDir: 'dist/client',
      // Ensure sourcemaps are generated for debugging (optional but recommended)
      sourcemap: true,
    },
    plugins: [
      remix({
        // Explicitly set the server build directory
        serverBuildDirectory: "dist/server",
        // Specify the server build entry point path
        serverBuildPath: "dist/server/index.js",
        // Enable future flags
        future: {
          v3_fetcherPersist: true,
          v3_relativeSplatPath: true,
          v3_throwAbortReason: true,
          // Add other flags mentioned in warnings if necessary
          // v3_lazyRouteDiscovery: true, // Optional: Enable if needed later
          // v3_singleFetch: true,       // Optional: Enable if needed later
        },
      }),
      tsconfigPaths(),
    ],
    define: {
      // Define process.env variables for client-side and server-side build
      // This ensures that process.env.SUPABASE_URL and process.env.SUPABASE_ANON_KEY
      // are replaced with their actual values during the build process for both client and server,
      // preventing ReferenceError: process is not defined and ensuring values are available for SSR.
      'process.env.SUPABASE_URL': JSON.stringify(env.SUPABASE_URL),
      'process.env.SUPABASE_ANON_KEY': JSON.stringify(env.SUPABASE_ANON_KEY),
      // Also define the service role key for server-side use if needed,
      // though it's generally better to access this directly via process.env on the server
      // if the environment is properly set up. But for consistency and to avoid issues,
      // defining it here ensures it's injected.
      'process.env.SUPABASE_SERVICE_ROLE_KEY': JSON.stringify(env.SUPABASE_SERVICE_ROLE_KEY),
    },
  };
});

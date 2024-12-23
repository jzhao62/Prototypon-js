import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import VitePluginWatcher from 'vite-plugin-watcher';

export default defineConfig({
  plugins: [
    react(),
    tsconfigPaths(),
    VitePluginWatcher({
      watch: ['../packages/foo/src/**/*', '../packages/components/src/**/*'],
      onChange: () => {
        console.log('Workspace package updated, rebuilding...');
        // Trigger a rebuild or any other action
      },
    }),
  ],
});

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import monacoEditorPlugin from 'vite-plugin-monaco-editor';

export default defineConfig({
  plugins: [
    react(),
    monacoEditorPlugin({
      languageWorkers: ['editorWorkerService', 'json', 'typescript'], // 移除 'markdown'
      publicPath: 'monaco-editor'
    })
  ],
  server: {
    port: 5173
  }
});
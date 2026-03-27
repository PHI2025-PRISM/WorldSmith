// src/vite-env.d.ts (或 src/types/global.d.ts)
/// <reference types="vite/client" />

declare module '*.css';

export {};

declare global {
  interface Window {
    api: {
      ping: () => Promise<string>;
      saveFile: (data: any) => Promise<string>; // 保留兼容（如果仍有使用）
      saveProject: (params: { folderPath: string; projectData: any }) => Promise<{ success: boolean; filePath?: string; error?: string }>;
      loadProject: (folderPath: string) => Promise<{ success: boolean; projectData?: any; error?: string }>;
      openFolderDialog: () => Promise<string | null>;
    };
  }
}
const { contextBridge, ipcRenderer } = require('electron');

console.log('🧩 preload 加载了');

contextBridge.exposeInMainWorld('api', {
  ping: () => ipcRenderer.invoke('ping'),

  // 保存整个项目
  saveProject: (projectData) => ipcRenderer.invoke('save-project', projectData),

  // 加载项目（传入文件夹路径）
  loadProject: (folderPath) => ipcRenderer.invoke('load-project', folderPath),

  // 打开文件夹选择对话框
  openFolderDialog: () => ipcRenderer.invoke('open-folder-dialog')
});
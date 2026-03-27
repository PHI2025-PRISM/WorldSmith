console.log('main.ts 已执行');

const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

console.log('📂 __dirname:', __dirname);
console.log('📂 preload 路径:', path.join(__dirname, 'preload.js'));

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  win.loadURL('http://localhost:5173');
}

// IPC：打开文件夹对话框
ipcMain.handle('open-folder-dialog', async (event: any) => {
  try {
    const mainWindow = BrowserWindow.getFocusedWindow();
    const result = await dialog.showOpenDialog({
      properties: ['openDirectory']
    });
    
    // 对话框关闭后，恢复主窗口焦点
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.focus();
      mainWindow.webContents.focus();
    }
    
    if (!result.canceled && result.filePaths.length > 0) {
      return result.filePaths[0];
    }
    return null;
  } catch (error) {
    console.error('打开文件夹对话框失败', error);
    return null;
  }
});


// IPC：保存项目
ipcMain.handle('save-project', async (event: any, { folderPath, projectData }: any) => {
  try {
    if (!folderPath) {
      throw new Error('未指定文件夹路径');
    }
    
    // 创建 nodes 目录
    const nodesDir = path.join(folderPath, 'nodes');
    fs.mkdirSync(folderPath, { recursive: true });
    fs.mkdirSync(nodesDir, { recursive: true });
    
    // 为每个节点保存单独的文件
    const nodeReferences: any[] = [];
    for (const node of projectData.nodes) {
      const fileExtension = node.fileExtension || '.txt';
      const filename = `node-${node.id}${fileExtension}`;
      const filePath = path.join(nodesDir, filename);
      
      // 保存节点内容到文件
      fs.writeFileSync(filePath, node.content, 'utf-8');
      
      // 计算文件大小
      const stats = fs.statSync(filePath);
      const fileSize = stats.size;
      
      // 记录节点元数据（不包含完整内容）
      nodeReferences.push({
        id: node.id,
        type: node.type,
        filename: filename,
        fileExtension: fileExtension,
        createdAt: node.createdAt,
        updatedAt: node.updatedAt,
        modifyCount: node.modifyCount,
        fileSize: fileSize
      });
    }
    
    // 保存 project.json（仅包含元数据和引用）
    const projectMetadata = {
      nodes: nodeReferences,
      selectedId: projectData.selectedId
    };
    const projectFilePath = path.join(folderPath, 'project.json');
    fs.writeFileSync(projectFilePath, JSON.stringify(projectMetadata, null, 2), 'utf-8');
    
    return { success: true, filePath: projectFilePath };
  } catch (error) {
    console.error('保存项目失败', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return { success: false, error: errorMessage };
  }
});


// IPC：加载项目
ipcMain.handle('load-project', async (event: any, folderPath: string) => {
  try {
    const projectFilePath = path.join(folderPath, 'project.json');
    if (!fs.existsSync(projectFilePath)) {
      return { success: true, projectData: { nodes: [], selectedId: null } };
    }
    
    // 读取 project.json
    const content = fs.readFileSync(projectFilePath, 'utf-8');
    const projectMetadata = JSON.parse(content);
    
    // 从各个文件中读取节点内容
    const nodes: any[] = [];
    const nodesDir = path.join(folderPath, 'nodes');
    for (const ref of projectMetadata.nodes) {
      const filePath = path.join(nodesDir, ref.filename);
      if (fs.existsSync(filePath)) {
        const nodeContent = fs.readFileSync(filePath, 'utf-8');
        nodes.push({
          id: ref.id,
          type: ref.type,
          content: nodeContent,
          fileExtension: ref.fileExtension,
          createdAt: ref.createdAt,
          updatedAt: ref.updatedAt,
          modifyCount: ref.modifyCount,
          fileSize: ref.fileSize
        });
      }
    }
    
    const projectData = {
      nodes: nodes,
      selectedId: projectMetadata.selectedId
    };
    return { success: true, projectData };
  } catch (error) {
    console.error('加载项目失败', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return { success: false, error: errorMessage };
  }
});

// 生命周期
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
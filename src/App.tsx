import { useState, useEffect, useRef } from 'react';
import { Save, FilePlus, FolderOpen } from 'lucide-react';
import { useStore } from './store';
import Explorer from './components/Explorer';
import Editor, { EditorRef } from './components/Editor';
import Inspector from './components/Inspector';
import NewNodeModal from './components/NewNodeModal';

export default function App() {
  const { nodes, selectedId, addNode, loadProject } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);
  const editorRef = useRef<EditorRef>(null);

  // 当选中节点变化时，强制激活编辑器（三层策略）
  useEffect(() => {
    if (!selectedId || !editorRef.current) return;
    
    const activateEditor = () => {
      const editor = editorRef.current;
      if (editor) {
        editor.focus();
      }
    };
    
    // 立即激活
    activateEditor();
    
    // requestAnimationFrame 激活
    requestAnimationFrame(() => activateEditor());
    
    // 延迟激活
    const t1 = setTimeout(activateEditor, 50);
    const t2 = setTimeout(activateEditor, 150);
    
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [selectedId]);

  // 保存当前项目
  const handleSave = async () => {
    try {
      let folderPath = currentFolder;
      
      // 如果没有打开文件夹，弹出选择对话框
      if (!folderPath) {
        folderPath = await window.api.openFolderDialog();
        if (!folderPath) return;
        setCurrentFolder(folderPath);
      }
      
      const projectData = { nodes, selectedId };
      const result = await window.api.saveProject({ folderPath, projectData });
      if (result.success) {
        alert(`✅ 已保存到 ${result.filePath}`);
      } else {
        alert(`保存失败: ${result.error}`);
      }
    } catch (error) {
      console.error('保存失败', error);
      alert('保存失败，请查看控制台');
    }
  };

  // 打开文件夹并加载项目
  const handleOpen = async () => {
    try {
      const folderPath = await window.api.openFolderDialog();
      if (!folderPath) return;

      const result = await window.api.loadProject(folderPath);
      if (result.success) {
        const { nodes: loadedNodes, selectedId: loadedSelectedId } = result.projectData;
        loadProject(loadedNodes || [], loadedSelectedId || null);
        setCurrentFolder(folderPath);
        alert(`已打开项目: ${folderPath}`);
        // 加载完成后，延迟一下确保编辑器挂载后再聚焦
        setTimeout(() => editorRef.current?.focus(), 150);
      } else {
        alert(`加载项目失败: ${result.error}`);
      }
    } catch (error) {
      console.error('打开文件夹失败', error);
      alert('打开文件夹失败，请查看控制台');
    }
  };

  const handleNew = () => {
    setIsModalOpen(true);
  };

  const handleCreateNode = (type: any, content: string, language?: string | null, fileExtension?: string) => {
    addNode(type, content, language || undefined, fileExtension);
    setIsModalOpen(false);
    // 新建节点后，新节点会被自动选中（store 中 addNode 已设置 selectedId 为新节点）
    // useEffect 会在 selectedId 变化时自动聚焦编辑器，这里无需额外操作
  };

  // 模态框关闭时，强制激活编辑器（三层策略）
  const handleModalClose = () => {
    setIsModalOpen(false);
    
    const activateEditor = () => {
      if (!editorRef.current) return;
      editorRef.current.focus();
    };
    
    // 立即激活
    activateEditor();
    
    // requestAnimationFrame 激活
    requestAnimationFrame(() => activateEditor());
    
    // 延迟激活
    setTimeout(activateEditor, 50);
    setTimeout(activateEditor, 150);
  };

  return (
    <div className="flex flex-col h-screen bg-[#1e1e1e] text-[#cccccc]">
      {/* 标题栏 */}
      <div className="flex items-center px-4 py-2 bg-[#3c3c3c] border-b border-[#2d2d2d] gap-2">
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-3 py-1.5 rounded hover:bg-[#2d2d2d] transition-colors"
          title="保存当前内容"
        >
          <Save size={16} />
          <span>保存</span>
        </button>
        <button
          onClick={handleNew}
          className="flex items-center gap-2 px-3 py-1.5 rounded hover:bg-[#2d2d2d] transition-colors"
          title="新建节点"
        >
          <FilePlus size={16} />
          <span>新建</span>
        </button>
        <button
          onClick={handleOpen}
          className="flex items-center gap-2 px-3 py-1.5 rounded hover:bg-[#2d2d2d] transition-colors"
          title="打开文件夹"
        >
          <FolderOpen size={16} />
          <span>打开</span>
        </button>
        {currentFolder && (
          <div className="ml-auto text-xs text-[#cccccc] truncate max-w-md">
            {currentFolder}
          </div>
        )}
      </div>

      {/* 主体 */}
      <div className="flex flex-1 overflow-hidden">
        <Explorer />
        <Editor ref={editorRef} />
        <Inspector />
      </div>

      {/* 模态框 */}
      <NewNodeModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onConfirm={handleCreateNode}
      />
    </div>
  );
}
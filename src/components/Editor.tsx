import { forwardRef, useImperativeHandle, useRef, useEffect } from 'react';
import * as React from 'react';
import MonacoEditor from '@monaco-editor/react';
import { useStore } from '../store';

export interface EditorRef {
  focus: () => void;
}

const Editor = forwardRef<EditorRef>((props, ref) => {
  const { nodes, selectedId, selectedLanguage, setLanguage, update } = useStore();
  const node = nodes.find((n) => n.id === selectedId);
  const editorRef = useRef<any>(null);

  useImperativeHandle(ref, () => ({
    focus: () => {
      if (!editorRef.current) return;
      
      // 强制激活编辑器
      const container = editorRef.current.getContainerDomNode();
      if (container) container.focus();
      
      editorRef.current.focus();
      editorRef.current.setPosition({ lineNumber: 1, column: 1 });
    }
  }));
  
  // 当 selectedId 变化时，强制激活编辑器（使用升级的激活策略）
  React.useEffect(() => {
    if (!selectedId || !editorRef.current) return;
    
    const activateEditor = () => {
      const editor = editorRef.current;
      if (!editor) return;
      
      const container = editor.getContainerDomNode();
      if (container) container.focus();
      editor.focus();
      editor.setPosition({ lineNumber: 1, column: 1 });
    };
    
    // 立即激活
    activateEditor();
    
    // 使用 requestAnimationFrame
    requestAnimationFrame(() => activateEditor());
    
    // 多个延迟激活
    const timeout1 = setTimeout(activateEditor, 50);
    const timeout2 = setTimeout(activateEditor, 150);
    const timeout3 = setTimeout(activateEditor, 300);
    
    return () => {
      clearTimeout(timeout1);
      clearTimeout(timeout2);
      clearTimeout(timeout3);
    };
  }, [selectedId]);

  if (!node) {
    return (
      <div className="flex-1 flex items-center justify-center text-[#6a6a6a]">
        未选择任何节点
      </div>
    );
  }

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      update(node.id, value);
    }
  };

  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor;
    
    // 三层激活策略：DOM + Monaco API + 多次延迟
    const _forceFocus = () => {
      // 层级 1：立即激活（DOM 级别）
      const editorContainer = editor.getContainerDomNode();
      if (editorContainer) {
        editorContainer.focus();
      }
      editor.focus();
      
      // 层级 2：设置光标位置
      editor.setPosition({ lineNumber: 1, column: 1 });
      
      // 层级 3：启用推荐和其他功能
      editor.updateOptions({
        readOnly: false,
        domReadOnly: false,
        glyphMarginClassName: '',
      });
    };
    
    // 第一次激活：立即执行
    _forceFocus();
    
    // 第二次激活：使用 requestAnimationFrame（浏览器重绘后）
    requestAnimationFrame(() => {
      _forceFocus();
    });
    
    // 第三次激活：50ms 后
    setTimeout(() => {
      _forceFocus();
    }, 50);
    
    // 第四次激活：150ms 后
    setTimeout(() => {
      _forceFocus();
    }, 150);
    
    // 第五次激活：300ms 后
    setTimeout(() => {
      _forceFocus();
    }, 300);
  };

  const getLanguage = (type: string, fileExtension?: string) => {
    // 优先级 1：根据 fileExtension 推断
    if (fileExtension) {
      switch (fileExtension) {
        case '.md': return 'markdown';
        case '.json': return 'json';
        case '.txt':
        default: return 'plaintext';
      }
    }
    
    // 优先级 2：用户指定的语言
    if (selectedLanguage && selectedLanguage !== 'plaintext') {
      return selectedLanguage;
    }
    
    // 优先级 3：根据 nodeType 推断（兼容旧节点）
    switch (type) {
      case 'character': return 'plaintext';
      case 'event': return 'markdown';
      case 'location': return 'json';
      default: return 'plaintext';
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-[#1e1e1e]">
      <div className="px-4 py-2 text-sm border-b border-[#2d2d2d] bg-[#252526]">
        <span className="text-[#cccccc]">
          编辑 {node.type}: {node.content}
        </span>
      </div>
      <MonacoEditor
        key={`editor-${selectedId}`}
        height="100%"
        language={getLanguage(node.type, node.fileExtension)}
        theme="vs-dark"
        value={node.content}
        onChange={handleEditorChange}
        onMount={handleEditorDidMount}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          wordWrap: 'on',
          scrollBeyondLastLine: false,
          automaticLayout: true,
          readOnly: false,
          domReadOnly: false,
          autoIndent: 'keep',
        }}
      />
    </div>
  );
});

export default Editor;
import { useState } from 'react';
import { X, User, Calendar, MapPin } from 'lucide-react';
import { NodeType } from '../store';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (type: NodeType, content: string, language?: string | null, fileExtension?: string) => void;
}

const typeOptions: { value: NodeType; label: string; icon: any }[] = [
  { value: 'character', label: '角色', icon: User },
  { value: 'event', label: '事件', icon: Calendar },
  { value: 'location', label: '地点', icon: MapPin },
];

const languageOptions = [
  'Markdown', 'Plain Text', 'JSON'
];

export default function NewNodeModal({ isOpen, onClose, onConfirm }: Props) {
  const [selectedType, setSelectedType] = useState<NodeType>('character');
  const [content, setContent] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);

  if (!isOpen) return null;

  const getFileExtension = (language: string | null) => {
    switch (language?.toLowerCase()) {
      case 'markdown': return '.md';
      case 'json': return '.json';
      case 'plain text':
      default: return '.txt';
    }
  };

  const handleConfirm = () => {
    if (content.trim()) {
      const fileExtension = getFileExtension(selectedLanguage);
      onConfirm(selectedType, content.trim(), selectedLanguage, fileExtension);
      // 清空表单（可选）
      setSelectedType('character');
      setContent('');
      setSelectedLanguage(null);
    } else {
      alert('请输入内容');
    }
  };

  const handleClose = () => {
    onClose();
    // 可选清空表单
    setSelectedType('character');
    setContent('');
    setSelectedLanguage(null);
  };

  const handleBackgroundClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // 背景点击时，仅阻止事件冒泡，不关闭模态框（保持焦点陷阱）
    if (e.target === e.currentTarget) {
      e.preventDefault();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // 按 Esc 键关闭模态框
    if (e.key === 'Escape') {
      e.preventDefault();
      handleClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={handleBackgroundClick}
      onKeyDown={handleKeyDown}
      role="presentation"
      tabIndex={-1}
    >
      <div className="bg-[#2d2d2d] rounded-lg shadow-xl w-96">
        {/* 头部 */}
        <div className="flex justify-between items-center px-4 py-3 border-b border-[#3c3c3c]">
          <h3 className="text-sm font-semibold">新建节点</h3>
          <button
            onClick={handleClose}
            className="text-[#cccccc] hover:text-white transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* 内容 */}
        <div className="p-4 space-y-4">
          {/* 类型选择 */}
          <div>
            <label className="block text-xs font-medium mb-2">类型</label>
            <div className="flex gap-3">
              {typeOptions.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  onClick={() => setSelectedType(value)}
                  className={`
                    flex-1 flex items-center justify-center gap-2 py-2 rounded
                    transition-colors
                    ${
                      selectedType === value
                        ? 'bg-[#0e639c] text-white'
                        : 'bg-[#3c3c3c] text-[#cccccc] hover:bg-[#4e4e4e]'
                    }
                  `}
                >
                  <Icon size={14} />
                  <span className="text-sm">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 语言选择 */}
          <div>
            <label className="block text-xs font-medium mb-2">语言类型</label>
            <select
              value={selectedLanguage || ''}
              onChange={(e) => setSelectedLanguage(e.target.value || null)}
              className="w-full bg-[#1e1e1e] border border-[#3c3c3c] rounded px-3 py-2 text-sm focus:outline-none focus:border-[#0e639c] transition-colors text-[#cccccc]"
            >
              <option value="">自动检测</option>
              {languageOptions.map((lang) => (
                <option key={lang} value={lang.toLowerCase()}>
                  {lang}
                </option>
              ))}
            </select>
          </div>

          {/* 内容输入 */}
          <div>
            <label className="block text-xs font-medium mb-2">内容</label>
            <textarea
              className="w-full bg-[#1e1e1e] border border-[#3c3c3c] rounded px-3 py-2 text-sm focus:outline-none focus:border-[#0e639c] transition-colors"
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="输入节点内容..."
              autoFocus
            />
          </div>
        </div>

        {/* 底部按钮 */}
        <div className="flex justify-end gap-2 px-4 py-3 border-t border-[#3c3c3c]">
          <button
            onClick={handleClose}
            className="px-3 py-1.5 text-sm rounded hover:bg-[#3c3c3c] transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleConfirm}
            className="px-3 py-1.5 text-sm bg-[#0e639c] text-white rounded hover:bg-[#1177bb] transition-colors"
          >
            创建
          </button>
        </div>
      </div>
    </div>
  );
}
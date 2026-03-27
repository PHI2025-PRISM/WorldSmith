import { Info, Hash, Type, Calendar, User, MapPin, FileText, Clock, Edit3, HardDrive } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useStore } from '../store';

const typeLabels = {
  character: { label: '角色', icon: User },
  event: { label: '事件', icon: Calendar },
  location: { label: '地点', icon: MapPin },
};

export default function Inspector() {
  const { nodes, selectedId } = useStore();
  const node = nodes.find((n) => n.id === selectedId);

  if (!node) {
    return (
      <div className="w-64 bg-[#252526] border-l border-[#2d2d2d] flex items-center justify-center text-[#6a6a6a]">
        未选中节点
      </div>
    );
  }

  const typeInfo = typeLabels[node.type] || { label: '未知', icon: Info };
  const TypeIcon = typeInfo.icon;

  const formatDateTime = (timestamp?: number) => {
    if (!timestamp) return '-';
    return new Date(timestamp).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '-';
    if (bytes < 1024) return bytes + 'B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + 'KB';
    return (bytes / (1024 * 1024)).toFixed(1) + 'MB';
  };

  // 根据文件类型渲染内容预览
  const renderPreview = () => {
    if (!node) return null;
    
    const preview = node.content.substring(0, 200);
    const summary = preview + (node.content.length > 200 ? '...' : '');
    
    switch (node.fileExtension) {
      case '.md':
        return (
          <div>
            <ReactMarkdown 
              components={{
                h1: ({node, ...props}) => <div className="text-sm font-bold text-[#cccccc] mb-1" {...props} />,
                h2: ({node, ...props}) => <div className="text-xs font-bold text-[#cccccc] mb-1" {...props} />,
                h3: ({node, ...props}) => <div className="text-xs font-semibold text-[#cccccc] mb-1" {...props} />,
                p: ({node, ...props}) => <div className="text-xs text-[#cccccc] leading-relaxed mb-1" {...props} />,
                strong: ({node, ...props}) => <strong className="font-bold text-[#e0e0e0]" {...props} />,
                em: ({node, ...props}) => <em className="italic text-[#b0b0b0]" {...props} />,
                ul: ({node, ...props}) => <ul className="list-disc list-inside text-xs text-[#cccccc] space-y-0.5 mb-1" {...props} />,
                ol: ({node, ...props}) => <ol className="list-decimal list-inside text-xs text-[#cccccc] space-y-0.5 mb-1" {...props} />,
                li: ({node, ...props}) => <li className="text-xs text-[#cccccc]" {...props} />,
                code: ({node, ...props}) => <code className="bg-[#1e1e1e] px-1 rounded text-[#d4d4d4] text-xs" {...props} />,
                blockquote: ({node, ...props}) => <blockquote className="border-l-2 border-[#3c3c3c] pl-2 text-[#6a6a6a] text-xs italic mb-1" {...props} />,
              }}
            >
              {summary}
            </ReactMarkdown>
          </div>
        );
      
      case '.json':
        try {
          const parsed = JSON.parse(node.content);
          const formatted = JSON.stringify(parsed, null, 2);
          return (
            <div className="text-xs text-[#cccccc] font-mono whitespace-pre-wrap word-break">
              {formatted.substring(0, 200)}
              {formatted.length > 200 ? '...' : ''}
            </div>
          );
        } catch {
          // 如果JSON无效，显示原文本
          return <div className="text-xs text-[#cccccc]">{summary}</div>;
        }
      
      case '.txt':
      default:
        return <div className="text-xs text-[#cccccc] whitespace-pre-wrap break-words">{summary}</div>;
    }
  };

  return (
    <div className="w-64 bg-[#252526] border-l border-[#2d2d2d] overflow-y-auto">
      <div className="p-2 text-xs font-semibold uppercase tracking-wider text-[#cccccc] border-b border-[#2d2d2d]">
        属性 & 时间线
      </div>
      <div className="p-3 space-y-4">
        {/* 基本信息 */}
        <div>
          <div className="text-xs font-semibold text-[#cccccc] mb-2 uppercase">基本信息</div>
          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-2">
              <FileText size={12} className="text-[#6a6a6a]" />
              <span className="text-[#cccccc]">文件: {node.fileExtension || '-'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Type size={12} className="text-[#6a6a6a]" />
              <span className="text-[#cccccc]">类型: {typeInfo.label}</span>
            </div>
            {node.fileSize && (
              <div className="flex items-center gap-2">
                <HardDrive size={12} className="text-[#6a6a6a]" />
                <span className="text-[#cccccc]">大小: {formatFileSize(node.fileSize)}</span>
              </div>
            )}
          </div>
        </div>

        {/* 时间线信息 */}
        <div className="border-t border-[#3c3c3c] pt-3">
          <div className="text-xs font-semibold text-[#cccccc] mb-2 uppercase">时间线</div>
          <div className="space-y-2 text-xs">
            <div className="flex items-start gap-2">
              <Calendar size={12} className="text-[#6a6a6a] mt-0.5" />
              <div className="flex-1">
                <div className="text-[#998844]">创建</div>
                <div className="text-[#cccccc]">{formatDateTime(node.createdAt)}</div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Clock size={12} className="text-[#6a6a6a] mt-0.5" />
              <div className="flex-1">
                <div className="text-[#998844]">最后修改</div>
                <div className="text-[#cccccc]">{formatDateTime(node.updatedAt)}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Edit3 size={12} className="text-[#6a6a6a]" />
              <div className="flex-1">
                <span className="text-[#998844]">修改次数: </span>
                <span className="text-[#cccccc]">{node.modifyCount || 0}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 内容预览 */}
        <div className="border-t border-[#3c3c3c] pt-3">
          <div className="text-xs font-semibold text-[#cccccc] mb-2 uppercase">内容预览</div>
          <div className="bg-[#1e1e1e] p-2 rounded text-xs text-[#cccccc] max-h-32 overflow-auto border border-[#3c3c3c]">
            {renderPreview()}
          </div>
        </div>
      </div>
    </div>
  );
}
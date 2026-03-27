import { User, Calendar, MapPin, FileText } from 'lucide-react';
import { useStore } from '../store';

const typeIcons = {
  character: User,
  event: Calendar,
  location: MapPin,
};

export default function Explorer() {
  const { nodes, selectedId, select } = useStore();

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes < 1024) return bytes + 'B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + 'KB';
    return (bytes / (1024 * 1024)).toFixed(1) + 'MB';
  };

  const formatTime = (timestamp?: number) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="w-64 bg-[#252526] border-r border-[#2d2d2d] overflow-y-auto">
      <div className="p-2 text-xs font-semibold uppercase tracking-wider text-[#cccccc] border-b border-[#2d2d2d]">
        世界观节点
      </div>
      <div className="py-1">
        {nodes.map((node) => {
          const Icon = typeIcons[node.type] || FileText;
          const isSelected = node.id === selectedId;
          return (
            <div
              key={node.id}
              onClick={() => select(node.id)}
              className={`
                px-4 py-3 cursor-pointer transition-colors border-b border-[#3c3c3c]
                ${isSelected ? 'bg-[#2d2d2d]' : 'hover:bg-[#2d2d2d]'}
              `}
            >
              <div className="flex items-center gap-2">
                <Icon size={14} className="text-[#cccccc] flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="truncate text-xs text-[#cccccc] font-medium">{node.content.substring(0, 30)}</div>
                  <div className="flex gap-2 text-[10px] text-[#998844] mt-0.5">
                    <span>{node.fileExtension}</span>
                    {node.fileSize && <span>{formatFileSize(node.fileSize)}</span>}
                    {node.updatedAt && <span>{formatTime(node.updatedAt)}</span>}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
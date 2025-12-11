import type { MemoryRecord } from '../../types';
import { MapPin, Tag, Trash2, Calendar, Search, Archive } from 'lucide-react';

interface MemoryListProps {
  memories: MemoryRecord[];
  onDelete: (id: string) => void;
}

const MemoryList = ({ memories, onDelete }: MemoryListProps) => {
  const formatDate = (timestamp?: number) => {
    if (!timestamp) return '';
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    });
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex-shrink-0 p-6 pb-4 border-b border-sand/50 bg-white/40 backdrop-blur-md sticky top-0 z-10 flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-warm-grey">The Vault</h2>
          <p className="text-sm text-warm-grey/60">
            {memories.length} {memories.length === 1 ? 'memory' : 'memories'} saved
          </p>
        </div>
        <div className="h-10 w-10 rounded-full bg-sand flex items-center justify-center text-sage">
          <Search className="w-5 h-5" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 custom-scrollbar">
        {memories.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-warm-grey/40 space-y-4 opacity-60">
            <div className="w-16 h-16 rounded-full bg-sand flex items-center justify-center">
              <Archive className="w-8 h-8" />
            </div>
            <p className="text-lg italic">The vault is empty.</p>
          </div>
        ) : (
          memories.map((memory) => (
            <div key={memory.id} className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-all border border-sand group">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-bold text-sage line-clamp-1">{memory.title}</h3>
                <span className="shrink-0 px-2 py-0.5 bg-sand/50 rounded-md text-warm-grey/70 text-[10px] font-bold uppercase tracking-wide">
                  {memory.category}
                </span>
              </div>

              <div className="flex items-center space-x-2 text-xs text-warm-grey/50 mb-3">
                <Calendar className="w-3 h-3" />
                <span>{formatDate(memory.timestamp)}</span>
              </div>

              <p className="text-warm-grey leading-relaxed text-sm mb-4 line-clamp-3">"{memory.memory_text}"</p>

              <div className="flex items-center justify-between pt-3 border-t border-sand/30">
                <div className="flex items-center space-x-3 overflow-hidden">
                  {memory.location && (
                    <div className="flex items-center space-x-1 text-rust font-medium text-xs shrink-0">
                      <MapPin className="w-3 h-3" />
                      <span className="truncate max-w-[100px]">{memory.location}</span>
                    </div>
                  )}
                  {memory.tags.length > 0 && (
                    <div className="flex items-center space-x-1 text-warm-grey/60 text-xs shrink-0">
                      <Tag className="w-3 h-3" />
                      <span className="truncate max-w-[150px]">{memory.tags.join(', ')}</span>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (memory.id) onDelete(memory.id);
                  }}
                  className="p-1.5 text-warm-grey/30 hover:text-rust hover:bg-rust/10 rounded-lg transition-colors"
                  title="Delete Memory"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MemoryList;

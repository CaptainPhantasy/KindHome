import { useEffect, useState } from 'react';
import MemoryInputWidget from '../components/MemoryInputWidget';
import MemoryList from '../components/MemoryList';
import type { MemoryRecord } from '../../types';

const MemoryVaultPage = () => {
  const [memories, setMemories] = useState<MemoryRecord[]>([]);

  // Load memories from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('kind_home_memories');
    if (saved) {
      try {
        setMemories(JSON.parse(saved));
      } catch (error) {
        console.error('Failed to parse memories', error);
      }
    }
  }, []);

  const handleSaveMemory = (newMemory: MemoryRecord) => {
    const memoryWithMeta: MemoryRecord = {
      ...newMemory,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
    };

    const updatedMemories = [memoryWithMeta, ...memories];
    setMemories(updatedMemories);
    localStorage.setItem('kind_home_memories', JSON.stringify(updatedMemories));
  };

  const handleDeleteMemory = (id: string) => {
    const updatedMemories = memories.filter((memory) => memory.id !== id);
    setMemories(updatedMemories);
    localStorage.setItem('kind_home_memories', JSON.stringify(updatedMemories));
  };

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden font-sans">
      <header className="flex-shrink-0 px-8 py-6 flex items-baseline justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary tracking-tight">Kind Home</h1>
          <p className="text-foreground/60 text-sm mt-1">Memory Vault</p>
        </div>
        <div className="text-xs text-foreground/40 hidden md:block">Protected by Memory Vault Technology™</div>
      </header>

      <main className="flex-1 overflow-hidden p-6 pt-0 pb-6 max-w-[1600px] w-full mx-auto">
        <div className="h-full grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 h-full flex flex-col">
            <MemoryInputWidget onSave={handleSaveMemory} />
          </div>

          <section className="lg:col-span-7 h-full min-h-0 bg-card rounded-3xl shadow-sm border border-border flex flex-col overflow-hidden relative animate-fade-in">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/20 via-primary/40 to-primary/20" />
            <div className="flex-1 overflow-hidden">
              <MemoryList memories={memories} onDelete={handleDeleteMemory} />
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default MemoryVaultPage;

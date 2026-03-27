import { create } from 'zustand';

export type NodeType = 'character' | 'event' | 'location';

export interface Node {
  id: string;
  type: NodeType;
  content: string;
  fileExtension?: string;
  createdAt?: number;
  updatedAt?: number;
  modifyCount?: number;
  fileSize?: number;
}

interface Store {
  nodes: Node[];
  selectedId: string | null;
  selectedLanguage: string | null;
  select: (id: string) => void;
  update: (id: string, content: string) => void;
  addNode: (type: NodeType, content: string, language?: string, fileExtension?: string) => void;
  setLanguage: (language: string | null) => void;
  loadProject: (nodes: Node[], selectedId: string | null) => void; // 新增
}

export const useStore = create<Store>((set) => ({
  nodes: [
    { id: '1', type: 'character', content: 'Main Hero' },
    { id: '2', type: 'event', content: 'World War' }
  ],
  selectedId: null,
  selectedLanguage: null,
  select: (id) => set({ selectedId: id }),
  update: (id, content) =>
    set((state) => ({
      nodes: state.nodes.map((n) => {
        if (n.id === id) {
          return {
            ...n,
            content,
            updatedAt: Date.now(),
            modifyCount: (n.modifyCount || 0) + 1
          };
        }
        return n;
      })
    })),
  addNode: (type, content, language, fileExtension) =>
    set((state) => {
      const newId = crypto.randomUUID();
      const now = Date.now();
      const newNode: Node = {
        id: newId,
        type,
        content,
        fileExtension: fileExtension || '.txt',
        createdAt: now,
        updatedAt: now,
        modifyCount: 0
      };
      return {
        nodes: [...state.nodes, newNode],
        selectedId: newId,
        selectedLanguage: language || null
      };
    }),
  setLanguage: (language) => set({ selectedLanguage: language }),
  loadProject: (nodes, selectedId) =>
    set({
      nodes,
      selectedId
    })
}));

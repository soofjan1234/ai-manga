"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
} from "react";

// 类型定义
export interface Character {
  id: string;
  name: string;
  description: string;
  imageUrl?: string;
}

export interface Episode {
  id: string;
  outline: string;
  images: string[];
  timestamp: number;
  status: "generating" | "complete" | "error";
}

export interface StoryState {
  background: string;
  style: string;
  characters: Character[];
  episodes: Episode[];
  suggestions: string[]; // AI 生成的剧情建议选项
  isFinished: boolean; // 是否已完结
}

interface StoryContextType {
  state: StoryState;
  isHydrated: boolean;
  // 背景设定
  setBackground: (background: string) => void;
  setStyle: (style: string) => void;
  // 角色管理
  addCharacter: (character: Character) => void;
  updateCharacter: (id: string, character: Partial<Character>) => void;
  removeCharacter: (id: string) => void;
  setCharacters: (characters: Character[]) => void;
  // 漫画管理
  addEpisode: (episode: Episode) => void;
  updateEpisode: (id: string, episode: Partial<Episode>) => void;
  forkEpisode: (id: string, newOutline: string) => void;
  removeEpisode: (id: string) => void;
  setEpisodes: (episodes: Episode[]) => void;
  // 剧情建议管理
  setSuggestions: (suggestions: string[]) => void;
  clearSuggestions: () => void;
  // 完结管理
  setFinished: (finished: boolean) => void;
  // 重置
  resetStory: () => void;
}

const STORAGE_KEY = "ai-manga-story-state";

const initialState: StoryState = {
  background: "",
  style: "",
  characters: [],
  episodes: [],
  suggestions: [],
  isFinished: false,
};

const StoryContext = createContext<StoryContextType | undefined>(undefined);

import { saveStateToDB, loadStateFromDB } from "./db";

// ... (imports)

// ...

export function StoryProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<StoryState>(initialState);
  const [isHydrated, setIsHydrated] = useState(false);

  // 初始化：从 IndexedDB 加载
  useEffect(() => {
    const loadState = async () => {
      // 优先尝试从 IndexedDB 加载
      const saved = await loadStateFromDB(STORAGE_KEY);

      // 如果 DB 没数据，尝试从 localStorage 迁移（兼容旧数据）
      // ... (可选，或者直接忽略旧数据，视需求而定。为了稳妥，我们可以检查 localStorage)

      if (saved) {
        setState({ ...initialState, ...saved });
      } else {
        // 尝试从 localStorage 恢复一次（迁移逻辑）
        const localSaved = localStorage.getItem(STORAGE_KEY);
        if (localSaved) {
          try {
            const parsed = JSON.parse(localSaved);
            setState({ ...initialState, ...parsed });
            // 迁移后清除 localStorage，防止占用
            localStorage.removeItem(STORAGE_KEY);
          } catch (e) { console.error(e) }
        }
      }
      setIsHydrated(true);
    };

    loadState();
  }, []);

  // 持久化：当状态改变时保存到 IndexedDB
  useEffect(() => {
    if (isHydrated) {
      // 使用防抖或简单的异步保存，不阻塞 UI
      saveStateToDB(STORAGE_KEY, state);
    }
  }, [state, isHydrated]);

  // 背景设定
  const setBackground = useCallback((background: string) => {
    setState((prev) => ({ ...prev, background }));
  }, []);

  const setStyle = useCallback((style: string) => {
    setState((prev) => ({ ...prev, style }));
  }, []);

  // 角色管理
  const addCharacter = useCallback((character: Character) => {
    setState((prev) => ({
      ...prev,
      characters: [...prev.characters, character],
    }));
  }, []);

  const updateCharacter = useCallback(
    (id: string, character: Partial<Character>) => {
      setState((prev) => ({
        ...prev,
        characters: prev.characters.map((c) =>
          c.id === id ? { ...c, ...character } : c
        ),
      }));
    },
    []
  );

  const removeCharacter = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      characters: prev.characters.filter((c) => c.id !== id),
    }));
  }, []);

  const setCharacters = useCallback((characters: Character[]) => {
    setState((prev) => ({ ...prev, characters }));
  }, []);

  // 漫画管理
  const addEpisode = useCallback((episode: Episode) => {
    setState((prev) => ({
      ...prev,
      episodes: [...prev.episodes, episode],
    }));
  }, []);

  const updateEpisode = useCallback((id: string, episode: Partial<Episode>) => {
    setState((prev) => ({
      ...prev,
      episodes: prev.episodes.map((e) =>
        e.id === id ? { ...e, ...episode } : e
      ),
    }));
  }, []);

  const forkEpisode = useCallback((id: string, newOutline: string) => {
    setState((prev) => {
      const index = prev.episodes.findIndex((e) => e.id === id);
      if (index === -1) return prev;

      // 截断数组：保留到当前章节（包含）
      const newEpisodes = prev.episodes.slice(0, index + 1);

      // 更新当前章节
      newEpisodes[index] = {
        ...newEpisodes[index],
        outline: newOutline,
        status: "generating",
        images: [], // 清空旧图片
      };

      return {
        ...prev,
        episodes: newEpisodes,
      };
    });
  }, []);

  const removeEpisode = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      episodes: prev.episodes.filter((e) => e.id !== id),
    }));
  }, []);

  const setEpisodes = useCallback((episodes: Episode[]) => {
    setState((prev) => ({ ...prev, episodes }));
  }, []);

  const clearEpisodes = useCallback(() => {
    setState((prev) => ({ ...prev, episodes: [] }));
  }, []);

  // 剧情建议管理
  const setSuggestions = useCallback((suggestions: string[]) => {
    setState((prev) => ({ ...prev, suggestions }));
  }, []);

  const clearSuggestions = useCallback(() => {
    setState((prev) => ({ ...prev, suggestions: [] }));
  }, []);

  // 完结管理
  const setFinished = useCallback((isFinished: boolean) => {
    setState((prev) => ({ ...prev, isFinished }));
  }, []);

  // 重置
  const resetStory = useCallback(() => {
    setState(initialState);
  }, []);

  return (
    <StoryContext.Provider
      value={{
        state,
        isHydrated,
        setBackground,
        setStyle,
        addCharacter,
        updateCharacter,
        removeCharacter,
        setCharacters,
        addEpisode,
        updateEpisode,
        forkEpisode,
        removeEpisode,
        setEpisodes,
        setSuggestions,
        clearSuggestions,
        setFinished,
        resetStory,
      }}
    >
      {children}
    </StoryContext.Provider>
  );
}

export function useStory() {
  const context = useContext(StoryContext);
  if (context === undefined) {
    throw new Error("useStory must be used within a StoryProvider");
  }
  return context;
}

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
  // 漫画管理
  addEpisode: (episode: Episode) => void;
  updateEpisode: (id: string, episode: Partial<Episode>) => void;
  /**
   * 分支剧情：更新指定章节的大纲，并移除该章节之后的所有章节
   */
  forkEpisode: (id: string, newOutline: string) => void;
  removeEpisode: (id: string) => void;
  setEpisodes: (episodes: Episode[]) => void;
  // 重置
  resetStory: () => void;
}

const STORAGE_KEY = "ai-manga-story-state";

const initialState: StoryState = {
  background: "",
  style: "",
  characters: [],
  episodes: [],
};

const StoryContext = createContext<StoryContextType | undefined>(undefined);

export function StoryProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<StoryState>(initialState);
  const [isHydrated, setIsHydrated] = useState(false);

  // 初始化：从 localStorage 加载
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setState(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load state from localStorage:", e);
      }
    }
    setIsHydrated(true);
  }, []);

  // 持久化：当状态改变时保存
  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
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

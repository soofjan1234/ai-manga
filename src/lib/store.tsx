"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
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
  imageUrl?: string;
  suggestions?: string[];
  createdAt: Date;
}

export interface StoryState {
  background: string;
  style: string;
  characters: Character[];
  episodes: Episode[];
}

interface StoryContextType {
  state: StoryState;
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
  removeEpisode: (id: string) => void;
  // 重置
  resetStory: () => void;
}

const initialState: StoryState = {
  background: "",
  style: "",
  characters: [],
  episodes: [],
};

const StoryContext = createContext<StoryContextType | undefined>(undefined);

export function StoryProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<StoryState>(initialState);

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

  const removeEpisode = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      episodes: prev.episodes.filter((e) => e.id !== id),
    }));
  }, []);

  // 重置
  const resetStory = useCallback(() => {
    setState(initialState);
  }, []);

  return (
    <StoryContext.Provider
      value={{
        state,
        setBackground,
        setStyle,
        addCharacter,
        updateCharacter,
        removeCharacter,
        setCharacters,
        addEpisode,
        updateEpisode,
        removeEpisode,
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

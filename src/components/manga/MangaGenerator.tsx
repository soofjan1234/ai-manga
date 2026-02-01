"use client";

import { useState, useEffect, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import StoryTimeline from "./StoryTimeline";
import InputArea from "./InputArea";
import { StoryPanelData } from "./StoryPanel";
import { useStory } from "@/lib/store";
import { Character as GeminiCharacter } from "@/lib/gemini";

export default function MangaGenerator() {
    const { state, addEpisode, updateEpisode, forkEpisode, setSuggestions, clearSuggestions, isHydrated } = useStory();
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSuggesting, setIsSuggesting] = useState(false);
    const [pendingInput, setPendingInput] = useState<string | undefined>(undefined);

    const fetchSuggestions = useCallback(async () => {
        // 如果已经有建议了，就不再重复生成
        if (state.suggestions.length > 0 || !state.background || state.episodes.some(e => e.status === 'generating') || isSuggesting) return;

        setIsSuggesting(true);
        try {
            const lastCompleteEpisode = [...state.episodes]
                .reverse()
                .find(e => e.status === 'complete');

            const response = await fetch("/api/manga/suggest-options", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    background: state.background,
                    style: state.style,
                    lastEpisodeOutline: lastCompleteEpisode?.outline,
                    characters: state.characters.map(c => ({ name: c.name, description: c.description }))
                }),
            });

            const data = await response.json();
            if (data.options) {
                setSuggestions(data.options); // 保存到 store，自动持久化
            }
        } catch (error) {
            console.error("获取建议失败:", error);
        } finally {
            setIsSuggesting(false);
        }
    }, [state.background, state.style, state.episodes, state.characters, state.suggestions?.length, isSuggesting, setSuggestions]);

    // 初始进入或章节增加时自动获取建议（如果还没有的话）
    useEffect(() => {
        if (state.background && !isProcessing && state.episodes.length > 0 && (state.suggestions?.length ?? 0) === 0) {
            fetchSuggestions();
        }
    }, [state.episodes.length, isProcessing, state.background, state.suggestions?.length, fetchSuggestions]);

    const handleSelectSuggestion = (suggestion: string) => {
        setPendingInput(suggestion);
        // 重置一下，确保同一选项点两次也能触发 InputArea 的 effect
        setTimeout(() => setPendingInput(undefined), 100);
    };

    const handleRefreshSuggestions = () => {
        clearSuggestions(); // 清空现有建议
        fetchSuggestions(); // 重新获取
    };

    const handleGenerate = async (prompt: string) => {
        setIsProcessing(true);
        clearSuggestions(); // 生成新内容时清空建议

        const newStoryId = uuidv4();
        const newEpisode: StoryPanelData = {
            id: newStoryId,
            outline: prompt,
            images: [],
            timestamp: Date.now(),
            status: "generating"
        };

        addEpisode(newEpisode);

        // 准备角色数据
        const characters: GeminiCharacter[] | undefined = state.characters.length > 0
            ? state.characters
                .filter(c => c.imageUrl)
                .map(c => ({
                    name: c.name,
                    sheetImage: c.imageUrl!,
                    description: c.description
                }))
            : undefined;

        // 准备上一页数据
        const previousPage = state.episodes.length > 0
            ? (() => {
                const lastCompleteEpisode = [...state.episodes]
                    .reverse()
                    .find(e => e.status === "complete" && e.images.length > 0);

                if (lastCompleteEpisode) {
                    return {
                        generatedImage: lastCompleteEpisode.images[0],
                        sceneDescription: lastCompleteEpisode.outline
                    };
                }
                return undefined;
            })()
            : undefined;

        try {
            const response = await fetch("/api/generate-manga", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    prompt,
                    characters,
                    previousPage,
                    generateEmptyBubbles: false,
                    style: state.style
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Generation failed");
            }

            updateEpisode(newStoryId, {
                status: "complete",
                images: [data.image]
            });

        } catch (error) {
            console.error("Error generating manga:", error);
            updateEpisode(newStoryId, {
                status: "error",
            });
        } finally {
            setIsProcessing(false);
        }
    };

    const handleRegenerate = async (id: string) => {
        const episodeToRegen = state.episodes.find(e => e.id === id);
        if (!episodeToRegen) return;

        updateEpisode(id, { status: "generating", images: [] });
        setIsProcessing(true);
        clearSuggestions();

        const characters: GeminiCharacter[] | undefined = state.characters.length > 0
            ? state.characters
                .filter(c => c.imageUrl)
                .map(c => ({
                    name: c.name,
                    sheetImage: c.imageUrl!,
                    description: c.description
                }))
            : undefined;

        const currentIndex = state.episodes.findIndex(e => e.id === id);
        const previousPage = currentIndex > 0
            ? (() => {
                const previousEpisodes = state.episodes.slice(0, currentIndex);
                const lastCompleteEpisode = [...previousEpisodes]
                    .reverse()
                    .find(e => e.status === "complete" && e.images.length > 0);

                if (lastCompleteEpisode) {
                    return {
                        generatedImage: lastCompleteEpisode.images[0],
                        sceneDescription: lastCompleteEpisode.outline
                    };
                }
                return undefined;
            })()
            : undefined;

        try {
            const response = await fetch("/api/generate-manga", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    prompt: episodeToRegen.outline,
                    characters,
                    previousPage,
                    generateEmptyBubbles: false,
                    style: state.style
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Regeneration failed");
            }

            updateEpisode(id, {
                status: "complete",
                images: [data.image]
            });

        } catch (error) {
            console.error("Error regenerating manga:", error);
            updateEpisode(id, {
                status: "error",
            });
        } finally {
            setIsProcessing(false);
        }
    };

    const handleFork = async (id: string, newOutline: string) => {
        // 先调用 store 的 fork 方法更新状态并截断后续章节
        forkEpisode(id, newOutline);
        setIsProcessing(true);
        clearSuggestions();

        const characters: GeminiCharacter[] | undefined = state.characters.length > 0
            ? state.characters
                .filter(c => c.imageUrl)
                .map(c => ({
                    name: c.name,
                    sheetImage: c.imageUrl!,
                    description: c.description
                }))
            : undefined;

        const currentIndex = state.episodes.findIndex(e => e.id === id);
        const previousPage = currentIndex > 0
            ? (() => {
                const previousEpisodes = state.episodes.slice(0, currentIndex);
                const lastCompleteEpisode = [...previousEpisodes]
                    .reverse()
                    .find(e => e.status === "complete" && e.images.length > 0);

                if (lastCompleteEpisode) {
                    return {
                        generatedImage: lastCompleteEpisode.images[0],
                        sceneDescription: lastCompleteEpisode.outline
                    };
                }
                return undefined;
            })()
            : undefined;

        try {
            const response = await fetch("/api/generate-manga", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    prompt: newOutline, // 使用新的大纲
                    characters,
                    previousPage,
                    generateEmptyBubbles: false,
                    style: state.style
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Fork generation failed");
            }

            updateEpisode(id, {
                status: "complete",
                images: [data.image]
            });

        } catch (error) {
            console.error("Error generating fork:", error);
            updateEpisode(id, {
                status: "error",
            });
        } finally {
            setIsProcessing(false);
        }
    }

    if (!isHydrated) return null;

    return (
        <div className="flex flex-col min-h-screen">
            <StoryTimeline
                stories={state.episodes}
                onRegenerate={handleRegenerate}
                onFork={handleFork}
                suggestions={state.isFinished ? [] : state.suggestions}
                onSelectSuggestion={handleSelectSuggestion}
                isSuggesting={isSuggesting}
                onRefreshSuggestions={handleRefreshSuggestions}
            />

            {!state.isFinished ? (
                <InputArea
                    onGenerate={handleGenerate}
                    isLoading={isProcessing}
                    externalInput={pendingInput}
                />
            ) : (
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                    <div className="badge-retro-accent px-8 py-3 text-xl shadow-retro flex items-center gap-3">
                        <span className="text-2xl">🏁</span>
                        <span>本篇故事已完结</span>
                        <span className="text-2xl">🏁</span>
                    </div>
                </div>
            )}
        </div>
    );
}

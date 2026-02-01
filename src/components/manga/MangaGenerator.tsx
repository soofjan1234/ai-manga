"use client";

import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import StoryTimeline from "./StoryTimeline";
import InputArea from "./InputArea";
import { StoryPanelData } from "./StoryPanel";
import { useStory } from "@/lib/store";
import { Character as GeminiCharacter } from "@/lib/gemini";

export default function MangaGenerator() {
    const { state, addEpisode, updateEpisode, forkEpisode, isHydrated } = useStory();
    const [isProcessing, setIsProcessing] = useState(false);

    const handleGenerate = async (prompt: string) => {
        setIsProcessing(true);

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

        const characters: GeminiCharacter[] | undefined = state.characters.length > 0
            ? state.characters
                .filter(c => c.imageUrl)
                .map(c => ({
                    name: c.name,
                    sheetImage: c.imageUrl!,
                    description: c.description
                }))
            : undefined;

        // 获取该章节之前的最新状态（注意：forkEpisode 已经更新了 state，但我们需要确保基于 fork 时的上下文）
        // 由于 setState 是异步的，这里 state 可能还未更新。
        // 但我们在 forkEpisode 中是直接操作 episodes 数组。
        // 安全起见，我们重新计算 previousPage，就像 handleRegenerate 一样。
        // 但要注意，fork 后，id 对应的章节就是最后一个章节了。

        // 重新获取最新的 episodes 列表，但在 React 中 state 在本次 render 不会变。
        // 我们假设 forkEpisode 生效后，我们重用 handleRegenerate 的逻辑部分，
        // 但必须使用 newOutline 而不是从 state 中读取旧 outline。

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
        <div className="min-h-[calc(100vh-10rem)]">
            <StoryTimeline
                stories={state.episodes}
                onRegenerate={handleRegenerate}
                onFork={handleFork}
            />
            <InputArea
                onGenerate={handleGenerate}
                isLoading={isProcessing}
            />
        </div>
    );
}

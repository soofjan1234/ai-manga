"use client";

import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import StoryTimeline from "./StoryTimeline";
import InputArea from "./InputArea";
import { StoryPanelData } from "./StoryPanel";
import { useStory } from "@/lib/store";
import { Character as GeminiCharacter } from "@/lib/gemini";

export default function MangaGenerator() {
    const { state } = useStory();
    const [stories, setStories] = useState<StoryPanelData[]>([]);
    const [loading, setLoading] = useState(false);

    // Load stories from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem("manga-stories");
        if (saved) {
            try {
                setStories(JSON.parse(saved));
            } catch (e) {
                console.error("Failed to parse saved stories", e);
            }
        }
    }, []);

    // Save stories to localStorage whenever they change
    useEffect(() => {
        localStorage.setItem("manga-stories", JSON.stringify(stories));
    }, [stories]);

    const handleGenerate = async (prompt: string) => {
        setLoading(true);

        // Create new story placeholder
        const newStoryId = uuidv4();
        const newStory: StoryPanelData = {
            id: newStoryId,
            outline: prompt,
            images: [],
            timestamp: Date.now(),
            status: "generating"
        };

        setStories(prev => [...prev, newStory]);

        // 准备角色数据 - 将 store 中的角色转换为 Gemini API 格式
        const characters: GeminiCharacter[] | undefined = state.characters.length > 0
            ? state.characters
                .filter(c => c.imageUrl) // 只传递有图像的角色
                .map(c => ({
                    name: c.name,
                    sheetImage: c.imageUrl!, // imageUrl 就是 base64 格式的角色参考表
                    description: c.description
                }))
            : undefined;

        // 准备上一页数据 - 获取最后一个完成的故事
        const previousPage = stories.length > 0
            ? (() => {
                const lastCompleteStory = [...stories]
                    .reverse()
                    .find(s => s.status === "complete" && s.images.length > 0);

                if (lastCompleteStory) {
                    return {
                        generatedImage: lastCompleteStory.images[0],
                        sceneDescription: lastCompleteStory.outline
                    };
                }
                return undefined;
            })()
            : undefined;

        console.log("前端准备发送的数据:");
        console.log("- 角色数量:", characters?.length || 0);
        console.log("- 是否有上一页:", !!previousPage);

        // Call API
        try {
            const response = await fetch("/api/generate-manga", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    prompt,
                    characters,
                    colorMode: "monochrome",
                    previousPage,
                    generateEmptyBubbles: false
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Generation failed");
            }

            setStories(prev => prev.map(story => {
                if (story.id === newStoryId) {
                    return {
                        ...story,
                        status: "complete",
                        images: [data.image]
                    };
                }
                return story;
            }));

        } catch (error) {
            console.error("Error generating manga:", error);
            setStories(prev => prev.map(story => {
                if (story.id === newStoryId) {
                    return {
                        ...story,
                        status: "error",
                    };
                }
                return story;
            }));
        } finally {
            setLoading(false);
        }
    };

    const handleRegenerate = async (id: string) => {
        // Find the story to regenerate
        const storyToRegen = stories.find(s => s.id === id);
        if (!storyToRegen) return;

        // Reset status to generating
        setStories(prev => prev.map(s =>
            s.id === id ? { ...s, status: "generating", images: [] } : s
        ));
        setLoading(true);

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

        // 准备上一页数据 - 获取当前故事之前的最后一个完成的故事
        const currentIndex = stories.findIndex(s => s.id === id);
        const previousPage = currentIndex > 0
            ? (() => {
                const previousStories = stories.slice(0, currentIndex);
                const lastCompleteStory = [...previousStories]
                    .reverse()
                    .find(s => s.status === "complete" && s.images.length > 0);

                if (lastCompleteStory) {
                    return {
                        generatedImage: lastCompleteStory.images[0],
                        sceneDescription: lastCompleteStory.outline
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
                    prompt: storyToRegen.outline,
                    characters,
                    colorMode: "monochrome",
                    previousPage,
                    generateEmptyBubbles: false
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Regeneration failed");
            }

            setStories(prev => prev.map(story => {
                if (story.id === id) {
                    return {
                        ...story,
                        status: "complete",
                        images: [data.image]
                    };
                }
                return story;
            }));

        } catch (error) {
            console.error("Error regenerating manga:", error);
            setStories(prev => prev.map(story => {
                if (story.id === id) {
                    return {
                        ...story,
                        status: "error",
                    };
                }
                return story;
            }));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen pb-20">
            <StoryTimeline
                stories={stories}
                onRegenerate={handleRegenerate}
            />
            <InputArea
                onGenerate={handleGenerate}
                isLoading={loading}
            />
        </div>
    );
}

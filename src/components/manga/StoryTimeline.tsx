"use client";

import { useEffect, useRef } from "react";
import StoryPanel, { StoryPanelData } from "./StoryPanel";

interface StoryTimelineProps {
    stories: StoryPanelData[];
    onRegenerate: (id: string) => void;
}

export default function StoryTimeline({ stories, onRegenerate }: StoryTimelineProps) {
    const bottomRef = useRef<HTMLDivElement>(null);

    // Auto scroll to bottom when new story is added
    useEffect(() => {
        if (stories.length > 0) {
            bottomRef.current?.scrollIntoView({ behavior: "smooth" });
        }
    }, [stories.length, stories[stories.length - 1]?.status]);

    if (stories.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-8 opacity-60">
                <div className="w-24 h-24 mb-6 border-3 border-cream rounded-full flex items-center justify-center">
                    <span className="text-4xl">✨</span>
                </div>
                <p className="font-heading text-2xl text-cream mb-2">开始你的创作</p>
                <p className="font-body text-cream/60 max-w-sm">
                    在下方输入故事大纲，AI 将为你生成精美的四格漫画
                </p>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto w-full pb-32 pt-8 px-4">
            {stories.map((story) => (
                <StoryPanel
                    key={story.id}
                    data={story}
                    onRegenerate={onRegenerate}
                />
            ))}
            <div ref={bottomRef} className="h-4" />
        </div>
    );
}

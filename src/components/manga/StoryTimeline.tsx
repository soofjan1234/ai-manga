"use client";

import { useEffect, useRef } from "react";
import StoryPanel, { StoryPanelData } from "./StoryPanel";

interface StoryTimelineProps {
    stories: StoryPanelData[];
    onRegenerate: (id: string) => void;
    onFork: (id: string, newOutline: string) => void;
}

export default function StoryTimeline({ stories, onRegenerate, onFork }: StoryTimelineProps) {
    const bottomRef = useRef<HTMLDivElement>(null);

    // Auto scroll to bottom when new story is added
    useEffect(() => {
        if (stories.length > 0) {
            bottomRef.current?.scrollIntoView({ behavior: "smooth" });
        }
    }, [stories.length, stories[stories.length - 1]?.status]);

    if (stories.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-8 py-12">
                <div className="space-y-6">
                    <div className="badge-retro-accent inline-block">
                        STEP 03 — 漫画创作
                    </div>
                    <h1 className="font-heading text-5xl sm:text-6xl font-bold text-cream leading-tight">
                        开始你的
                        <br />
                        <span className="text-accent">创作</span>
                    </h1>
                    <p className="text-cream/70 text-lg max-w-sm mx-auto font-body">
                        在下方输入故事大纲，AI 将为你生成精美的全彩漫画
                    </p>
                </div>

                {/* 装饰条纹 */}
                <div className="stripe-decoration w-full max-w-md mx-auto opacity-50" />

                <div className="flex justify-center">
                    <div className="w-20 h-20 border-3 border-cream/20 rounded-full flex items-center justify-center">
                        <span className="text-4xl">✨</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto w-full pt-8 px-4">
            {stories.map((story) => (
                <StoryPanel
                    key={story.id}
                    data={story}
                    onRegenerate={onRegenerate}
                    onFork={onFork}
                />
            ))}
            <div ref={bottomRef} className="h-4" />
        </div>
    );
}

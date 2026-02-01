"use client";

import { useEffect, useRef } from "react";
import StoryPanel, { StoryPanelData } from "./StoryPanel";

interface StoryTimelineProps {
    stories: StoryPanelData[];
    onRegenerate: (id: string) => void;
    onFork: (id: string, newOutline: string) => void;
    suggestions: string[];
    onSelectSuggestion: (suggestion: string) => void;
    isSuggesting?: boolean;
    onRefreshSuggestions: () => void;
    onSuggestFirstStep: () => void;
    isFinished?: boolean;
}

export default function StoryTimeline({
    stories,
    onRegenerate,
    onFork,
    suggestions,
    onSelectSuggestion,
    isSuggesting,
    onRefreshSuggestions,
    onSuggestFirstStep,
    isFinished
}: StoryTimelineProps) {
    const bottomRef = useRef<HTMLDivElement>(null);

    // Auto scroll to bottom when new story is added or suggestions appear
    useEffect(() => {
        if (stories.length > 0 || suggestions.length > 0) {
            bottomRef.current?.scrollIntoView({ behavior: "smooth" });
        }
    }, [stories.length, stories[stories.length - 1]?.status, suggestions.length]);

    if (stories.length === 0) {
        // ... (保持现有的空状态渲染逻辑)
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-8 pb-12">
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

                <div className="stripe-decoration w-full max-w-md mx-auto" />

                <div className="flex flex-col items-center gap-6">
                    <button
                        onClick={onSuggestFirstStep}
                        disabled={isSuggesting}
                        className="btn-retro flex items-center gap-3 px-10 py-4 text-xl"
                    >
                        {isSuggesting ? (
                            <>
                                <span className="animate-spin text-2xl">◐</span>
                                <span>策划中...</span>
                            </>
                        ) : (
                            <>
                                <span className="text-2xl">✦</span>
                                <span>生成第一页</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto w-full pt-8 px-4 pb-20">
            {stories.map((story) => (
                <StoryPanel
                    key={story.id}
                    data={story}
                    onRegenerate={onRegenerate}
                    onFork={onFork}
                    isFinished={isFinished}
                />
            ))}

            {/* 剧情建议选项流 (复古漫画风格) */}
            {(suggestions.length > 0 || isSuggesting) && (
                <div className="mt-12 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    {/* 分隔标题 */}
                    <div className="flex items-center gap-4">
                        <div className="h-[3px] flex-1 bg-ink border-y border-ink" />
                        <div className="badge-retro-accent">
                            AI 剧情展望
                        </div>
                        <div className="h-[3px] flex-1 bg-ink border-y border-ink" />
                    </div>

                    {/* 建议选项卡片 / 加载状态 */}
                    <div className="grid gap-4">
                        {isSuggesting && suggestions.length === 0 ? (
                            // 初始加载占位
                            [1, 2, 3].map((i) => (
                                <div key={i} className="retro-card p-4 bg-ink/5 border-ink/20 animate-pulse">
                                    <div className="flex items-start gap-3">
                                        <div className="flex-shrink-0 w-8 h-8 border-3 border-ink/20 bg-cream/50" />
                                        <div className="flex-1 space-y-2 py-1">
                                            <div className="h-2 bg-ink/10 rounded w-3/4" />
                                            <div className="h-2 bg-ink/10 rounded w-1/2" />
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            suggestions.map((option, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => onSelectSuggestion(option)}
                                    className="retro-card p-4 text-left hover:bg-accent transition-all group"
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="flex-shrink-0 w-8 h-8 border-3 border-ink bg-cream flex items-center justify-center font-heading font-bold text-ink">
                                            {idx + 1}
                                        </div>
                                        <p className="flex-1 text-ink/80 group-hover:text-ink leading-relaxed font-body">
                                            {option}
                                        </p>
                                        <div className="flex-shrink-0 text-ink opacity-0 group-hover:opacity-100 transition-opacity">
                                            →
                                        </div>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>

                    {/* 刷新按钮 */}
                    {suggestions.length > 0 && (
                        <div className="flex justify-center">
                            <button
                                onClick={onRefreshSuggestions}
                                disabled={isSuggesting}
                                className="btn-retro-secondary"
                            >
                                {isSuggesting ? (
                                    <>
                                        <span className="animate-spin text-lg">◐</span>
                                        <span>生成中...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>↻</span>
                                        <span>换一批建议</span>
                                    </>
                                )}
                            </button>
                        </div>
                    )}
                </div>
            )}

            <div ref={bottomRef} className="h-4" />
        </div>
    );
}

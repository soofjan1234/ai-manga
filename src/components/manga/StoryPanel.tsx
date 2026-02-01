"use client";

import Image from "next/image";

export interface StoryPanelData {
    id: string;
    outline: string;
    images: string[]; // URLs of the 4 panel images, empty if generating
    timestamp: number;
    status: "generating" | "complete" | "error";
}

interface StoryPanelProps {
    data: StoryPanelData;
    onRegenerate: (id: string) => void;
}

export default function StoryPanel({ data, onRegenerate }: StoryPanelProps) {
    return (
        <div className="retro-card p-6 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header / Outline */}
            <div className="mb-6 border-b-2 border-ink/10 pb-4">
                <h3 className="font-heading text-xl text-ink font-bold mb-2">
                    剧情大纲
                </h3>
                <p className="font-body text-ink/80 text-lg leading-relaxed">
                    {data.outline}
                </p>
            </div>

            {/* Comic Grid (4 Panels) */}
            {/* Single Manga Page */}
            <div className="relative w-full mb-6 bg-white border-2 border-ink overflow-hidden group min-h-[400px]">
                {data.status === "generating" ? (
                    <div className="w-full h-[600px] flex flex-col items-center justify-center bg-gray-100 animate-pulse">
                        <div className="w-12 h-12 border-4 border-ink border-t-transparent rounded-full animate-spin mb-4" />
                        <span className="text-sm text-ink/60 font-mono uppercase tracking-widest">
                            正在绘制漫画...
                        </span>
                    </div>
                ) : data.images[0] ? (
                    <div className="relative w-full">
                        {data.images[0].startsWith("data:image") || data.images[0].startsWith("http") ? (
                            <img
                                src={data.images[0]}
                                alt="Generated Manga Page"
                                className="w-full h-auto object-cover"
                            />
                        ) : (
                            <div className="w-full h-[600px] flex items-center justify-center bg-gray-200 text-ink/20 font-bold text-4xl">
                                MANGA PAGE
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="w-full h-[300px] flex items-center justify-center bg-gray-100 text-ink/20">
                        <span className="text-xs">Waiting</span>
                    </div>
                )}
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3">
                <button
                    onClick={() => onRegenerate(data.id)}
                    disabled={data.status === "generating"}
                    className={`
            px-4 py-2 text-sm font-bold uppercase tracking-wider
            border-2 border-ink bg-transparent text-ink
            hover:bg-ink hover:text-cream transition-colors
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
                >
                    🔄 重新生成
                </button>
            </div>
        </div>
    );
}

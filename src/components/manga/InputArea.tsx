"use client";

import { useState, useRef, useEffect } from "react";

interface InputAreaProps {
    onGenerate: (prompt: string) => void;
    isLoading: boolean;
}

export default function InputArea({ onGenerate, isLoading }: InputAreaProps) {
    const [input, setInput] = useState("");
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const handleSubmit = () => {
        if (!input.trim() || isLoading) return;
        onGenerate(input);
        setInput("");
        // Reset height
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    const adjustHeight = () => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = "auto";
            textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
        }
    };

    useEffect(() => {
        adjustHeight();
    }, [input]);

    return (
        <div className="fixed bottom-0 left-0 right-0 p-4 z-40 bg-background/80 backdrop-blur-sm border-t-3 border-ink/10">
            <div className="max-w-3xl mx-auto flex gap-3 items-end">
                <div className="relative flex-1">
                    <textarea
                        ref={textareaRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="输入故事大纲，开始创作..."
                        className="input-retro w-full min-h-[52px] max-h-[200px] py-3 pr-12 resize-none leading-relaxed"
                        disabled={isLoading}
                        rows={1}
                    />
                </div>

                <button
                    onClick={handleSubmit}
                    disabled={!input.trim() || isLoading}
                    className={`
            h-[52px] px-6 flex items-center justify-center
            font-bold uppercase tracking-wider border-3 border-ink
            transition-all duration-150
            ${!input.trim() || isLoading
                            ? "bg-gray-300 text-gray-500 cursor-not-allowed shadow-none"
                            : "bg-accent text-ink shadow-retro hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] active:translate-x-[4px] active:translate-y-[4px] cursor-pointer"}
          `}
                >
                    {isLoading ? (
                        <span className="animate-pulse">生成中...</span>
                    ) : (
                        <span>生成</span>
                    )}
                </button>
            </div>
        </div>
    );
}

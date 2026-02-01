import { useState, useRef, useEffect } from "react";
import { useStory } from "@/lib/store";

interface InputAreaProps {
    onGenerate: (prompt: string) => void;
    isLoading: boolean;
}

export default function InputArea({ onGenerate, isLoading }: InputAreaProps) {
    const { state } = useStory();
    const [input, setInput] = useState("");
    const [isPolishing, setIsPolishing] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const handleSubmit = () => {
        if (!input.trim() || isLoading || isPolishing) return;
        onGenerate(input);
        setInput("");
        // Reset height
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
        }
    };

    const handlePolish = async () => {
        if (!input.trim() || isLoading || isPolishing) return;
        setIsPolishing(true);
        try {
            const response = await fetch("/api/manga/polish", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    outline: input,
                    style: state.style,
                }),
            });

            const data = await response.json();
            if (data.polishedText) {
                setInput(data.polishedText);
            } else if (data.error) {
                alert("润色失败: " + data.error);
            }
        } catch (error) {
            console.error("润色请求失败:", error);
            alert("润色请求失败，请检查网络");
        } finally {
            setIsPolishing(false);
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

    const isActionDisabled = !input.trim() || isLoading || isPolishing;

    return (
        <div className="fixed bottom-0 left-0 right-0 p-4 z-40 bg-background/80 backdrop-blur-sm border-t-3 border-ink/10">
            <div className="max-w-4xl mx-auto flex gap-3 items-end">
                <div className="relative flex-1">
                    <textarea
                        ref={textareaRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="输入故事大纲，开始创作..."
                        className="input-retro w-full min-h-[52px] max-h-[200px] py-3 pr-12 resize-none leading-relaxed"
                        disabled={isLoading || isPolishing}
                        rows={1}
                    />
                </div>

                {/* AI 润色按钮 */}
                <button
                    onClick={handlePolish}
                    disabled={isActionDisabled}
                    className={`
                        h-[52px] px-4 flex items-center justify-center gap-2
                        font-mono text-sm uppercase tracking-wider border-3 border-ink
                        transition-all duration-150
                        ${isActionDisabled
                            ? "bg-gray-200 text-gray-400 border-gray-300 cursor-not-allowed"
                            : "bg-cream text-ink shadow-retro hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] cursor-pointer"}
                    `}
                    title="使用 AI 润色大纲"
                >
                    {isPolishing ? (
                        <span className="animate-spin text-xl">◐</span>
                    ) : (
                        <>
                            <span>✦</span>
                            <span className="hidden sm:inline">润色</span>
                        </>
                    )}
                </button>

                {/* 生成按钮 */}
                <button
                    onClick={handleSubmit}
                    disabled={isActionDisabled}
                    className={`
                        h-[52px] px-6 min-w-[100px] flex items-center justify-center
                        font-bold uppercase tracking-wider border-3 border-ink
                        transition-all duration-150
                        ${isActionDisabled
                            ? "bg-gray-300 text-gray-500 border-gray-400 cursor-not-allowed shadow-none"
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

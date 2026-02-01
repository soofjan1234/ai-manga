"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useStory } from "@/lib/store";

// 预设风格选项
const styleOptions = [
  { id: "hot-blood", label: "热血冒险", icon: "🔥" },
  { id: "healing", label: "治愈日常", icon: "🌸" },
  { id: "mystery", label: "悬疑推理", icon: "🔍" },
  { id: "fantasy", label: "奇幻世界", icon: "✨" },
  { id: "scifi", label: "科幻未来", icon: "🚀" },
  { id: "romance", label: "浪漫爱情", icon: "💕" },
];

export default function BackgroundPage() {
  const router = useRouter();
  const { state, setBackground, setStyle } = useStory();

  const [background, setBackgroundLocal] = useState(state.background);
  const [selectedStyle, setSelectedStyle] = useState(state.style);
  const [isEnhancing, setIsEnhancing] = useState(false);

  const handleEnhance = async () => {
    if (!background.trim()) return;
    setIsEnhancing(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsEnhancing(false);
  };

  const handleNext = () => {
    if (!background.trim()) return;
    setBackground(background);
    setStyle(selectedStyle);
    router.push("/characters");
  };

  const canProceed = background.trim().length > 0;

  return (
    <div className="space-y-8 relative z-10">
      {/* Hero 区域 */}
      <div className="text-center space-y-6">
        <div className="badge-retro-accent inline-block">
          STEP 01 — 背景设定
        </div>
        <h1 className="font-heading text-5xl sm:text-6xl font-bold text-cream leading-tight">
          你的故事
          <br />
          <span className="text-accent">从这里开始</span>
        </h1>
        <p className="text-cream/70 text-lg max-w-md mx-auto font-body">
          描述一个有趣的世界观，AI 将帮你创作出精彩的漫画故事
        </p>
      </div>

      {/* 装饰条纹 */}
      <div className="stripe-decoration w-full max-w-md mx-auto" />

      {/* 主内容区域 */}
      <div className="retro-card p-6 sm:p-8 space-y-8">
        {/* 故事背景输入 */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="font-heading font-bold text-ink text-xl">
              故事背景
            </label>
            <span className="badge-retro">{background.length} 字</span>
          </div>
          <textarea
            className="textarea-retro min-h-[180px] text-base leading-relaxed"
            placeholder="例如：在一个魔法与科技共存的世界里，少年小明意外获得了穿越时空的能力。他必须在混乱的时间线中找到失散的家人，同时躲避追捕他的神秘组织..."
            value={background}
            onChange={(e) => setBackgroundLocal(e.target.value)}
          />
          <div className="flex justify-end">
            <button
              onClick={handleEnhance}
              disabled={!background.trim() || isEnhancing}
              className={`
                flex items-center gap-2 px-4 py-2 font-mono text-sm uppercase tracking-wider
                border-2 transition-all duration-200 cursor-pointer
                ${
                  background.trim() && !isEnhancing
                    ? "bg-transparent text-ink border-ink hover:bg-ink hover:text-cream"
                    : "bg-ink/10 text-ink/30 border-ink/20 cursor-not-allowed"
                }
              `}
            >
              {isEnhancing ? (
                <>
                  <span className="animate-spin">◐</span>
                  处理中...
                </>
              ) : (
                <>
                  <span>✦</span>
                  AI 润色
                </>
              )}
            </button>
          </div>
        </div>

        {/* 分隔线 */}
        <div className="stripe-decoration" />

        {/* 风格选择 */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <label className="font-heading font-bold text-ink text-xl">
              选择风格
            </label>
            <span className="text-sm text-ink/50 font-mono uppercase">
              (可选)
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {styleOptions.map((style) => {
              const isSelected = selectedStyle === style.id;
              return (
                <button
                  key={style.id}
                  onClick={() =>
                    setSelectedStyle(isSelected ? "" : style.id)
                  }
                  className={`
                    flex items-center gap-3 px-4 py-4
                    font-body font-medium text-left
                    border-3 transition-all duration-150 cursor-pointer
                    ${
                      isSelected
                        ? "bg-accent text-ink border-ink shadow-retro translate-x-0 translate-y-0"
                        : "bg-cream text-ink border-ink/30 hover:border-ink hover:shadow-retro hover:-translate-x-[2px] hover:-translate-y-[2px]"
                    }
                  `}
                >
                  <span className="text-2xl">{style.icon}</span>
                  <span>{style.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 底部操作栏 */}
      <div className="flex items-center justify-between">
        <div className="retro-card-dark px-4 py-3 flex items-center gap-3">
          <span className="text-accent text-xl">☞</span>
          <p className="text-sm text-cream/80 font-mono">
            背景越详细，漫画越精彩
          </p>
        </div>

        <button
          onClick={handleNext}
          disabled={!canProceed}
          className={`
            btn-retro flex items-center gap-2
            ${!canProceed && "opacity-50 cursor-not-allowed hover:translate-x-0 hover:translate-y-0 hover:shadow-retro"}
          `}
        >
          下一步
          <span className="text-xl">→</span>
        </button>
      </div>

      {/* 底部装饰 */}
      <div className="flex justify-center gap-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className={`w-3 h-3 border-2 border-cream/30 ${i === 1 ? "bg-cream" : ""}`}
          />
        ))}
      </div>
    </div>
  );
}

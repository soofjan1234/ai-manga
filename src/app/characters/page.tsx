"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useStory, Character } from "@/lib/store";
import Image from "next/image";

const generateId = () => Math.random().toString(36).substring(2, 9);

interface CharacterDraft {
  id: string;
  name: string;
  description: string;
  imageUrl: string | null;
  isGenerating: boolean;
  error: string | null;
  editPrompt: string;
}

const createEmptyDraft = (): CharacterDraft => ({
  id: generateId(),
  name: "",
  description: "",
  imageUrl: null,
  isGenerating: false,
  error: null,
  editPrompt: "",
});

export default function CharactersPage() {
  const router = useRouter();
  const { state, setCharacters, setCharacterDrafts } = useStory();
  const drafts = state.characterDrafts;

  const [isSuggestingAll, setIsSuggestingAll] = useState(false);

  // 监听并自动同步到全局 Store，防止跳转丢失数据
  useEffect(() => {
    // If characterDrafts is empty, initialize it with one empty draft
    // This ensures there's always at least one draft to start with
    if (drafts.length === 0) {
      setCharacterDrafts([createEmptyDraft()]);
    }

    const validCharacters: Character[] = drafts
      .filter((d) => d.name) // 至少有名字才存
      .map((d) => ({
        id: d.id,
        name: d.name,
        description: d.description,
        imageUrl: d.imageUrl || undefined,
      }));
    setCharacters(validCharacters);
  }, [drafts, setCharacters, setCharacterDrafts]);

  // 更新单个草稿
  const updateDraft = (id: string, updates: Partial<CharacterDraft>) => {
    const newDrafts = drafts.map((d) => (d.id === id ? { ...d, ...updates } : d));
    setCharacterDrafts(newDrafts);
  };

  // 添加新角色
  const addDraft = () => {
    setCharacterDrafts([...drafts, createEmptyDraft()]);
  };

  // 删除角色
  const removeDraft = (id: string) => {
    setCharacterDrafts(drafts.filter((d) => d.id !== id));
  };

  // AI 建议角色（根据背景）
  const handleSuggestAll = async () => {
    if (!state.background) {
      alert("请先在背景设定页面填写故事背景");
      return;
    }

    setIsSuggestingAll(true);

    try {
      const response = await fetch("/api/characters/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "suggest",
          background: state.background,
          style: state.style,
        }),
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      // 创建新的草稿
      const newDrafts: CharacterDraft[] = data.characters.map(
        (c: { name: string; description: string }) => ({
          id: generateId(),
          name: c.name,
          description: c.description,
          imageUrl: null,
          isGenerating: false,
          error: null,
          editPrompt: "",
        })
      );

      setCharacterDrafts(newDrafts);
    } catch (error) {
      console.error("建议角色失败:", error);
      alert("生成角色建议失败，请重试");
    } finally {
      setIsSuggestingAll(false);
    }
  };

  const abortControllers = useRef<{ [key: string]: AbortController }>({});

  // 取消生成
  const handleCancel = (id: string) => {
    if (abortControllers.current[id]) {
      abortControllers.current[id].abort();
      delete abortControllers.current[id];
    }
    // 复原原样，不显示错误
    updateDraft(id, { isGenerating: false, error: null });
  };

  // 生成单个角色图像
  const handleGenerate = async (id: string) => {
    const draft = drafts.find((d) => d.id === id);
    if (!draft || !draft.name || !draft.description) {
      updateDraft(id, { error: "请填写角色名称和描述" });
      return;
    }

    // 创建新的 AbortController
    const controller = new AbortController();
    abortControllers.current[id] = controller;

    // 立即更新为生成中状态
    updateDraft(id, { isGenerating: true, error: null });

    try {
      const response = await fetch("/api/characters/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "generate",
          name: draft.name,
          description: draft.description,
          colorMode: "color",
        }),
        signal: controller.signal,
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      updateDraft(id, { imageUrl: data.imageUrl, isGenerating: false });
    } catch (error: any) {
      if (error.name === "AbortError") {
        console.log("Generation aborted for", id);
        return;
      }
      updateDraft(id, {
        error: error instanceof Error ? error.message : "生成失败",
        isGenerating: false,
      });
    } finally {
      delete abortControllers.current[id];
    }
  };

  // 下一步
  const handleNext = () => {
    const validCharacters: Character[] = drafts
      .filter((d) => d.name)
      .map((d) => ({
        id: d.id,
        name: d.name,
        description: d.description,
        imageUrl: d.imageUrl || undefined,
      }));

    if (validCharacters.length === 0) {
      alert("请至少添加一个角色");
      return;
    }

    setCharacters(validCharacters);
    router.push("/manga");
  };

  const handleBack = () => {
    router.push("/background");
  };

  const validCount = drafts.filter((d) => d.name).length;

  return (
    <div className="space-y-8 relative z-10">
      {/* Hero 区域 */}
      <div className="text-center space-y-6">
        <div className="badge-retro-accent inline-block">
          STEP 02 — 角色设定
        </div>
        <h1 className="font-heading text-5xl sm:text-6xl font-bold text-cream leading-tight">
          创建你的
          <br />
          <span className="text-accent">角色</span>
        </h1>
        <p className="text-cream/70 text-lg max-w-md mx-auto font-body">
          描述角色的外貌特征，AI 将为你生成角色形象
        </p>
      </div>

      {/* 装饰条纹 */}
      <div className="stripe-decoration w-full max-w-md mx-auto" />

      {/* 操作按钮 */}
      <div className="flex flex-wrap justify-center gap-4">
        <button
          onClick={handleSuggestAll}
          disabled={isSuggestingAll}
          className="btn-retro flex items-center gap-2"
        >
          {isSuggestingAll ? (
            <>
              <span className="animate-spin">◐</span>
              分析中...
            </>
          ) : (
            <>
              <span>✦</span>
              AI 建议角色
            </>
          )}
        </button>
        <button
          onClick={addDraft}
          className="btn-retro-outline flex items-center gap-2"
        >
          <span>+</span>
          手动添加
        </button>
      </div>

      {/* 角色卡片列表 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {drafts.map((draft, index) => (
          <div key={draft.id} className="retro-card p-0 overflow-hidden">
            {/* 头部 */}
            <div className="bg-ink text-cream px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-accent border-2 border-cream flex items-center justify-center font-heading font-bold text-ink">
                  {index + 1}
                </div>
                <input
                  type="text"
                  value={draft.name}
                  onChange={(e) =>
                    updateDraft(draft.id, { name: e.target.value })
                  }
                  placeholder="角色名称"
                  className="bg-transparent border-b-2 border-cream/50 text-cream font-heading font-bold text-lg px-1 focus:outline-none focus:border-accent w-32"
                />
              </div>
              <button
                onClick={() => removeDraft(draft.id)}
                className="px-3 py-1 text-accent hover:bg-accent hover:text-ink transition-colors text-sm font-mono uppercase cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* 内容 */}
            <div className="p-4 space-y-4">
              {/* 描述输入 */}
              <div>
                <label className="text-ink/60 text-sm font-mono uppercase mb-2 block">
                  外貌描述
                </label>
                <textarea
                  value={draft.description}
                  onChange={(e) =>
                    updateDraft(draft.id, { description: e.target.value })
                  }
                  placeholder="例如：18岁少年，黑色短发，穿着蓝色校服外套，眼神坚定，性格开朗..."
                  className="textarea-retro min-h-[100px] text-sm"
                />
              </div>

              {/* 图像区域 */}
              {draft.imageUrl ? (
                <div className="space-y-3">
                  <div className="relative aspect-square bg-cream-dark border-3 border-ink overflow-hidden">
                    <img
                      src={draft.imageUrl}
                      alt={draft.name}
                      className="w-full h-full object-contain"
                    />
                    {draft.isGenerating && (
                      <div className="absolute inset-0 bg-cream/80 flex items-center justify-center">
                        <span className="text-4xl animate-spin">◐</span>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {draft.isGenerating ? (
                      <button
                        onClick={() => handleCancel(draft.id)}
                        className="flex-1 px-3 py-2 bg-red-600 text-cream border-2 border-ink font-mono text-xs uppercase hover:bg-red-700 transition-colors cursor-pointer"
                      >
                        ✕ 取消
                      </button>
                    ) : (
                      <button
                        onClick={() => handleGenerate(draft.id)}
                        className="flex-1 px-3 py-2 bg-ink text-cream border-2 border-ink font-mono text-xs uppercase hover:bg-ink/80 transition-colors cursor-pointer"
                      >
                        ↻ 重新生成
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="relative group">
                  {draft.isGenerating ? (
                    <button
                      onClick={() => handleCancel(draft.id)}
                      className="w-full aspect-[4/3] border-3 border-dashed border-red-300 bg-red-50 flex flex-col items-center justify-center gap-2 font-mono text-sm uppercase transition-all cursor-pointer hover:bg-red-100 ring-2 ring-red-500 ring-offset-2"
                    >
                      <span className="text-3xl text-red-500">✕</span>
                      <span className="text-red-500 font-bold">取消生成</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleGenerate(draft.id)}
                      disabled={!draft.name || !draft.description}
                      className={`
                            w-full aspect-[4/3] border-3 border-dashed flex flex-col items-center justify-center gap-2
                            font-mono text-sm uppercase transition-all cursor-pointer
                            ${draft.name && draft.description
                          ? "border-ink hover:border-accent hover:bg-accent/10"
                          : "border-ink/20 text-ink/30 cursor-not-allowed"
                        }
                          `}
                    >
                      <span className="text-3xl">🎨</span>
                      <span>生成角色图像</span>
                    </button>
                  )}
                </div>
              )}

              {/* 错误提示 */}
              {draft.error && (
                <p className="text-red-600 text-xs font-mono bg-red-50 p-2 border border-red-200">
                  {draft.error}
                </p>
              )}
            </div>
          </div>
        ))}

        {/* 添加角色卡片 */}
        <button
          onClick={addDraft}
          className="retro-card border-3 border-dashed border-ink/30 min-h-[300px] flex flex-col items-center justify-center gap-3 hover:border-ink hover:bg-cream-dark transition-all cursor-pointer"
        >
          <span className="text-5xl text-ink/30">+</span>
          <span className="font-mono uppercase text-ink/50">添加角色</span>
        </button>
      </div>

      {/* 底部操作栏 */}
      <div className="flex items-center justify-between">
        <button
          onClick={handleBack}
          className="btn-retro-outline flex items-center gap-2"
        >
          <span>←</span>
          上一步
        </button>

        <div className="retro-card-dark px-4 py-3 flex items-center gap-3">
          <span className="text-accent text-xl">☞</span>
          <p className="text-sm text-cream/80 font-mono">
            已创建 {validCount} 个角色
          </p>
        </div>

        <button
          onClick={handleNext}
          disabled={validCount === 0}
          className={`
            btn-retro flex items-center gap-2
            ${validCount === 0 && "opacity-50 cursor-not-allowed hover:translate-x-0 hover:translate-y-0 hover:shadow-retro"}
          `}
        >
          下一步
          <span className="text-xl">→</span>
        </button>
      </div>

      {/* 底部装饰 */}
      <div className="flex justify-center gap-2">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className={`w-3 h-3 border-2 border-cream/30 ${i === 2 ? "bg-cream" : ""
              }`}
          />
        ))}
      </div>
    </div>
  );
}

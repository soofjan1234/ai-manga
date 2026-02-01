"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useStory } from "@/lib/store";
import { exportMangaAsLongStrip } from "@/lib/export";

interface NavItem {
  label: string;
  href: string;
  step: number;
}

const navItems: NavItem[] = [
  { label: "背景", href: "/background", step: 1 },
  { label: "角色", href: "/characters", step: 2 },
  { label: "创作", href: "/manga", step: 3 },
];

export default function Navigation() {
  const pathname = usePathname();
  const { state, resetStory, setFinished } = useStory();

  const getCurrentStep = () => {
    const index = navItems.findIndex((item) => item.href === pathname);
    return index >= 0 ? index + 1 : 1;
  };

  const currentStep = getCurrentStep();

  const handleReset = () => {
    if (confirm("确定要重置所有内容吗？这将清除所有角色和漫画进度。")) {
      resetStory();
    }
  };

  const handleExport = async () => {
    await exportMangaAsLongStrip(state.episodes, "我的AI漫剧作品");
  };

  const handleFinish = () => {
    setFinished(true);
    alert("🎉 恭喜完结！请使用导出功能保存你的作品。");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50">
      <div className="mx-4 mt-4">
        <div className="max-w-4xl mx-auto retro-card px-6 py-3">
          <div className="grid grid-cols-3 items-center">
            {/* Left: Logo */}
            <div className="flex justify-start">
              <Link
                href="/"
                className="flex items-center gap-3 cursor-pointer group"
              >
                <div className="relative">
                  <div className="w-10 h-10 bg-accent border-3 border-ink flex items-center justify-center shadow-retro group-hover:translate-x-[2px] group-hover:translate-y-[2px] group-hover:shadow-none transition-all">
                    <span className="font-heading font-bold text-xl text-ink">漫</span>
                  </div>
                </div>
                <div className="hidden sm:block">
                  <span className="font-heading font-bold text-lg text-ink block leading-tight">
                    AI 漫剧
                  </span>
                </div>
              </Link>
            </div>

            {/* Center: Step Navigation */}
            <div className="flex items-center justify-center gap-0">
              {navItems.map((item, index) => {
                const isActive = pathname === item.href;
                const isPast = item.step < currentStep;

                return (
                  <div key={item.href} className="flex items-center">
                    <Link
                      href={item.href}
                      className="flex items-center gap-2 group cursor-pointer"
                    >
                      <div
                        className={
                          isActive
                            ? "step-retro-active w-8 h-8 text-sm"
                            : isPast
                              ? "step-retro-done w-8 h-8 text-sm"
                              : "step-retro-inactive w-8 h-8 text-sm"
                        }
                      >
                        {item.step}
                      </div>
                      <span
                        className={`
                          hidden sm:inline font-mono text-sm uppercase tracking-wider whitespace-nowrap
                          ${isActive ? "text-ink font-bold" : isPast ? "text-ink/70" : "text-ink/40"}
                        `}
                      >
                        {item.label}
                      </span>
                    </Link>
                    {index < navItems.length - 1 && (
                      <div
                        className={`
                          w-4 sm:w-8 h-[2px] mx-1 sm:mx-2
                          ${isPast ? "bg-ink" : "bg-ink/20"}
                        `}
                      />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Right: Icon Actions */}
            <div className="flex justify-end items-center gap-2">
              {/* Reset (Always visible) */}
              <button
                onClick={handleReset}
                className="group relative w-10 h-10 flex items-center justify-center border-2 border-ink/20 hover:border-red-600 bg-cream hover:bg-red-50 text-ink/40 hover:text-red-600 transition-all shadow-[2px_2px_0_0_rgba(0,0,0,0.1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]"
              >
                <span className="text-xl font-bold leading-none">✕</span>
                {/* Custom Tooltip */}
                <span className="absolute top-full mt-2 right-0 px-2 py-1 bg-ink text-cream text-xs font-mono rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                  重置所有
                </span>
              </button>

              {/* Only show Export & Finish on Manga page */}
              {pathname === "/manga" && (
                <>
                  <button
                    onClick={handleExport}
                    className="group relative w-10 h-10 flex items-center justify-center border-2 border-ink bg-cream hover:bg-accent/20 text-ink transition-all shadow-[2px_2px_0_0_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]"
                  >
                    <span className="text-xl font-bold leading-none">⬇</span>
                    <span className="absolute top-full mt-2 right-0 px-2 py-1 bg-ink text-cream text-xs font-mono rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                      导出长图
                    </span>
                  </button>
                  <button
                    onClick={handleFinish}
                    className="group relative w-10 h-10 flex items-center justify-center border-3 border-ink bg-accent hover:bg-accent/80 text-ink transition-all shadow-retro hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]"
                  >
                    <span className="text-2xl font-bold leading-none">✓</span>
                    <span className="absolute top-full mt-2 right-0 px-2 py-1 bg-accent text-ink text-xs font-mono font-bold border-2 border-ink rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                      完结作品
                    </span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

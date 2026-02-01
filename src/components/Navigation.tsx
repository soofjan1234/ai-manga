"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

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

  const getCurrentStep = () => {
    const index = navItems.findIndex((item) => item.href === pathname);
    return index >= 0 ? index + 1 : 1;
  };

  const currentStep = getCurrentStep();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50">
      <div className="mx-4 mt-4">
        <div className="max-w-4xl mx-auto retro-card px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center gap-3 cursor-pointer group"
            >
              {/* 漫画风格 Logo */}
              <div className="relative">
                <div className="w-12 h-12 bg-accent border-3 border-ink flex items-center justify-center shadow-retro group-hover:translate-x-[2px] group-hover:translate-y-[2px] group-hover:shadow-none transition-all">
                  <span className="font-heading font-bold text-2xl text-ink">漫</span>
                </div>
              </div>
              <div>
                <span className="font-heading font-bold text-xl text-ink block leading-tight">
                  AI 漫剧
                </span>
                <span className="font-mono text-xs text-ink/60 uppercase tracking-wider">
                  Interactive Comic
                </span>
              </div>
            </Link>

            {/* Step Navigation */}
            <div className="flex items-center gap-0">
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
                            ? "step-retro-active"
                            : isPast
                            ? "step-retro-done"
                            : "step-retro-inactive"
                        }
                      >
                        {item.step}
                      </div>
                      <span
                        className={`
                          hidden sm:inline font-mono text-sm uppercase tracking-wider
                          ${isActive ? "text-ink font-bold" : isPast ? "text-ink/70" : "text-ink/40"}
                        `}
                      >
                        {item.label}
                      </span>
                    </Link>
                    {index < navItems.length - 1 && (
                      <div
                        className={`
                          w-8 h-[3px] mx-2
                          ${isPast ? "bg-ink" : "bg-ink/20"}
                        `}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

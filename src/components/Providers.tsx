"use client";

import { StoryProvider } from "@/lib/store";
import { ReactNode } from "react";

export default function Providers({ children }: { children: ReactNode }) {
  return <StoryProvider>{children}</StoryProvider>;
}

import { NextRequest, NextResponse } from "next/server";
import { generateCharacterImage, suggestCharacters } from "@/lib/gemini";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, name, description, background, style, colorMode } = body;

    if (action === "generate") {
      // 生成单个角色图像
      if (!name || !description) {
        return NextResponse.json(
          { error: "缺少角色名称或描述" },
          { status: 400 }
        );
      }

      const imageUrl = await generateCharacterImage(
        name,
        description,
        colorMode || "color"
      );

      return NextResponse.json({ imageUrl });
    }

    if (action === "suggest") {
      // 根据背景建议角色
      if (!background) {
        return NextResponse.json(
          { error: "缺少故事背景" },
          { status: 400 }
        );
      }

      const characters = await suggestCharacters(background, style || "");

      return NextResponse.json({ characters });
    }

    return NextResponse.json(
      { error: "未知操作" },
      { status: 400 }
    );
  } catch (error) {
    console.error("角色生成错误:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "生成失败" },
      { status: 500 }
    );
  }
}

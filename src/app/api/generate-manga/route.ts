import { NextRequest, NextResponse } from "next/server";
import { generateMangaPage, Character, PreviousPageData } from "@/lib/gemini";

export async function POST(req: NextRequest) {
    try {
        const {
            prompt,
            characters,
            previousPage,
            generateEmptyBubbles,
            style
        }: {
            prompt: string;
            characters?: Character[];
            previousPage?: PreviousPageData;
            generateEmptyBubbles?: boolean;
            style?: string;
        } = await req.json();

        if (!prompt) {
            return NextResponse.json(
                { error: "Prompt is required" },
                { status: 400 }
            );
        }

        const imageBase64 = await generateMangaPage(
            prompt,
            characters,
            previousPage,
            generateEmptyBubbles,
            style
        );

        return NextResponse.json({ image: imageBase64 });
    } catch (error: any) {
        console.error("Generate manga error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to generate manga" },
            { status: 500 }
        );
    }
}

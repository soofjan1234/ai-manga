import { NextResponse } from "next/server";
import { suggestFirstEpisode } from "@/lib/gemini";

export async function POST(req: Request) {
    try {
        const { background, style, characters } = await req.json();

        if (!background) {
            return NextResponse.json(
                { error: "Background is required" },
                { status: 400 }
            );
        }

        const outline = await suggestFirstEpisode(
            background,
            style,
            characters
        );

        return NextResponse.json({ outline });
    } catch (error) {
        console.error("Error suggesting first episode:", error);
        return NextResponse.json(
            { error: "Failed to fetch first episode suggestion" },
            { status: 500 }
        );
    }
}

import { NextResponse } from "next/server";
import { suggestStoryOptions } from "@/lib/gemini";

export async function POST(req: Request) {
    try {
        const { background, style, lastEpisodeOutline, characters } = await req.json();

        if (!background) {
            return NextResponse.json(
                { error: "Background is required" },
                { status: 400 }
            );
        }

        const options = await suggestStoryOptions(
            background,
            style,
            lastEpisodeOutline,
            characters
        );

        return NextResponse.json({ options });
    } catch (error) {
        console.error("Error suggesting options:", error);
        return NextResponse.json(
            { error: "Failed to fetch suggestions" },
            { status: 500 }
        );
    }
}

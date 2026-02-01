import { NextRequest, NextResponse } from "next/server";
import { polishBackground } from "@/lib/gemini";

export async function POST(req: NextRequest) {
    try {
        const { background, style } = await req.json();

        if (!background) {
            return NextResponse.json(
                { error: "Background text is required" },
                { status: 400 }
            );
        }

        const polishedText = await polishBackground(background, style);

        return NextResponse.json({ polishedText });
    } catch (error: any) {
        console.error("Polish background error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to polish background" },
            { status: 500 }
        );
    }
}

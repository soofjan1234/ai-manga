import { NextRequest, NextResponse } from "next/server";
import { generateBackground } from "@/lib/gemini";

export async function POST(req: NextRequest) {
    try {
        const { style } = await req.json();

        const generatedText = await generateBackground(style);

        return NextResponse.json({ generatedText });
    } catch (error: any) {
        console.error("Generate background error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to generate background" },
            { status: 500 }
        );
    }
}

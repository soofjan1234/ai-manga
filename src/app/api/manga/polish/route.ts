import { NextRequest, NextResponse } from "next/server";
import { polishOutline } from "@/lib/gemini";

export async function POST(req: NextRequest) {
    try {
        const { outline, style } = await req.json();

        if (!outline) {
            return NextResponse.json(
                { error: "Outline text is required" },
                { status: 400 }
            );
        }

        const polishedText = await polishOutline(outline, style);

        return NextResponse.json({ polishedText });
    } catch (error: any) {
        console.error("Polish outline error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to polish outline" },
            { status: 500 }
        );
    }
}

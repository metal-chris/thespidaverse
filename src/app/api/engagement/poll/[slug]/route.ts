import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { hashIP, getClientIP, isBot } from "@/lib/engagement/fingerprint";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await request.json();
    const { questionKey, answer, honeypot } = body;

    // Honeypot check
    if (isBot(honeypot)) {
      return NextResponse.json({ success: true, aggregated: {} });
    }

    // Validate required fields
    if (
      typeof questionKey !== "string" ||
      !questionKey.trim() ||
      typeof answer !== "string" ||
      !answer.trim()
    ) {
      return NextResponse.json(
        { error: "questionKey and answer are required." },
        { status: 400 }
      );
    }

    const ipHash = await hashIP(getClientIP(request));

    const { data, error } = await supabaseAdmin.rpc("submit_poll_response", {
      p_slug: slug,
      p_question_key: questionKey,
      p_answer: answer,
      p_ip: ipHash,
    });

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json(
          { success: false, reason: "already_answered" },
          { status: 409 }
        );
      }

      console.error("[Poll POST] Error:", error);
      return NextResponse.json(
        { error: "Failed to save response. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, aggregated: data });
  } catch (error) {
    console.error("[Poll POST] Unexpected error:", error);
    return NextResponse.json(
      { error: "Server error. Please try again later." },
      { status: 500 }
    );
  }
}

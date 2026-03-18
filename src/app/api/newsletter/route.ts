import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Email is required." },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email address." },
        { status: 400 }
      );
    }

    const { data: existing, error: checkError } = await supabaseAdmin
      .from("newsletter_subscribers")
      .select("email")
      .eq("email", email.toLowerCase())
      .single();

    if (existing) {
      return NextResponse.json(
        { error: "You're already subscribed!" },
        { status: 409 }
      );
    }

    const { error: insertError } = await supabaseAdmin
      .from("newsletter_subscribers")
      .insert({
        email: email.toLowerCase(),
        subscribed_at: new Date().toISOString(),
      });

    if (insertError) {
      console.error("[Newsletter] Supabase insert error:", insertError);
      return NextResponse.json(
        { error: "Failed to subscribe. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      ok: true, 
      message: "Thanks for subscribing! We'll keep you updated." 
    });
  } catch (error) {
    console.error("[Newsletter] Error:", error);
    return NextResponse.json(
      { error: "Server error. Please try again later." },
      { status: 500 }
    );
  }
}

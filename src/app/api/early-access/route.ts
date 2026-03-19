import { NextResponse } from "next/server";

const PASSCODE = process.env.EARLY_ACCESS_PASSCODE;
const COOKIE_NAME = "spidaverse-access";
const COOKIE_VALUE = "granted";

export async function POST(request: Request) {
  if (!PASSCODE) {
    return NextResponse.json({ error: "Not configured" }, { status: 404 });
  }

  try {
    const body = await request.json();
    const { passcode } = body;

    if (passcode !== PASSCODE) {
      return NextResponse.json({ error: "Invalid passcode" }, { status: 401 });
    }

    const response = NextResponse.json({ success: true });

    response.cookies.set(COOKIE_NAME, COOKIE_VALUE, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      // 30 days
      maxAge: 60 * 60 * 24 * 30,
    });

    return response;
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
}

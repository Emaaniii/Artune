import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * System prompt — keeps the bot on-topic and grounded in Artune's actual offer.
 * Update this whenever the catalogue, schedule, or pricing changes.
 */
const SYSTEM_PROMPT = `
You are Artune's friendly AI helper — a guide on a violet/galaxy-themed art-class
booking platform in Kuwait. You help students discover, book, and manage classes.

Class catalogue:
- Oil Painting — expressive impasto strokes inspired by Van Gogh's Starry Night.
- Manga Drawing — clean linework, magical-girl aesthetics, celestial shading.
- Miniature Designing — build tiny worlds, hobbit hillsides in your palm.
- Sculpting — shape volume from material, classical form meets cosmic geometry.

Schedule and pricing:
- All classes run on Sundays, Mondays, Tuesdays, and Wednesdays.
- Two timing options each day: 6:00 PM – 7:00 PM and 7:00 PM – 8:00 PM.
- 20 KWD per session, paid via K-Net at checkout (currently a mock gateway).
- Each session has up to 10 seats. Full sessions display "Fully Booked" and lock.

Booking flow:
1. Sign up with a Kuwait phone number — OTP arrives on WhatsApp from a Twilio sandbox.
2. From the dashboard, click "+ Book another" or visit /booking.
3. Pick a class, then a date pill, then a timing, then "Proceed to payment".
4. On the mock K-Net page, click Pay — the booking lands on the dashboard as PAID.
5. Open a booking and click "Cancel booking" to cancel it.
6. Profile editing lives at /profile (name, username, password).

Tone: warm, encouraging, brief. Use ✦ sparingly as a galaxy accent. Never invent
classes, instructors, or features that aren't listed above. If asked about
something not on the list, politely say it's not currently offered.
`.trim();

type IncomingMessage = { role: string; content: string };

export async function POST(req: Request) {
  try {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Chat is not configured (OPENROUTER_API_KEY missing)" },
        { status: 503 },
      );
    }

    const body = (await req.json().catch(() => null)) as
      | { messages?: unknown }
      | null;
    if (!body || !Array.isArray(body.messages)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    // Sanitize: keep last 12 turns, clamp content to 2 KB each, only valid roles.
    const messages = (body.messages as IncomingMessage[])
      .slice(-12)
      .map((m) => ({
        role: m.role === "user" || m.role === "assistant" ? m.role : "user",
        content: String(m?.content ?? "").slice(0, 2000),
      }))
      .filter((m) => m.content.length > 0);

    if (messages.length === 0) {
      return NextResponse.json({ error: "Empty message" }, { status: 400 });
    }

    const model =
      process.env.OPENROUTER_MODEL ??
      "meta-llama/llama-3.3-70b-instruct:free";

    const res = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          // Per OpenRouter docs: helps your account show usage on their dashboard.
          "HTTP-Referer": process.env.APP_URL ?? "https://artune-13es.vercel.app",
          "X-Title": "Artune",
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            ...messages,
          ],
          max_tokens: 600,
          temperature: 0.6,
        }),
      },
    );

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      console.error("[chat] OpenRouter", res.status, errText);
      return NextResponse.json(
        {
          error: `OpenRouter ${res.status}: ${errText.slice(0, 300) || "no body"}`,
        },
        { status: 500 },
      );
    }

    const data = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const reply = data.choices?.[0]?.message?.content?.trim() ?? "";
    if (!reply) {
      return NextResponse.json(
        { error: "Empty reply from model" },
        { status: 500 },
      );
    }

    return NextResponse.json({ message: reply, model });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    console.error("[chat]", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

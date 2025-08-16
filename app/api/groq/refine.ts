// app/api/groq/refine/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "firebase-admin/auth";
import { adminDb } from "@/lib/firebaseAdmin"; // your firebase-admin init
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY!,
});

export async function POST(req: NextRequest) {
  try {
    const { sessionId, text, mode } = await req.json();

    if (!sessionId || !text || !mode) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const idToken = authHeader.split("Bearer ")[1];
    const decoded = await getAuth().verifyIdToken(idToken);

    // fetch account doc to check if pro
    const accountSnap = await adminDb.collection("accounts").doc(decoded.uid).get();
    if (!accountSnap.exists || accountSnap.data()?.accountType !== "pro") {
      return NextResponse.json({ error: "Pro account required" }, { status: 403 });
    }

    const promptMap: Record<string, string> = {
      summarize: "Summarize this text clearly:",
      elaborate: "Elaborate and expand on this text:",
      formalize: "Rewrite this text in a more formal style:",
      shorten: "Rewrite this text in a shorter form:",
    };

    const prompt = `${promptMap[mode]}\n\n${text}`;
    const completion = await groq.chat.completions.create({
      model: "llama3-8b-8192", // cheap & good for text ops
      messages: [{ role: "user", content: prompt }],
    });

    const refinedText = completion.choices[0]?.message?.content?.trim();
    if (!refinedText) {
      return NextResponse.json({ error: "LLM returned empty text" }, { status: 500 });
    }

    return NextResponse.json({ success: true, refinedText });
  } catch (err) {
    console.error("Refine API error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

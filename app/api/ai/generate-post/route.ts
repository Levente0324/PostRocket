import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { GoogleGenAI } from "@google/genai";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Nem vagy bejelentkezve" },
        { status: 401 },
      );
    }

    // Rate limit: max 10 AI generation requests per minute via API
    const oneMinuteAgo = new Date(Date.now() - 60_000).toISOString();
    const { count: recentGenerations } = await supabase
      .from("usage_logs")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("action", "ai_generate_api")
      .gte("created_at", oneMinuteAgo);

    if ((recentGenerations ?? 0) >= 10) {
      return NextResponse.json(
        { error: "Túl sok AI generálási kérés. Kérlek, várj egy percet." },
        { status: 429 },
      );
    }

    await supabase.from("usage_logs").insert({
      user_id: user.id,
      action: "ai_generate_api",
    });

    const body = await req.json();
    const { prompt: rawPrompt, platform: rawPlatform, tone: rawTone } = body;

    // Enforce input length limits to prevent oversized payloads
    const prompt =
      typeof rawPrompt === "string" ? rawPrompt.slice(0, 2000) : "";
    const platform =
      typeof rawPlatform === "string" ? rawPlatform.slice(0, 50) : "";
    const tone = typeof rawTone === "string" ? rawTone.slice(0, 100) : "";

    if (!prompt) {
      return NextResponse.json(
        { error: "A prompt megadása kötelező" },
        { status: 400 },
      );
    }

    // Fetch user AI options/context
    const { data: profile } = await supabase
      .from("profiles")
      .select("ai_options, plan, subscription_status")
      .eq("id", user.id)
      .single();

    // Verify Pro/Elite access
    const isPro = profile?.plan === "pro" || profile?.plan === "elite";
    const isActive = ["active", "trialing"].includes(
      profile?.subscription_status || "inactive",
    );

    if (!isPro || !isActive) {
      return NextResponse.json(
        { error: "Az AI funkció csak Pro csomaggal érhető el!" },
        { status: 403 },
      );
    }

    const geminiKey = process.env.GEMINI_API_KEY;
    if (!geminiKey) {
      return NextResponse.json(
        { error: "Az AI generálás átmenetileg nem elérhető." },
        { status: 503 },
      );
    }
    const ai = new GoogleGenAI({ apiKey: geminiKey });

    const businessContext = profile?.ai_options
      ? `\nKontextus a vállalkozásról és a stílusról:\n${profile.ai_options}\n`
      : "";

    const toneInstruction =
      tone && tone !== "Szakmai"
        ? `Kifejezetten erre a hangnemre törekedj: ${tone.toUpperCase()}. `
        : "A hangnem legyen profi, szakmai, de közösségi médiába illő.";

    const systemInstruction = `Te egy profi magyar social media menedzser vagy, akinek az a feladata, hogy a lehető legvonzóbb, konverzió fókuszált ${platform} posztokat írd meg. ${toneInstruction} Használd a megadott kontextust (ha van) és írj közvetlenül egy kész, azonnal posztolható szöveget (ne írj bevezetőt, sem üdvözlést, csakis a poszt szövegét hasznos hashtagekkel együtt). Használj emojikat a platformnak megfelelően. A nyelv kizárólag MAGYAR.`;

    const fullPrompt = `${systemInstruction}\n${businessContext}\nFelhasználó kérése a poszttal kapcsolatban:\n${prompt}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: fullPrompt,
    });

    const generatedText = response.text;

    return NextResponse.json({ text: generatedText });
  } catch (error: any) {
    console.error("AI Generation Error:", error);
    return NextResponse.json(
      { error: "Hiba történt az AI generálás során." },
      { status: 500 },
    );
  }
}

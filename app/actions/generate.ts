"use server";

import { GoogleGenAI } from "@google/genai";
import { createClient } from "@/lib/supabase/server";

export async function generatePostAction(params: {
  topic: string;
  tone: string;
  audience: string;
}) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { error: "Unauthorized" };
    }

    // Check usage limits
    const { data: profile } = await supabase
      .from("profiles")
      .select("monthly_post_limit, plan")
      .eq("id", user.id)
      .single();

    if (profile?.plan !== "Business") {
      const { count } = await supabase
        .from("posts")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .gte("created_at", new Date(new Date().setDate(1)).toISOString()); // First of month

      if (
        count !== null &&
        profile?.monthly_post_limit &&
        count >= profile.monthly_post_limit
      ) {
        return {
          error: "Monthly post limit reached. Please upgrade your plan.",
        };
      }
    }

    const ai = new GoogleGenAI({
      apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY!,
    });

    const prompt = `
      You are an expert social media manager and copywriter for a premium brand.
      Create a highly engaging, high-converting social media caption based on the following:
      
      Topic/Promotion: ${params.topic}
      Tone: ${params.tone}
      Target Audience: ${params.audience}
      
      Requirements:
      - Write a compelling hook.
      - Keep it concise but impactful.
      - Include relevant emojis.
      - Add 5-7 highly relevant, SEO-optimized hashtags at the end.
      - Do not include any introductory or concluding remarks, just the caption itself.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });

    const caption = response.text || "Failed to generate caption.";

    // Placeholder for image generation
    // In a real app, you would call an image generation API here (e.g., OpenAI DALL-E or Gemini Image)
    // For now, we'll return a placeholder image URL based on the topic
    const imageUrl = `https://picsum.photos/seed/${encodeURIComponent(params.topic.slice(0, 10))}/800/800`;

    // Save to DB
    const { data: post, error } = await supabase
      .from("posts")
      .insert({
        user_id: user.id,
        caption,
        image_url: imageUrl,
        status: "draft",
      })
      .select()
      .single();

    if (error) {
      console.error("Error saving post:", error);
      return { error: "Failed to save post to database." };
    }

    // Log usage
    await supabase.from("usage_logs").insert({
      user_id: user.id,
      action: "generate_post",
    });

    return { data: { caption, imageUrl } };
  } catch (error: any) {
    console.error("Generation error:", error);
    return { error: error.message || "An error occurred during generation." };
  }
}

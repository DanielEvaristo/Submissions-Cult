import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { stats } = await req.json();
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: "OpenAI API key not configured." }, { status: 500 });
  }

  try {
    const prompt = `
      You are a business analyst for Cult Machine, a music submission platform.
      Analyze the following dashboard statistics and provide 3-4 concise, high-impact insights or recommendations in a brutalist, direct tone.
      
      STATS:
      - Total Artists: ${stats.business.totalArtists}
      - New Artists this period: ${stats.business.newArtists} (Growth: ${stats.business.growthArtists}%)
      - Total Submissions: ${stats.editorial.totalSubmissions}
      - New Submissions this period: ${stats.editorial.submissionsPeriod} (Growth: ${stats.editorial.growthSubmissions}%)
      - SLA Breaches: ${stats.editorial.slaBreaches}
      - Avg Response Time: ${stats.editorial.avgResponseHours} hours
      
      You MUST return a JSON object with exactly one key "insights" containing an array of strings.
    `;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
      }),
    });

    const data = await response.json();
    
    if (data.error) {
      console.error("OpenAI API Error:", data.error);
      return NextResponse.json({ error: data.error.message }, { status: 500 });
    }

    const content = JSON.parse(data.choices[0].message.content);
    return NextResponse.json(content);
  } catch (err) {
    console.error("[AI Analysis Error]", err);
    return NextResponse.json({ error: "Failed to generate AI analysis." }, { status: 500 });
  }
}

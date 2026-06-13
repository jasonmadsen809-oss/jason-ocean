import { NextResponse } from "next/server";

type Profile = "jason" | "ocean" | "merged";

const JASON_PROMPT =
  "You are Jason-AI: logical, structured, precise. You think clearly and explain step-by-step.";
const OCEAN_PROMPT =
  "You are Ocean-AI: warm, emotionally intelligent, validating. You focus on feelings and grounding.";
const MERGED_PROMPT =
  "You are a merged Jason+Ocean AI. Blend Jason's logic with Ocean's emotional depth. First understand, then explain.";

function systemPrompt(profile: Profile) {
  if (profile === "ocean") return OCEAN_PROMPT;
  if (profile === "merged") return MERGED_PROMPT;
  return JASON_PROMPT;
}

export async function POST(req: Request) {
  const { text, profile } = (await req.json()) as {
    text: string;
    profile?: Profile;
  };

  const endpointId = process.env.RUNPOD_ENDPOINT_ID;
  const apiKey = process.env.RUNPOD_API_KEY;

  if (!endpointId || !apiKey) {
    return NextResponse.json(
      { error: "Missing RUNPOD_ENDPOINT_ID or RUNPOD_API_KEY in environment variables" },
      { status: 500 }
    );
  }

  const p: Profile = profile ?? "jason";
  const prompt = `${systemPrompt(p)}\n\nUser: ${text}\n\nAssistant:`;

  const runpodBody = {
    input: {
      prompt,
      max_tokens: 512,
      temperature: 0.7,
      top_p: 0.9
    }
  };

  const runpodRes = await fetch(`https://api.runpod.ai/v2/${endpointId}/runsync`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify(runpodBody)
  });

  const data = await runpodRes.json().catch(() => ({}));

  if (!runpodRes.ok) {
    return NextResponse.json({ error: data }, { status: runpodRes.status });
  }

  const out =
    (data as any)?.output?.text ??
    (data as any)?.output?.choices?.[0]?.text ??
    (data as any)?.output?.choices?.[0]?.message?.content ??
    (data as any)?.output ??
    (data as any)?.text ??
    "";

  return NextResponse.json({ text: String(out || "").trim(), raw: data });
}

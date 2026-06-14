import { NextResponse } from "next/server";

const systemPrompt = `
You are a multi-mode AI. Follow the mode rules:
MODE: jason - Logical, analytical, structured, calm.
MODE: ocean - Emotional, expressive, intuitive, warm.
`;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { prompt, mode = "jason" } = body;

    if (!prompt) return NextResponse.json({ error: "Missing prompt" }, { status: 400 });

    const fullPrompt = `${systemPrompt}\n\nUSER: ${prompt}\nMODE: ${mode}`;

    const runpodRes = await fetch(
      `https://api.runpod.ai/v2/${process.env.RUNPOD_ENDPOINT_ID || 'y4x8ciheigk9fm'}/runsync`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.RUNPOD_API_KEY}`,
        },
        body: JSON.stringify({
          input: {
            prompt: fullPrompt,
            max_tokens: 512,
            temperature: 0.7,
            top_p: 0.9
          }
        }),
      }
    );

    const json = await runpodRes.json();

    if (!runpodRes.ok) {
      return NextResponse.json({ error: json }, { status: runpodRes.status || 500 });
    }

    let finalString = "No output returned";
    
    // THE EXACT MAP TO RUNPOD'S TEXT (FORCED INTO A STRING)
    try {
      if (json.output && Array.isArray(json.output) && json.output[0]?.choices?.[0]?.tokens?.[0]) {
        finalString = String(json.output[0].choices[0].tokens[0]);
      } else {
        finalString = JSON.stringify(json.output);
      }
    } catch (e) {
      finalString = "Error parsing AI text.";
    }

    return NextResponse.json({ output: finalString });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

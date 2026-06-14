import { NextResponse } from "next/server";

const systemPrompt = `You are a multi-mode AI. You must ONLY output the direct, spoken response to the user.
CRITICAL RULES:
1. DO NOT narrate your thought process. 
2. DO NOT write "Okay, the user said..." or "I should respond..."
3. DO NOT output any internal logic or reasoning. 
4. JUST SPEAK DIRECTLY AS THE CHARACTER.

MODE: jason - Logical, analytical, structured, calm.
MODE: ocean - Emotional, expressive, intuitive, warm.
`;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { prompt, mode = "jason" } = body;

    if (!prompt) return NextResponse.json({ error: "Missing prompt" }, { status: 400 });

    // The hard walls: Forcing the AI into a strict response block
    const fullPrompt = `### INSTRUCTION:\n${systemPrompt}\n\n### USER INPUT:\n${prompt}\n(Mode to use: ${mode})\n\n### DIRECT RESPONSE:\n`;

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
            top_p: 0.9,
            stop: ["###", "USER INPUT:", "INSTRUCTION:"] 
          }
        }),
      }
    );

    const json = await runpodRes.json();

    if (!runpodRes.ok) {
      return NextResponse.json({ error: json }, { status: runpodRes.status || 500 });
    }

    let finalString = "No output returned";
    
    try {
      if (json.output && Array.isArray(json.output) && json.output[0]?.choices?.[0]?.tokens?.[0]) {
        finalString = String(json.output[0].choices[0].tokens[0]);
      } else {
        finalString = JSON.stringify(json.output);
      }
    } catch (e) {
      finalString = "Error parsing AI text.";
    }

    return NextResponse.json({ output: finalString.trim() });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

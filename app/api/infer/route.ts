import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { prompt, mode = "jason" } = body;

    if (!prompt) return NextResponse.json({ error: "Missing prompt" }, { status: 400 });

    // Ensure the name is capitalized for the script
    const characterName = mode.charAt(0).toUpperCase() + mode.slice(1);

    // The inescapable "Movie Script" format
    const fullPrompt = `System: You are an AI roleplaying as specific characters. You must ONLY output the exact spoken dialogue of the character. You do not think out loud. You do not narrate.
Jason is logical, analytical, structured, and calm.
Ocean is emotional, expressive, intuitive, and warm.

User: ${prompt}
${characterName}:`;

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
            max_tokens: 300,
            temperature: 0.7,
            top_p: 0.9,
            stop: ["\nUser:", "User:", "System:"] // Forces it to shut up if it tries to play both sides
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

    // Clean up any weird spaces the AI tries to add at the beginning
    return NextResponse.json({ output: finalString.trim() });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

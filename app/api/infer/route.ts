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

    if (!prompt) {
      return NextResponse.json({ error: "Missing prompt" }, { status: 400 });
    }

    // TRIPWIRE 1: Did Vercel load anything at all?
    if (!process.env.RUNPOD_API_KEY) {
      return NextResponse.json({ error: "CRITICAL FAILURE: Vercel is completely missing the API Key." }, { status: 500 });
    }

    const fullPrompt = `${systemPrompt}\n\nUSER: ${prompt}\nMODE: ${mode}`;

    const payload = {
      input: {
        prompt: fullPrompt,
        max_tokens: 512,
        temperature: 0.7,
        top_p: 0.9
      },
    };

    const runpodRes = await fetch(
      `https://api.runpod.ai/v2/${process.env.RUNPOD_ENDPOINT_ID || 'y4x8ciheigk9fm'}/runsync`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.RUNPOD_API_KEY}`,
        },
        body: JSON.stringify(payload),
      }
    );

    const json = await runpodRes.json();

    if (!runpodRes.ok) {
      // TRIPWIRE 2: If RunPod rejects it, tell us exactly what key Vercel tried to use.
      const keySnippet = process.env.RUNPOD_API_KEY 
        ? `${process.env.RUNPOD_API_KEY.substring(0, 4)}...${process.env.RUNPOD_API_KEY.slice(-4)}`
        : "undefined";
        
      return NextResponse.json(
        { 
          error: json,
          debugInfo: `Vercel tried to use a key starting with: ${keySnippet}`
        },
        { status: runpodRes.status || 500 }
      );
    }

    let finalOutput = "No output returned from RunPod";
    
    if (json.output) {
      if (typeof json.output === "string") {
        finalOutput = json.output;
      } else if (Array.isArray(json.output)) {
        finalOutput = json.output.join("\n");
      } else if (json.output.text) {
        finalOutput = Array.isArray(json.output.text) ? json.output.text.join("\n") : json.output.text;
      } else if (json.output.choices && json.output.choices[0]?.text) {
        finalOutput = json.output.choices[0].text;
      } else {
        finalOutput = JSON.stringify(json.output, null, 2);
      }
    }

    return NextResponse.json({ output: finalOutput.trim() });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}

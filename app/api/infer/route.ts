import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { prompt, mode = "jason" } = body;

    if (!prompt) return NextResponse.json({ error: "Missing prompt" }, { status: 400 });

    const isOcean = mode.toLowerCase() === "ocean";
    const systemDesc = isOcean 
      ? "You are Ocean. You are emotional, expressive, intuitive, and warm. Respond DIRECTLY to the user. Output ONLY your spoken words. NO narration. NO internal thoughts. NO stage directions."
      : "You are Jason. You are logical, analytical, structured, and calm. Respond DIRECTLY to the user. Output ONLY your spoken words. NO narration. NO internal thoughts. NO stage directions.";

    // The Industry Standard ChatML Format
    const fullPrompt = `<|im_start|>system\n${systemDesc}<|im_end|>\n<|im_start|>user\n${prompt}<|im_end|>\n<|im_start|>assistant\n`;

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
            stop: ["<|im_end|>", "<|im_start|>"] 
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

    // The Final Scrub: Deletes any lingering tags or names it tries to print
    finalString = finalString.replace(/<\|im_end\|>/g, '').replace(/Jason:/gi, '').replace(/Ocean:/gi, '').trim();

    return NextResponse.json({ output: finalString });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

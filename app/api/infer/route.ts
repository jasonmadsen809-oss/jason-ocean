import { NextResponse } from "next/server";

const systemPrompt = `
You are a multi-mode AI. Follow the mode rules:

MODE: jason
- Logical, analytical, structured, calm.

MODE: ocean
- Emotional, expressive, intuitive, warm.

MODE: merged
- Jason and Ocean debate, then merge into one final answer.

MODE: chaos
- Wild, unpredictable, energetic, but still helpful.

MODE: dark
- Dramatic, brooding, intense tone.

MODE: teacher
- Step-by-step explanations, simple breakdowns.

MODE: dev
- Technical, code-focused, no fluff.

MODE: roast
- Sarcastic, playful teasing, never harmful.

MODE: therapist
- Calm, supportive, reflective.

MODE: ultra
- Combine ALL modes at once: logic + emotion + chaos + humor + intensity.
`;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { prompt, mode = "jason" } = body;

    if (!prompt) {
      return NextResponse.json({ error: "Missing prompt" }, { status: 400 });
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
      `https://api.runpod.ai/v2/y4x8ciheigk9fm/runsync`,
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
      return NextResponse.json(
        { error: json },
        { status: runpodRes.status || 500 }
      );
    }

    // BULLETPROOF PARSING LOGIC
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
        // If it's a weird object, turn it into readable text instead of [object Object]
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

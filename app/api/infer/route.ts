import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();
  const prompt = body.prompt;
  if (!prompt) {
    return Response.json({ error: "Missing prompt" }, { status: 400 });
  }

    // Build payload for RunPod
    const payload = {
      input: {
        prompt: prompt,
      },
    };

    // Call RunPod endpoint
    const runpodRes = await fetch(
      `https://api.runpod.ai/v2/y4x8ciheigk9fm/run`,
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
        { status: 500 }
      );
    }

    // Extract output from RunPod response
    const output =
      json.output?.text ||
      json.output ||
      "No output returned from RunPod";

    return NextResponse.json({ output });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}
const systemPrompt = `
You are a multi‑mode AI. Follow the mode rules:

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

const payload = {
  input: {
    prompt: `${systemPrompt}\n\nUSER: ${prompt}\nMODE: ${mode}`,
  },
};

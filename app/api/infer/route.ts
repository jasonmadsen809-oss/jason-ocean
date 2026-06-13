import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json(
        { error: "Missing prompt" },
        { status: 400 }
      );
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

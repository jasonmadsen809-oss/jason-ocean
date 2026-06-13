export type AIProfile = 'jason' | 'ocean' | 'merged';

export async function sendMessageToAI(text: string, profile: AIProfile) {
  const res = await fetch('/api/infer', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt: text,
      profile: profile,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`AI error ${res.status}: ${err}`);
  }

  const data = await res.json();
  return { text: data.output };
}

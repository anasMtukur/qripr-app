import { RefineRequest } from "@/types";

export async function refineText({ text, provider = 'groq', action, userId }: RefineRequest) {
  try {
    const res = await fetch('/api/refine', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, provider, action, userId }),
    });

    if (!res.ok) {
      throw new Error(`Request failed with ${res.status}`);
    }

    const data = await res.json();
    console.log('data', data);
    
    return data;
  } catch (err: any) {
    console.error('Error refining text', err);
    throw err;
  }
}

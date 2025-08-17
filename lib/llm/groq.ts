import Groq from 'groq-sdk';

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function groqRefine(text: string, action: string): Promise<string> {
  const prompt = buildPrompt(text, action);

  const completion = await client.chat.completions.create({
    model: 'llama3-8b-8192',
    messages: [
      { role: 'system', content: 'You are a helpful text refinement assistant.' },
      { role: 'user', content: prompt },
    ],
    temperature: 0.7,
    max_tokens: 800,
  });

  return completion.choices[0]?.message?.content?.trim() || '';
}

function buildPrompt(text: string, action: string) {
  switch (action) {
    case 'summarize':
      return `Summarize the following text:\n\n${text}`;
    case 'elaborate':
      return `Expand and elaborate on the following text:\n\n${text}`;
    case 'formalize':
      return `Rewrite the following text in a formal tone:\n\n${text}`;
    case 'shorten':
      return `Shorten this text but keep the core meaning:\n\n${text}`;
    default:
      return text;
  }
}

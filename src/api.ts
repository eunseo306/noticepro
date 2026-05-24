interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface Options {
  model?: string;
  maxTokens?: number;
  stream?: boolean;
  onChunk?: (text: string) => void;
}

export async function callAnthropic(messages: Message[], options: Options = {}): Promise<string> {
  const { model = 'gpt-4o', maxTokens = 1000, stream = false, onChunk } = options;

  const response = await fetch('/api/anthropic', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, max_tokens: maxTokens, stream, messages }),
  });

  if (!response.ok) throw new Error(`API error: ${response.status}`);

  if (stream && onChunk) {
    const reader = response.body!.getReader();
    const dec = new TextDecoder();
    let buf = '';
    let result = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += dec.decode(value, { stream: true });
      const lines = buf.split('\n');
      buf = lines.pop()!;
      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        const d = line.slice(6).trim();
        if (d === '[DONE]') continue;
        try {
          const p = JSON.parse(d);
          const text = p.choices?.[0]?.delta?.content;
          if (text) { result += text; onChunk(text); }
        } catch {}
      }
    }
    return result;
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

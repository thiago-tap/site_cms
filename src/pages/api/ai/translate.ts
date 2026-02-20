import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const env = locals.runtime.env as Env;
    if (!env.OPENAI_API_KEY) {
      return Response.json({ error: 'OPENAI_API_KEY não configurada.' }, { status: 503 });
    }
    const { content, targetLang = 'en' } = await request.json() as { content: string; targetLang?: string };
    if (!content?.trim()) return Response.json({ error: 'Conteúdo obrigatório.' }, { status: 400 });

    const langNames: Record<string, string> = { en: 'inglês', es: 'espanhol', fr: 'francês', de: 'alemão' };
    const langName = langNames[targetLang] ?? 'inglês';

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${env.OPENAI_API_KEY}` },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: `Traduza o texto Markdown a seguir para ${langName}. Preserve toda a formatação Markdown (títulos, listas, código, links). Retorne APENAS o texto traduzido.` },
          { role: 'user', content: content.slice(0, 12000) },
        ],
        max_tokens: 4000,
        temperature: 0.3,
      }),
    });

    if (!res.ok) return Response.json({ error: 'Erro na API da OpenAI.' }, { status: 502 });
    const json = await res.json() as { choices: { message: { content: string } }[] };
    const result = json.choices[0]?.message?.content?.trim() ?? '';
    return Response.json({ result });
  } catch (err) {
    return Response.json({ error: err instanceof Error ? err.message : 'Erro desconhecido' }, { status: 500 });
  }
};

import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const env = locals.runtime.env as Env;
    if (!env.OPENAI_API_KEY) {
      return Response.json({ error: 'OPENAI_API_KEY não configurada.' }, { status: 503 });
    }
    const { title, content } = await request.json() as { title: string; content: string };
    if (!title?.trim() && !content?.trim()) return Response.json({ error: 'Título ou conteúdo obrigatório.' }, { status: 400 });

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${env.OPENAI_API_KEY}` },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'Você é um especialista em SEO e copywriting para blogs de tecnologia em português brasileiro. Gere 5 sugestões de títulos alternativos para o post abaixo. Os títulos devem ser atrativos, claros e otimizados para SEO. Retorne APENAS os 5 títulos, um por linha, sem numeração ou pontuação extra.' },
          { role: 'user', content: `Título atual: ${title}\n\nConteúdo (resumo): ${(content || '').slice(0, 2000)}` },
        ],
        max_tokens: 400,
        temperature: 0.8,
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

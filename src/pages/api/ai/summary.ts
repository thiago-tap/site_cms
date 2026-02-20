import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request, locals }) => {
  const { content } = (await request.json()) as { content: string };

  if (!content?.trim()) {
    return Response.json({ error: 'Conteúdo não fornecido' }, { status: 400 });
  }

  const ai = locals.runtime?.env?.AI;
  if (!ai) {
    return Response.json({ error: 'Workers AI não disponível' }, { status: 503 });
  }

  const prompt = `Você é um assistente que escreve resumos de artigos técnicos em português brasileiro.
Leia o artigo abaixo e escreva um resumo conciso de 2-3 frases que capture os pontos principais.
Responda APENAS com o resumo, sem introdução ou conclusão.

ARTIGO:
${content.slice(0, 3000)}`;

  try {
    const response = await (ai as any).run('@cf/meta/llama-3-8b-instruct', {
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 256,
    }) as { response?: string };

    const summary = response?.response?.trim();
    if (!summary) return Response.json({ error: 'IA não retornou resultado' }, { status: 500 });

    return Response.json({ result: summary });
  } catch (err) {
    return Response.json({ error: 'Erro ao chamar Workers AI' }, { status: 500 });
  }
};

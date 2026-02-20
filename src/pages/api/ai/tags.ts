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

  const prompt = `Analise o artigo técnico abaixo e sugira entre 3 e 6 tags relevantes em inglês, lowercase, separadas por vírgula.
As tags devem ser palavras-chave técnicas relevantes para o conteúdo.
Responda APENAS com as tags separadas por vírgula, sem pontuação adicional.

Exemplo de resposta: javascript, react, performance, hooks

ARTIGO:
${content.slice(0, 2000)}`;

  try {
    const response = await (ai as any).run('@cf/meta/llama-3-8b-instruct', {
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 64,
    }) as { response?: string };

    const raw = response?.response?.trim();
    if (!raw) return Response.json({ error: 'IA não retornou resultado' }, { status: 500 });

    // Clean and normalize tags
    const tags = raw
      .split(',')
      .map((t) => t.trim().toLowerCase().replace(/[^a-z0-9-]/g, ''))
      .filter((t) => t.length > 0 && t.length < 30)
      .slice(0, 8)
      .join(', ');

    return Response.json({ result: tags });
  } catch (err) {
    return Response.json({ error: 'Erro ao chamar Workers AI' }, { status: 500 });
  }
};

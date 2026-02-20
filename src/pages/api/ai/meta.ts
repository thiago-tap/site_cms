import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const { content, title } = await request.json() as { content: string; title?: string };
    if (!content?.trim()) {
      return Response.json({ error: 'Conteúdo é obrigatório.' }, { status: 400 });
    }

    const ai = locals.runtime.env.AI;
    const prompt = `Você é um especialista em SEO. Gere uma meta description em português do Brasil para o seguinte post de blog.
A meta description deve:
- Ter entre 140 e 160 caracteres
- Ser atraente e informativa
- Não começar com o título do post
- Estimular o clique nos resultados de busca
${title ? `Título do post: ${title}` : ''}

Conteúdo do post:
${content.slice(0, 2000)}

Responda APENAS com a meta description, sem aspas, sem explicações adicionais.`;

    const response = await ai.run('@cf/meta/llama-3-8b-instruct', {
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 200,
    }) as { response?: string };

    const result = response.response?.trim().replace(/^["']|["']$/g, '') ?? '';
    if (!result) return Response.json({ error: 'IA não retornou resultado.' }, { status: 500 });

    return Response.json({ result: result.slice(0, 160) });
  } catch {
    return Response.json({ error: 'Erro ao chamar IA.' }, { status: 500 });
  }
};

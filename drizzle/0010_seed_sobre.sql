-- Atualiza o conteúdo da página "Sobre" com bio real do autor
INSERT OR REPLACE INTO pages (slug, title, content, updated_at) VALUES (
  'sobre',
  'Sobre',
  'Com mais de 10 anos de experiência em TI, atuo como Desenvolvedor Full Stack com foco em sistemas corporativos de alta complexidade. Atualmente faço parte do time da **Minsait/Indra**, onde trabalho em projetos estratégicos para o **Banco do Brasil** — implementando e modernizando APIs críticas com Java, Quarkus e Angular.

Sou especialista em construção de **APIs robustas e escaláveis**, com forte vivência no setor de saúde utilizando PHP e Laravel. No lado de infraestrutura, gerencio ambientes de servidores com **Docker Swarm, Traefik e MinIO**, sempre buscando automação e eficiência com ferramentas como o n8n.

Minha filosofia de trabalho prioriza **qualidade de código, testes automatizados e segurança**. Estudo continuamente Arquitetura de Software e Cloud. Se quiser bater um papo sobre Full Stack, DevOps ou automação de processos, é só falar!',
  unixepoch()
);

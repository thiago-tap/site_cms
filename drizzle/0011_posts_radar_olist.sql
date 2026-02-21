-- Posts: Radar Econômico Brasil + Olist Dashboard
INSERT OR IGNORE INTO posts (id, title, slug, content, excerpt, cover_image, tags, status, ai_summary, meta_description, reading_time, views, published_at, created_at, updated_at) VALUES

('post-radar-economico-01',
'Radar Econômico Brasil: dashboard de inteligência financeira com Python no browser',
'radar-economico-brasil-dashboard-python-browser',
'## O que é o Radar Econômico Brasil?

O **Radar Econômico Brasil** é um dashboard de inteligência econômica que consolida os principais indicadores financeiros do país em tempo real — diretamente da API do **Banco Central do Brasil** — com visualizações interativas e previsões com machine learning.

Acesse em: [radareconomicobr.catiteo.com](https://radareconomicobr.catiteo.com)

## O detalhe mais interessante: Python rodando no browser

A parte mais fascinante do projeto é que **toda a aplicação roda no browser do usuário** — sem nenhum servidor backend. Como? Usando **stlite** + **Pyodide**: Python compilado para WebAssembly.

O fluxo é simples:

1. O browser carrega um `index.html` com o stlite via CDN
2. O Pyodide inicializa o runtime Python no browser (WebAssembly)
3. O Streamlit renderiza a interface diretamente no DOM
4. As chamadas à API do Banco Central acontecem direto do browser (a API do BCB suporta CORS)

```html
<!-- index.html — apenas isso é necessário no servidor -->
<script src="https://cdn.jsdelivr.net/npm/@stlite/browser@0.63.0/build/stlite.js"></script>
<script>
  stlite.mount({
    requirements: ["plotly", "pandas", "numpy", "scikit-learn"],
    entrypoint: "streamlit_app.py",
  });
</script>
```

O resultado: um dashboard completo hospedado como **arquivos estáticos no Cloudflare Pages** — sem custo de servidor, sem cold start, sem manutenção de backend.

## Indicadores monitorados

Todos os dados vêm da API SGS (Sistema Gerenciador de Séries Temporais) do Banco Central — pública, sem autenticação, com retorno em JSON:

| Indicador | Série BCB | Frequência |
|---|---|---|
| Taxa SELIC | 432 | Diária |
| IPCA | 433 | Mensal |
| IGP-M | 189 | Mensal |
| USD/BRL | 1 | Diária |
| EUR/BRL | 21619 | Diária |

## Funcionalidades

### Visão geral
5 cartões de métricas com valor atual e variação percentual. Gauges visuais para SELIC e IPCA. Gráfico de comparação normalizada de todos os indicadores no mesmo eixo. Exportação para CSV.

### Taxas de juros e câmbio
Histórico completo da SELIC com médias móveis configuráveis (SMA/EMA). Gráfico dual-eixo para USD/BRL e EUR/BRL.

### Análise de inflação
Barras de IPCA e IGP-M com código de cores por intensidade. Cálculo de acumulado 12 meses. Heatmap sazonal mostrando padrões mensais de inflação por ano.

### Correlações
Matriz de correlação com três métodos: Pearson, Spearman e Kendall. Scatter plots entre pares de indicadores.

### Previsões com ML

Regressão linear com período de treino configurável pelo usuário (5 a 60 períodos futuros). Exibe R² e RMSE. Projeções exportáveis em CSV.

```python
from sklearn.linear_model import LinearRegression
import numpy as np

def forecast(series: pd.Series, periods: int) -> np.ndarray:
    X = np.arange(len(series)).reshape(-1, 1)
    y = series.values
    model = LinearRegression().fit(X, y)
    future_X = np.arange(len(series), len(series) + periods).reshape(-1, 1)
    return model.predict(future_X)
```

## Stack técnica

```
Linguagem:     Python 3.11
UI:            Streamlit 1.38
Browser:       stlite 0.63.0 + Pyodide 0.25 (WebAssembly)
Visualização:  Plotly 5.x
Dados:         Pandas 2.x + NumPy 1.x
ML:            scikit-learn 1.x
Deploy:        Cloudflare Pages (arquivos estáticos)
CI/CD:         GitHub Actions
```

## Custo de infraestrutura: R$ 0

Por rodar 100% no browser como arquivos estáticos, o deploy no Cloudflare Pages é gratuito. A API do Banco Central é pública. Não há servidor, banco de dados ou fatura no final do mês.

## O que aprendi

**WebAssembly está maduro para análise de dados.** O stlite inicializa em 3–5 segundos e roda Pandas, NumPy e scikit-learn sem problema. Para dashboards analíticos onde a latência inicial é aceitável, é uma arquitetura excelente.

**A API do Banco Central é subestimada.** Centenas de séries temporais, dados históricos desde os anos 80, atualizações diárias — completamente gratuita e sem autenticação.

## Próximos passos

- Adicionar PIB, desemprego e balança comercial
- Previsões com ARIMA e Prophet
- Alertas configuráveis para desvios dos indicadores
- Painel de comparação com outros países emergentes

Código disponível no [GitHub](https://github.com/thiago-tap/radar-economico-brasil).',
'Dashboard de inteligência econômica com dados do Banco Central do Brasil rodando 100% no browser via Python + WebAssembly, sem backend e com custo zero.',
NULL,
'["python","streamlit","webassembly","dados","cloudflare","bancoCentral"]',
'published',
'O Radar Econômico Brasil usa stlite e Pyodide para rodar Python + Streamlit 100% no browser via WebAssembly. Monitora SELIC, IPCA, câmbio e faz previsões com ML — hospedado como HTML estático no Cloudflare Pages.',
'Como construí um dashboard econômico com Python rodando no browser via WebAssembly, consumindo dados do Banco Central do Brasil. Custo total: R$ 0.',
7, 0, unixepoch(), unixepoch(), unixepoch()),

('post-olist-dashboard-01',
'Analisando 100 mil pedidos do Olist com Python, Pandas e Machine Learning',
'olist-dashboard-analise-dados-python-pandas-machine-learning',
'## O projeto

O **Olist Dashboard** é uma análise interativa de ~100 mil pedidos reais do marketplace Olist, cobrindo o período de 2016 a 2018 no Brasil. O objetivo: transformar dados brutos em insights acionáveis usando Python, Pandas e Machine Learning.

Acesse em: [olist.catiteo.com](https://olist.catiteo.com)

O dataset é público no Kaggle (licença CC BY-NC-SA 4.0) e contém 9 tabelas relacionais com pedidos, clientes, produtos, vendedores e avaliações — um dos datasets mais ricos de e-commerce brasileiro disponíveis.

## As 5 análises do dashboard

### 1. KPIs Gerais

Painel executivo com os números que mais importam: receita total, quantidade de pedidos, ticket médio, nota média de avaliação, prazo médio de entrega e métodos de pagamento preferidos.

### 2. Mapa Geográfico

Um choropleth interativo do Brasil mostrando a distribuição de receita por estado. Imediatamente visível: SP, RJ e MG concentram a maior parte do volume, mas estados do Sul têm ticket médio mais alto.

```python
import plotly.express as px

fig = px.choropleth(
    df_states,
    geojson=brazil_geojson,
    locations="state_code",
    color="revenue",
    color_continuous_scale="Viridis",
    title="Receita por Estado"
)
```

### 3. Segmentação RFM com K-Means

Essa é a parte mais interessante do projeto. A análise **RFM** (Recência, Frequência, Valor Monetário) classifica cada cliente em um dos 4 perfis usando K-Means com k=4:

| Segmento | Característica |
|---|---|
| Champions | Compraram recentemente, com frequência e gastam muito |
| Loyal | Compram com frequência e bom valor |
| At Risk | Eram bons clientes mas sumiram |
| Lost | Compraram uma vez, há muito tempo, pouco valor |

```python
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler

rfm = df.groupby("customer_id").agg({
    "order_purchase_timestamp": lambda x: (reference_date - x.max()).days,
    "order_id": "count",
    "payment_value": "sum"
})

scaler = StandardScaler()
rfm_scaled = scaler.fit_transform(rfm)

kmeans = KMeans(n_clusters=4, random_state=42)
rfm["cluster"] = kmeans.fit_predict(rfm_scaled)
```

O resultado revelou que **apenas 8% dos clientes são Champions**, enquanto **47% são Lost** — compraram uma vez e nunca mais voltaram. Isso explica por que o Olist investiu pesado em retenção pós-2018.

### 4. Análise de Cohort

Heatmap de retenção mensal mostrando qual porcentagem de clientes de cada mês volta a comprar nos meses seguintes. A conclusão: **taxa de retenção média de apenas 3%** — típico de marketplace generalista no Brasil.

### 5. Categorias e Entrega

Top 15 categorias por receita e um scatter plot mostrando a relação entre prazo de entrega e nota de avaliação. Resultado: cada dia a mais na entrega reduz a nota em ~0,15 ponto.

## Arquitetura: Python gerando HTML estático

O projeto usa uma abordagem inusitada — não há servidor web nem Streamlit rodando. Um script Python processa os dados e usa **Jinja2** para gerar um único `index.html` com todos os gráficos Plotly embutidos.

```bash
python download_dataset.py   # Baixa os CSVs do Kaggle
python build.py              # Processa e gera output/index.html
```

O arquivo final é hospedado no Cloudflare Pages como HTML estático. Sem backend, sem custo.

## Stack técnica

```
Linguagem:      Python 3.12
Dados:          Pandas 2.x + NumPy
Visualização:   Plotly (gráficos interativos embutidos no HTML)
ML:             scikit-learn (K-Means para segmentação RFM)
Templating:     Jinja2
Dataset:        Olist / Kaggle (~100k pedidos, 9 tabelas)
Deploy:         Cloudflare Pages (HTML estático)
```

## O que aprendi

**Segmentação RFM é simples e poderosa.** Três métricas, um algoritmo de clustering, e você tem uma visão clara de quem são seus melhores e piores clientes. É uma das análises mais práticas do arsenal de data science.

**Dados reais são bagunçados.** O dataset do Olist tem pedidos cancelados no meio, endereços inconsistentes e timestamps fora de ordem. Boa parte do trabalho foi limpeza e validação antes de qualquer análise.

**Gerar HTML estático é subestimado.** Para dashboards que não precisam de dados em tempo real, gerar um `index.html` com Plotly embutido é a solução mais simples, performática e barata possível.

## Código e demo

Código no [GitHub](https://github.com/thiago-tap/olist-dashboard) e demo ao vivo em [olist.catiteo.com](https://olist.catiteo.com).',
'Análise de 100 mil pedidos reais do marketplace Olist usando Python, Pandas, K-Means para segmentação RFM e cohort analysis — publicado como HTML estático no Cloudflare Pages.',
NULL,
'["python","pandas","datascience","machinelearning","ecommerce","cloudflare"]',
'published',
'O Olist Dashboard analisa ~100k pedidos reais de e-commerce brasileiro com segmentação RFM via K-Means, análise de cohort, mapa geográfico e KPIs. Gerado como HTML estático com Python, Pandas e Plotly.',
'Como analisei 100 mil pedidos do Olist com Python e Machine Learning: segmentação RFM com K-Means, cohort analysis e dashboard publicado como HTML estático.',
8, 0, unixepoch(), unixepoch(), unixepoch());

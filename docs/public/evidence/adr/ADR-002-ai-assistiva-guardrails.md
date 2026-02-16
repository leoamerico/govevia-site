# ADR-002 — IA assistiva (não decisória) e salvaguardas de governança

## Status
Proposto (website/marketing claims).

## Contexto
O site da Govevia descreve a plataforma como orientada a **governança executável** (controles técnicos, rastreabilidade e evidência operacional).

Para um posicionamento **GovTech AI-first** sem overclaim, qualquer menção a IA precisa:

- Evitar prometer decisão automática, ausência de viés ou ausência de erros.
- Declarar de forma explícita o papel **assistivo** da IA.
- Declarar a presença de **revisão humana registrada** (humano-no-circuito) para consolidação de atos/decisões.

Esse ADR serve como evidência documental mínima para claims de IA no site, enquanto implementação e testes específicos não estão no repositório.

## Decisão
Quando o site mencionar IA:

1. A IA é descrita como **assistiva** (sugestões/recomendações), não como mecanismo de decisão final.
2. A consolidação de qualquer ato/decisão é descrita como dependente de **validação determinística** (regras/checagens técnicas) e **revisão humana registrada**.
3. Não usar linguagem de overclaim (ex.: “decide automaticamente”, “sem viés”, “sem erro”, “erro zero”).

4. Em caso de dúvida ou baixa confiança, o desenho deve privilegiar postura conservadora (ex.: exigir validação humana antes de prosseguir), conforme configuração do órgão e do fluxo.

## Consequências
- O verificador de WEB claims passa a suportar metadados de IA (`domain=ai`, `risk_level`, `ai_pattern`) e bloqueia frases proibidas no site.
- Textos de IA no site devem permanecer compatíveis com o padrão “IA assistiva + humano-no-circuito”.

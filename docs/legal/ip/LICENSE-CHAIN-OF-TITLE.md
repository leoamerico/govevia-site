# LICENSE-CHAIN-OF-TITLE

## Finalidade

Estabelecer a **cadeia de titularidade (chain of title)** e regras internas de documentação para:

- reduzir risco em due diligence (compras, parceria, M&A),
- sustentar depósitos/registro (quando aplicável),
- evitar overclaims (marca vs software),
- definir governança de autoria (PF→PJ).

> Documento operacional. Não substitui assessoria jurídica.

## 1. Conceitos mínimos

- **Autor (PF):** pessoa física que cria obra/trecho com potencial de proteção autoral.
- **Titular patrimonial (PJ):** pessoa jurídica que explora comercialmente (cessão/licença patrimonial).
- **Marca:** sinal distintivo (propriedade industrial; registro por classes NCL).
- **Software (programa de computador):** regime autoral específico (Lei 9.609/98), depósito facultativo como prova.

## 2. Cadeia PF → PJ (regra padrão)

- Instrumento: **cessão ou licença patrimonial** da PF para a PJ (instrumento particular + anexos).
- Evidência operacional: repositório com histórico de commits, revisão e controle.

Checklist mínimo (interno):

- instrumento PF→PJ arquivado (jurídico)
- política de contribuição (CLA quando aplicável)
- tag/hash/inventário para versões relevantes (quando for sustentar depósito/claim)

## 3. Distinção obrigatória: marca vs software (P0)

Regra: **licença de software não concede licença de marca**.

- **Licença de software:** autoriza uso do sistema conforme termos contratuais (SaaS, on-premise, etc.).
- **Licença de marca:** autoriza uso de nome/logotipo em materiais do licenciado (instrumento próprio).

## 4. Sobre averbação no INPI (P0 de linguagem)

- **Averbação no INPI (licença de marca):** em geral é o instrumento que produz efeitos perante terceiros e exige controle efetivo de qualidade pelo titular.
- **Licença comercial de uso de software (sem transferência tecnológica):** permanece como contrato civil/autorais; **não** deve ser vendida/publicada como “averbada no INPI” se não estiver estruturada como transferência de tecnologia nos termos aceitos.

> Separar discurso e documentos: marca (averbável) vs software (nem sempre).

# INPI-SOFTWARE-DEPOSIT

## Finalidade

Check-list operacional para preparar depósito de Programa de Computador (prova de anterioridade), com artefatos verificáveis (tag/hash/inventário). Este documento define **o que gerar** e **onde arquivar**.

> Documento operacional (governança). Não substitui orientação jurídica.

## 0. Regra de escopo (P0)

- Deposite **o que é seu e está sob titularidade** (código, arquitetura, documentação técnica própria).
- Descreva diferenciais (incluindo IA) **sem** tornar dependências de terceiros (OSS/SDKs/APIs) o “núcleo” do diferencial depositado.
- Amarre o depósito a **uma tag/versão** e a um **inventário de módulos** (due diligence).

## 1. Saídas obrigatórias (artefatos)

| Artefato | Formato | Onde fica | Por quê |
| --- | --- | --- | --- |
| Tag Git de referência | tag assinada | repo | fixa a versão de referência |
| Manifesto de hash | `.txt` + assinatura | `docs/legal/ip/` | prova de integridade do pacote depositado |
| Inventário de módulos | `.md` | `docs/legal/ip/` | demonstra escopo e composição |
| Trecho representativo do código | `.pdf` | arquivo corporativo | insumo do procedimento |
| Memorial descritivo | `.pdf` | arquivo corporativo | descrição do programa |
| Protocolo/nº do pedido | texto | `docs/legal/ip/` + evidência pública | habilita claim público |

## 2. Procedimento (determinístico)

### 2.1 Preparar tag e pacote

```bash
# Tag assinada (ajuste a versão)
git tag -s vX.Y.Z-inpi -m "Versão de referência para depósito"

# Pacote do código na tag
mkdir -p out/inpi

git archive vX.Y.Z-inpi | tee out/inpi/src.tar | sha256sum > out/inpi/INPI-HASH-MANIFEST.txt

# Assinatura do manifesto
gpg --armor --detach-sign out/inpi/INPI-HASH-MANIFEST.txt
```

### 2.2 Gerar inventário de módulos

```bash
find . -type f \( -name "*.py" -o -name "*.ts" -o -name "*.tsx" -o -name "*.sql" -o -name "*.md" \) \
  | sort > out/inpi/INPI-FILE-LIST.txt

wc -l $(cat out/inpi/INPI-FILE-LIST.txt) | tail -1 > out/inpi/INPI-MODULE-INVENTORY.md
```

> Se for monorepo: complementar com tabela por pasta (`app/`, `components/`, `infra/`, `tools/`, etc.).

### 2.3 Arquivar

- Copiar `out/inpi/INPI-HASH-MANIFEST.txt` e `.asc` para `docs/legal/ip/`.
- Copiar `out/inpi/INPI-MODULE-INVENTORY.md` para `docs/legal/ip/`.
- Guardar PDFs (trecho + memorial) em arquivo corporativo (não público).

## 3. Ativação de claim público (apenas após protocolo)

Regra: **não publicar claim** de depósito/registro sem:

- número de protocolo/pedido, e
- evidência arquivada (preferencialmente em `docs/public/evidence/ip/`).

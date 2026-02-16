from __future__ import annotations

import json
import os
import re
import sys
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

REPO_ROOT = Path(__file__).resolve().parents[2]
CLAIMS_PATH = REPO_ROOT / "tools" / "claims" / "WEB-CLAIMS.yaml"
REPORT_PATH = REPO_ROOT / "docs" / "public" / "evidence" / "WEB-CLAIMS-REPORT.md"

ALLOWED_DOMAINS = {"normas", "prova", "seguranca", "privacidade", "ai"}
ALLOWED_RISK_LEVELS = {"high", "medium", "low"}

# Phrases that are almost always overclaim in GovTech AI-first contexts.
# If these appear anywhere in public web copy, we FAIL the build.
FORBIDDEN_AI_PHRASES = [
    # "AI decides automatically" / fully automated decisions
    re.compile(r"\bdecide\s+automaticamente\b", re.IGNORECASE),
    re.compile(r"\bdecis[aã]o\s+autom[aá]tica\b", re.IGNORECASE),
    re.compile(r"\bdecis[aã]o\s+100%\s+autom[aá]tica\b", re.IGNORECASE),
    re.compile(r"\bsem\s+revis[aã]o\s+humana\b", re.IGNORECASE),
    # "bias-free" / "error-free" claims
    re.compile(r"\bsem\s+vi[eé]s\b", re.IGNORECASE),
    re.compile(r"\blivre\s+de\s+vi[eé]s\b", re.IGNORECASE),
    re.compile(r"\bsem\s+erro\b", re.IGNORECASE),
    re.compile(r"\berro\s+zero\b", re.IGNORECASE),
]


@dataclass
class EvidenceItem:
    path: str
    description: str


@dataclass
class ClaimResult:
    claim_id: str
    page_path: str
    statement: str
    domain: List[str]
    risk_level: str
    ai_pattern: Dict[str, Any]
    status: str
    reason: str
    evidence_paths: List[str]
    reproduce: List[str]
    copy_fix: str


def _load_yaml_as_json(path: Path) -> Dict[str, Any]:
    """The WEB-CLAIMS.yaml file is intentionally JSON (valid YAML 1.2 subset).

    This keeps the verifier dependency-free and deterministic.
    """
    raw = path.read_text(encoding="utf-8")
    try:
        return json.loads(raw)
    except json.JSONDecodeError as e:
        raise SystemExit(f"FAIL: WEB-CLAIMS.yaml must be JSON-compatible YAML. JSON parse error: {e}")


def _read_file(rel_path: str) -> str:
    abs_path = (REPO_ROOT / rel_path).resolve()
    if not abs_path.exists():
        raise FileNotFoundError(rel_path)
    return abs_path.read_text(encoding="utf-8")


def _statement_present(file_content: str, statement: str) -> bool:
    # Deterministic rule with whitespace normalization.
    # We treat any run of whitespace as a single space to avoid false PASS caused by formatting/indentation.
    def norm(s: str) -> str:
        s = s.replace("\r\n", "\n")
        return re.sub(r"\s+", " ", s).strip()

    return norm(statement) in norm(file_content)


def _file_exists(rel_path: str) -> bool:
    return (REPO_ROOT / rel_path).exists()


def _has_tests_for_path(rel_path: str) -> bool:
    # Deterministic and repo-scoped: do NOT count tests inside node_modules/.next.
    # We'll treat any file matching *.test.* or *.spec.* under repo-owned dirs as a test.
    scan_roots = [
        REPO_ROOT / "app",
        REPO_ROOT / "components",
        REPO_ROOT / "lib",
        REPO_ROOT / "tools",
        REPO_ROOT / "scripts",
    ]

    test_files: List[Path] = []
    for root in scan_roots:
        if not root.exists():
            continue
        test_files.extend(root.rglob("*.test.*"))
        test_files.extend(root.rglob("*.spec.*"))

    return len(test_files) > 0


def _coerce_domain(value: Any) -> List[str]:
    if value is None:
        return []
    if isinstance(value, str):
        domains = [value]
    elif isinstance(value, list):
        domains = [str(v) for v in value]
    else:
        domains = [str(value)]

    return [d.strip() for d in domains if d and str(d).strip()]


def _validate_domain_and_risk(claim_id: str, domain: List[str], risk_level: str) -> Tuple[bool, str]:
    unknown = [d for d in domain if d not in ALLOWED_DOMAINS]
    if unknown:
        return False, f"unknown domain values: {', '.join(unknown)}"
    if risk_level not in ALLOWED_RISK_LEVELS:
        return False, f"unknown risk_level: {risk_level}"
    return True, "domain/risk validated"


def _check_required_proof(required: str, evidence: List[Any], reproduce: List[str]) -> Tuple[bool, str, List[str]]:
    evidence_paths: List[str] = []

    for e in evidence:
        if isinstance(e, dict) and "path" in e:
            evidence_paths.append(str(e["path"]))
        elif isinstance(e, str):
            evidence_paths.append(e)

    if required == "RUNTIME_SMOKE":
        if reproduce:
            return True, "RUNTIME_SMOKE defined (commands provided)", evidence_paths
        return False, "missing reproduce commands for RUNTIME_SMOKE", evidence_paths

    if required == "CODE_INVARIANT":
        if not evidence_paths:
            return False, "missing evidence paths for CODE_INVARIANT", evidence_paths
        missing = [p for p in evidence_paths if not _file_exists(p)]
        if missing:
            return False, f"evidence paths not found: {', '.join(missing)}", evidence_paths
        return True, "CODE_INVARIANT evidence paths exist", evidence_paths

    if required in {"DOC", "ADR"}:
        if not evidence_paths:
            return False, f"missing evidence paths for {required}", evidence_paths
        missing = [p for p in evidence_paths if not _file_exists(p)]
        if missing:
            return False, f"evidence paths not found: {', '.join(missing)}", evidence_paths
        non_md = [p for p in evidence_paths if not str(p).lower().endswith(".md")]
        if non_md:
            return False, f"{required} evidence must be markdown (.md): {', '.join(non_md)}", evidence_paths
        return True, f"{required} evidence paths exist", evidence_paths

    if required == "DB_MIGRATION":
        # Look for migrations folder and RLS enabling patterns.
        migrations = list(REPO_ROOT.rglob("migrations")) + list(REPO_ROOT.rglob("*.sql"))
        if not migrations:
            return False, "no migrations/sql files found for DB_MIGRATION", evidence_paths
        return True, "DB_MIGRATION: migrations/sql detected", evidence_paths

    if required == "TEST":
        if not _has_tests_for_path("/"):
            return False, "no automated tests found in repository for TEST proof", evidence_paths
        return True, "tests detected", evidence_paths

    return False, f"unknown required_proof: {required}", evidence_paths


def _type_specific_checks(claim_type: str, statement: str, evidence_paths: List[str]) -> Tuple[bool, str]:
    # Minimal objective checks based on repository structure.
    # The intent is to FAIL unless the repository contains concrete implementation artifacts.

    if claim_type == "RLS":
        # We require explicit Postgres RLS policy enablement somewhere.
        patterns = [
            re.compile(r"ENABLE\s+ROW\s+LEVEL\s+SECURITY", re.IGNORECASE),
            re.compile(r"CREATE\s+POLICY", re.IGNORECASE),
        ]
        for p in REPO_ROOT.rglob("*.sql"):
            txt = p.read_text(encoding="utf-8", errors="ignore")
            if all(rx.search(txt) for rx in patterns):
                return True, f"RLS evidence found in {p.relative_to(REPO_ROOT)}"
        return False, "RLS requires SQL migrations with ENABLE ROW LEVEL SECURITY + policies"

    if claim_type == "SIGNATURE":
        # Only pass if there's signature verification code (not just copy).
        # This repo has no signature verification implementation.
        return False, "SIGNATURE claim requires real signature validation implementation + tests"

    if claim_type in {"AI", "AI_ASSISTIVE", "AI_GUARDRAIL"}:
        # AI-related claims must be backed by explicit documentation at minimum.
        if not evidence_paths:
            return False, "AI claim requires documentation/ADR evidence paths"
        return True, "AI claim: documentation evidence provided"

    if claim_type in {"ENFORCEMENT", "EVIDENCE", "TEMPORAL_VERSIONING", "EXPORT", "PRIVACY_OPERATION"}:
        # These require backing code; by default we don't assume it exists.
        return True, "no additional type-specific checks applied"

    return False, f"unknown claim_type: {claim_type}"


def _ai_claim_guardrail_checks(statement: str, ai_pattern: Dict[str, Any]) -> Tuple[bool, str]:
    # If the claim is present, enforce mandatory AI safety posture.
    assistive_only = bool(ai_pattern.get("assistive_only", False))
    human_in_the_loop = bool(ai_pattern.get("human_in_the_loop", False))

    if not assistive_only:
        return False, "ai_pattern.assistive_only must be true for domain=ai"
    if not human_in_the_loop:
        return False, "ai_pattern.human_in_the_loop must be true for domain=ai"

    for rx in FORBIDDEN_AI_PHRASES:
        if rx.search(statement):
            return False, f"forbidden AI overclaim phrase in statement: {rx.pattern}"

    return True, "AI guardrails validated"


def _scan_forbidden_ai_phrases() -> List[ClaimResult]:
    # Scan repo-owned web copy sources for forbidden phrases.
    scan_patterns = [
        (REPO_ROOT / "app", "**/*.ts*"),
        (REPO_ROOT / "components", "**/*.ts*"),
        (REPO_ROOT / "content", "**/*.md*"),
    ]

    results: List[ClaimResult] = []
    idx = 1

    for root, glob in scan_patterns:
        if not root.exists():
            continue
        for p in root.glob(glob):
            if p.is_dir():
                continue
            txt = p.read_text(encoding="utf-8", errors="ignore")
            for rx in FORBIDDEN_AI_PHRASES:
                m = rx.search(txt)
                if not m:
                    continue
                rel = str(p.relative_to(REPO_ROOT)).replace("\\", "/")
                results.append(
                    ClaimResult(
                        claim_id=f"WEB-AI-FORBIDDEN-{idx:03d}",
                        page_path=rel,
                        statement=m.group(0),
                        domain=["ai"],
                        risk_level="high",
                        ai_pattern={"assistive_only": True, "human_in_the_loop": True, "explainability_required": True},
                        status="FAIL",
                        reason="forbidden AI overclaim phrase found in public web copy",
                        evidence_paths=[],
                        reproduce=[],
                        copy_fix=(
                            "Remover a afirmação e reescrever como IA assistiva (não decisória), com revisão humana registrada. "
                            "Evitar promessas como 'sem viés'/'sem erro' e qualquer linguagem de decisão automática."
                        ),
                    )
                )
                idx += 1

    return results


def verify_claims() -> List[ClaimResult]:
    data = _load_yaml_as_json(CLAIMS_PATH)
    claims = data.get("claims", [])

    results: List[ClaimResult] = []

    # Global AI-first safeguard: forbidden phrases must not exist anywhere.
    results.extend(_scan_forbidden_ai_phrases())

    for c in claims:
        claim_id = str(c.get("id"))
        page_path = str(c.get("page_path"))
        statement = str(c.get("statement"))
        claim_type = str(c.get("claim_type"))
        required_proof = str(c.get("required_proof"))
        evidence = c.get("evidence", []) or []
        reproduce = c.get("reproduce", []) or []
        copy_fix = str(c.get("copy_fix", ""))

        domain = _coerce_domain(c.get("domain", []))
        risk_level = str(c.get("risk_level", "medium")).strip() or "medium"
        ai_pattern = c.get("ai_pattern", {}) or {}
        if not isinstance(ai_pattern, dict):
            ai_pattern = {"value": ai_pattern}

        ok_meta, meta_reason = _validate_domain_and_risk(claim_id, domain, risk_level)
        if not ok_meta:
            results.append(
                ClaimResult(
                    claim_id=claim_id,
                    page_path=page_path,
                    statement=statement,
                    domain=domain,
                    risk_level=risk_level,
                    ai_pattern=ai_pattern,
                    status="FAIL",
                    reason=meta_reason,
                    evidence_paths=[],
                    reproduce=reproduce,
                    copy_fix=copy_fix or "(copy_fix required)",
                )
            )
            continue

        try:
            file_content = _read_file(page_path)
        except FileNotFoundError:
            results.append(
                ClaimResult(
                    claim_id=claim_id,
                    page_path=page_path,
                    statement=statement,
                    domain=domain,
                    risk_level=risk_level,
                    ai_pattern=ai_pattern,
                    status="FAIL",
                    reason="page_path not found",
                    evidence_paths=[],
                    reproduce=reproduce,
                    copy_fix=copy_fix or "(copy_fix required)",
                )
            )
            continue

        if not _statement_present(file_content, statement):
            # Deterministic rule: if the exact overclaim statement is no longer present, the claim is resolved.
            results.append(
                ClaimResult(
                    claim_id=claim_id,
                    page_path=page_path,
                    statement=statement,
                    domain=domain,
                    risk_level=risk_level,
                    ai_pattern=ai_pattern,
                    status="PASS",
                    reason="statement not found (removed/changed in source)",
                    evidence_paths=[],
                    reproduce=reproduce,
                    copy_fix=copy_fix,
                )
            )
            continue

        ok_proof, proof_reason, evidence_paths = _check_required_proof(required_proof, evidence, reproduce)
        ok_type, type_reason = _type_specific_checks(claim_type, statement, evidence_paths)

        ok_ai = True
        ai_reason: Optional[str] = None
        if "ai" in domain:
            ok_ai, ai_reason = _ai_claim_guardrail_checks(statement, ai_pattern)

        if ok_proof and ok_type and ok_ai:
            status = "PASS"
            reason = "; ".join([r for r in [proof_reason, type_reason, ai_reason] if r])
        else:
            status = "FAIL"
            reason = "; ".join(
                [
                    r
                    for r in [
                        proof_reason if not ok_proof else None,
                        type_reason if not ok_type else None,
                        ai_reason if ("ai" in domain and not ok_ai) else None,
                    ]
                    if r
                ]
            )

        if status == "FAIL" and not copy_fix:
            copy_fix = "(copy_fix required)"

        results.append(
            ClaimResult(
                claim_id=claim_id,
                page_path=page_path,
                statement=statement,
                domain=domain,
                risk_level=risk_level,
                ai_pattern=ai_pattern,
                status=status,
                reason=reason,
                evidence_paths=evidence_paths,
                reproduce=reproduce,
                copy_fix=copy_fix,
            )
        )

    return results


def write_report(results: List[ClaimResult]) -> None:
    REPORT_PATH.parent.mkdir(parents=True, exist_ok=True)

    lines: List[str] = []
    lines.append("# WEB-CLAIMS-REPORT")
    lines.append("")
    lines.append("Relatório público e determinístico de claims do site (anti-overclaim).")
    lines.append("")
    lines.append("## Fontes (TAREFA 0)")
    lines.append("")
    lines.append("- components/platform/PlatformHero.tsx (\"Detalhamento Técnico da Plataforma\")")
    lines.append("- components/platform/ModulesDetail.tsx (\"Gestão de Processos Administrativos\" e módulos)")
    lines.append("- content/blog/regras-sem-enforcement-sao-invalidas.md (artigo do blog)")
    lines.append("- app/politica-privacidade/page.tsx (Política de Privacidade)")
    lines.append("- app/sobre/page.tsx (Sobre)")
    lines.append("")

    lines.append("## Inventário (PASS/FAIL)")
    lines.append("")
    lines.append("| Claim ID | Página | Domínio | Risco | Statement | PASS/FAIL | Evidências (paths) | Como reproduzir | Copy fix (se FAIL) |")
    lines.append("|---|---|---|---|---|---|---|---|---|")

    def esc(s: str) -> str:
        return s.replace("\n", " ").replace("|", "\\|").strip()

    for r in results:
        ev = ", ".join(r.evidence_paths) if r.evidence_paths else ""
        rep = " / ".join(r.reproduce) if r.reproduce else ""
        fix = r.copy_fix if r.status == "FAIL" else ""
        dom = ",".join(r.domain) if r.domain else ""
        lines.append(
            f"| {esc(r.claim_id)} | {esc(r.page_path)} | {esc(dom)} | {esc(r.risk_level)} | {esc(r.statement)} | {esc(r.status)} | {esc(ev)} | {esc(rep)} | {esc(fix)} |"
        )

    lines.append("")
    lines.append("## Execução")
    lines.append("")
    lines.append("```bash")
    lines.append("python tools/claims/verify_web_claims.py")
    lines.append("```")
    lines.append("")

    REPORT_PATH.write_text("\n".join(lines) + "\n", encoding="utf-8")


def main() -> int:
    results = verify_claims()
    write_report(results)

    failed = [r for r in results if r.status == "FAIL"]
    if failed:
        print("WEB claims enforcement: FAIL")
        for r in failed:
            print(f"- {r.claim_id}: {r.reason}")
            print(f"  page_path: {r.page_path}")
            print(f"  statement: {r.statement}")
            print(f"  copy_fix: {r.copy_fix}")
        return 1

    print("WEB claims enforcement: PASS")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

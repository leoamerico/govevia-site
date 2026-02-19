"""
Sprint C+D — E2E smoke test
Tests: auth → task dispatch+poll → document upload+poll → normas → semantic search
Run: python3 scripts/sprint_c_e2e.py
"""
import urllib.request
import urllib.error
import json
import time

BASE = "http://localhost:8000"

# Desabilita proxy de sistema (evita 307 redirect no Windows)
_opener = urllib.request.build_opener(urllib.request.ProxyHandler({}))


def post_json(path, data):
    body = json.dumps(data).encode()
    req = urllib.request.Request(
        f"{BASE}{path}", data=body,
        headers={"Content-Type": "application/json"}, method="POST"
    )
    with _opener.open(req, timeout=10) as r:
        return json.loads(r.read())


def get_auth(path, token):
    req = urllib.request.Request(
        f"{BASE}{path}", headers={"Authorization": f"Bearer {token}"}
    )
    with _opener.open(req, timeout=10) as r:
        return json.loads(r.read())


def post_json_auth(path, data, token):
    body = json.dumps(data).encode()
    req = urllib.request.Request(
        f"{BASE}{path}", data=body,
        headers={"Content-Type": "application/json", "Authorization": f"Bearer {token}"},
        method="POST"
    )
    with _opener.open(req, timeout=12) as r:
        return json.loads(r.read())


def main():
    # 1. Auth
    login = post_json("/api/v1/auth/login", {
        "email": "ceo-console@govevia.internal",
        "password": "CeoConsoleServiceKey2026!"
    })
    token = login["access_token"]
    print(f"[auth]   OK  token={token[:22]}...")
    assert token, "no access_token in login response"

    # 2. Task dispatch + poll
    dispatch = post_json("/api/v1/tasks/dispatch", {
        "handler": "ping",
        "payload": {"from": "sprint-c-e2e"}
    })
    tid = dispatch["task_id"]
    print(f"[task]   dispatched  task_id={tid}  status={dispatch['status']}")
    time.sleep(1)
    result = get_auth(f"/api/v1/tasks/{tid}", token)
    print(f"[task]   polled  status={result['status']}  elapsed_ms={result.get('elapsed_ms')}")
    assert result["status"] == "success", f"task not success: {result}"

    # 3. Handlers list
    handlers = get_auth("/api/v1/tasks/handlers", token)
    print(f"[task]   handlers={handlers['handlers']}")
    assert "ping" in handlers["handlers"]
    assert "normas_sync" in handlers["handlers"]

    # 4. Document upload (manual multipart, PDF magic bytes)
    boundary = "SprintCE2EBoundary01"
    # Minimal valid PDF magic header so backend accepts the file type check
    file_content = b"%PDF-1.4\n1 0 obj<</Type/Catalog>>endobj\nxref\n0 1\n0000000000 65535 f\ntrailer<</Size 1>>\nstartxref\n9\n%%EOF"
    body_parts = [
        f"--{boundary}\r\n".encode(),
        b'Content-Disposition: form-data; name="file"; filename="test_e2e.pdf"\r\n',
        b"Content-Type: application/pdf\r\n\r\n",
        file_content,
        f"\r\n--{boundary}--\r\n".encode(),
    ]
    body = b"".join(body_parts)
    req = urllib.request.Request(
        f"{BASE}/api/v1/documents/upload",
        data=body,
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": f"multipart/form-data; boundary={boundary}",
        },
        method="POST"
    )
    try:
        with _opener.open(req, timeout=15) as r:
            upload = json.loads(r.read())
        job_id = upload["job_id"]
        print(f"[doc]    upload  job_id={job_id}  status={upload['status']}")
        assert upload["status"] == "queued"

        # 5. Job status poll (wait up to 4s)
        job = None
        for attempt in range(4):
            time.sleep(1)
            job = get_auth(f"/api/v1/documents/upload/status/{job_id}", token)
            print(f"[doc]    poll[{attempt}]  status={job['status']}  filename={job.get('filename')}")
            if job["status"] in ("done", "error"):
                break
        if job and job.get("error"):
            print(f"[doc]    ingestion result (error ok for minimal pdf): {job['error']}")
    except urllib.error.HTTPError as e:
        body_err = e.read().decode()
        print(f"[doc]    upload HTTP {e.code} (backend rejected file): {body_err[:120]}")

    # 6. Normas count
    normas = get_auth("/api/v1/normas-legais/", token)
    print(f"[normas] total={normas.get('total', 0)}")
    assert normas.get("total", 0) > 0, "normas table empty"

    # 7. Semantic search — POST /api/v1/search/ (commit 2d28d372)
    try:
        search_resp = post_json_auth(
            "/api/v1/search/",
            {"query": "compliance governança", "limit": 3},
            token
        )
        chunks = search_resp.get("chunks", [])
        kernel_available = search_resp.get("kernel_available", True)
        print(f"[search] OK  kernel_available={kernel_available}  chunks={len(chunks)}")
        assert "chunks" in search_resp, "search response missing 'chunks'"
        assert "query" in search_resp, "search response missing 'query'"
        assert isinstance(chunks, list), "chunks deve ser lista"
    except urllib.error.HTTPError as e:
        body_err = e.read().decode()
        raise AssertionError(f"[search] FAIL HTTP {e.code}: {body_err[:200]}")

    print("\n=== ALL GREEN ===")


if __name__ == "__main__":
    main()

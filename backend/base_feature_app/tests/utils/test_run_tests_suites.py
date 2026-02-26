from __future__ import annotations

import builtins
import importlib.util
import json
import sys
import types
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[4]
SCRIPT_PATH = REPO_ROOT / "scripts" / "run-tests-all-suites.py"

spec = importlib.util.spec_from_file_location("run_tests_all_suites", SCRIPT_PATH)
assert spec is not None
assert spec.loader is not None
run_tests_all_suites = importlib.util.module_from_spec(spec)
sys.modules[spec.name] = run_tests_all_suites
spec.loader.exec_module(run_tests_all_suites)


def make_step_result(
    name: str,
    *,
    status: str = "ok",
    returncode: int = 0,
    log_path: Path | None = None,
) -> run_tests_all_suites.StepResult:
    return run_tests_all_suites.StepResult(
        name=name,
        command=["cmd", name],
        returncode=returncode,
        duration=0.1,
        status=status,
        output_tail=[],
        coverage=[],
        log_path=log_path,
    )


class _DummyFuture:
    def __init__(self, result):
        self._result = result

    def result(self):
        return self._result


class _SimpleParallelExecutor:
    def __init__(self, *_args, **_kwargs):
        return None

    def __enter__(self):
        return self

    def __exit__(self, *_args):
        return False

    def submit(self, fn):
        return _DummyFuture(fn())


class _DummyProgress:
    def __init__(self, *_args, **_kwargs):
        self.marked = []

    def start(self):
        return None

    def stop(self):
        return None

    def mark_done(self, name, status, duration):
        self.marked.append((name, status, duration))


def _fake_as_completed(futures):
    return list(futures)


def _make_tracking_executor(state: dict):
    class _TrackingExecutor:
        def __init__(self, max_workers):
            state["max_workers"] = max_workers
            self.submitted = []

        def __enter__(self):
            state["instance"] = self
            return self

        def __exit__(self, *_args):
            return False

        def submit(self, fn):
            future = _DummyFuture(fn())
            self.submitted.append(future)
            return future

    return _TrackingExecutor


def test_load_resume_summary_returns_none_when_missing(tmp_path):
    summary_path = tmp_path / run_tests_all_suites.RESUME_FILENAME

    assert run_tests_all_suites.load_resume_summary(summary_path) is None


def test_extract_resume_entries_returns_named_entries():
    summary = {
        "suites": [
            {"name": "backend", "status": "ok"},
            {"status": "failed"},
            "invalid",
        ]
    }

    entries = run_tests_all_suites.extract_resume_entries(summary)

    assert entries == {"backend": {"name": "backend", "status": "ok"}}


def test_resume_status_returns_unknown_for_missing_entry():
    entry = None

    result = run_tests_all_suites.resume_status(entry)

    assert result == "unknown"


def test_resume_status_uses_status_value():
    entry = {"status": "failed", "returncode": 0}

    assert run_tests_all_suites.resume_status(entry) == "failed"


def test_resume_status_uses_returncode_when_status_missing():
    entry = {"returncode": 0}

    assert run_tests_all_suites.resume_status(entry) == "ok"


def test_resolve_log_path_returns_relative_for_child_path(tmp_path):
    repo_root = tmp_path
    log_path = tmp_path / "reports" / "suite.log"

    assert run_tests_all_suites.resolve_log_path(log_path, repo_root) == "reports/suite.log"


def test_resolve_log_path_returns_absolute_for_external_path(tmp_path):
    repo_root = tmp_path / "repo"
    repo_root.mkdir()
    log_path = tmp_path / "outside.log"

    assert run_tests_all_suites.resolve_log_path(log_path, repo_root) == str(log_path)


def test_read_backend_summary_returns_statements_branches_functions_lines_total(
    tmp_path,
    monkeypatch,
):
    backend_root = tmp_path / "backend"
    backend_root.mkdir()
    coverage_file = backend_root / ".coverage"
    coverage_file.write_text("data", encoding="utf-8")

    sample_path = backend_root / "base_feature_app" / "sample.py"
    sample_path.parent.mkdir(parents=True)
    sample_path.write_text(
        "def alpha():\n    return 1\n\ndef beta():\n    return 2\n",
        encoding="utf-8",
    )

    report_payload = {
        "totals": {
            "num_statements": 10,
            "missing_lines": 2,
            "covered_lines": 8,
            "percent_covered": 78.57,
            "percent_covered_lines": 80.0,
            "num_lines": 10,
            "num_branches": 4,
            "missing_branches": 1,
            "covered_branches": 3,
        },
        "files": {
            "backend/base_feature_app/sample.py": {},
        },
    }

    class FakeCoverageData:
        def lines(self, filename):
            if str(filename).endswith("sample.py"):
                return [2]
            return []

    class FakeCoverage:
        def __init__(self, data_file):
            self.data_file = data_file

        def load(self):
            return None

        def json_report(self, outfile, omit, ignore_errors):
            Path(outfile).write_text(json.dumps(report_payload), encoding="utf-8")

        def get_data(self):
            return FakeCoverageData()

    fake_module = types.ModuleType("coverage")
    fake_module.Coverage = FakeCoverage
    monkeypatch.setitem(sys.modules, "coverage", fake_module)

    lines = run_tests_all_suites.read_backend_coverage_summary(backend_root)

    assert len(lines) == 5
    assert "Statements:" in lines[0]
    assert "(8/10)" in lines[0]
    assert "Branches:" in lines[1]
    assert "(3/4)" in lines[1]
    assert "Functions:" in lines[2]
    assert "(1/2)" in lines[2]
    assert "Lines:" in lines[3]
    assert "(8/10)" in lines[3]
    assert "Total:" in lines[4]
    assert "(20/26)" in lines[4]


def test_read_flow_summary_formats_flow_percent(tmp_path):
    summary_path = tmp_path / "e2e-results" / "flow-coverage.json"
    summary_path.parent.mkdir(parents=True, exist_ok=True)
    summary_path.write_text(
        json.dumps(
            {
                "summary": {
                    "total": 10,
                    "covered": 7,
                    "partial": 1,
                    "failing": 0,
                    "missing": 2,
                }
            }
        ),
        encoding="utf-8",
    )

    lines = run_tests_all_suites.read_flow_coverage_summary(tmp_path)

    assert len(lines) == 3
    assert "Flows covered: 7/10" in lines[0]
    assert "Partial: 1" in lines[1]
    assert "Missing: 2" in lines[2]


def test_run_backend_triggers_erase_when_enabled(tmp_path, monkeypatch):
    calls = []

    def fake_erase(root, quiet):
        calls.append((root, quiet))

    def fake_run_command(**_kwargs):
        return make_step_result("backend")

    monkeypatch.setattr(run_tests_all_suites, "erase_backend_coverage_data", fake_erase)
    monkeypatch.setattr(run_tests_all_suites, "run_command", fake_run_command)

    result = run_tests_all_suites.run_backend(
        backend_root=tmp_path,
        report_dir=tmp_path,
        markers="",
        extra_args=[],
        quiet=True,
        append_log=False,
        run_id=None,
        coverage=True,
    )

    assert calls == [(tmp_path, True)]
    assert result.name == "backend"


def test_run_backend_skips_erase_when_disabled(tmp_path, monkeypatch):
    calls = []

    def fake_erase(*_args, **_kwargs):
        calls.append("called")

    def fake_run_command(**_kwargs):
        return make_step_result("backend")

    monkeypatch.setattr(run_tests_all_suites, "erase_backend_coverage_data", fake_erase)
    monkeypatch.setattr(run_tests_all_suites, "run_command", fake_run_command)

    result = run_tests_all_suites.run_backend(
        backend_root=tmp_path,
        report_dir=tmp_path,
        markers="",
        extra_args=[],
        quiet=False,
        append_log=False,
        run_id=None,
        coverage=False,
    )

    assert calls == []
    assert result.name == "backend"


def test_erase_backend_data_warns_on_failure(tmp_path, monkeypatch):
    messages = []
    captured = {}

    class FakeResult:
        returncode = 2
        stdout = "boom stdout"
        stderr = "boom stderr"

    def fake_run(cmd, cwd, capture_output, text):
        captured["cmd"] = cmd
        captured["cwd"] = cwd
        captured["capture_output"] = capture_output
        captured["text"] = text
        return FakeResult()

    def fake_print(*args, **_kwargs):
        messages.append(" ".join(str(arg) for arg in args))

    monkeypatch.setattr(run_tests_all_suites.subprocess, "run", fake_run)
    monkeypatch.setattr(builtins, "print", fake_print)

    run_tests_all_suites.erase_backend_coverage_data(tmp_path, quiet=False)

    assert captured["cmd"] == [sys.executable, "-m", "coverage", "erase"]
    assert captured["cwd"] == tmp_path
    assert captured["capture_output"] is True
    assert captured["text"] is True
    assert any("coverage erase failed" in msg for msg in messages)
    assert any("boom stdout" in msg for msg in messages)
    assert any("boom stderr" in msg for msg in messages)


def test_build_log_header_includes_suite_metadata():
    header = run_tests_all_suites.build_log_header("run123", "backend", ["pytest", "-q"])

    assert "Resume run: run123" in header
    assert "Suite: backend" in header
    assert "Command: pytest -q" in header
    assert "Timestamp:" in header


def test_build_resume_summary_orders_suites(tmp_path):
    """build_resume_summary preserves suite_order and records log_path relative to repo_root."""
    repo_root = tmp_path
    backend_log = repo_root / "backend.log"
    result_backend = make_step_result("backend", log_path=backend_log)
    result_unit = make_step_result("frontend-unit", status="failed", returncode=1)
    result_e2e = make_step_result("frontend-e2e")

    payload = run_tests_all_suites.build_resume_summary(
        [result_unit, result_backend, result_e2e],
        run_id="run123",
        repo_root=repo_root,
        suite_order=["backend", "frontend-unit", "frontend-e2e"],
        existing_entries=None,
    )

    suites = payload["suites"]

    assert payload["run_id"] == "run123"
    assert payload["generated_at"]
    assert suites[0]["name"] == "backend"
    assert suites[1]["name"] == "frontend-unit"
    assert suites[2]["name"] == "frontend-e2e"
    assert suites[0]["log_path"] == "backend.log"


def test_run_command_writes_log_header(tmp_path):
    """run_command prepends the log header and captures subprocess output in the log file."""
    log_path = tmp_path / "suite.log"
    command = [sys.executable, "-c", "print('hello')"]
    header = run_tests_all_suites.build_log_header("run123", "backend", command)

    result = run_tests_all_suites.run_command(
        name="backend",
        command=command,
        cwd=tmp_path,
        log_path=log_path,
        append_log=True,
        quiet=True,
        log_header=header,
    )

    assert result.status == "ok"
    content = log_path.read_text(encoding="utf-8")
    assert "Resume run: run123" in content
    assert "Suite: backend" in content
    assert "Command:" in content
    assert "hello" in content


def test_main_runs_sequential_by_default(tmp_path, monkeypatch):
    """main() runs all three suites sequentially and does not use ThreadPoolExecutor by default."""
    calls = []
    append_logs = []
    quiet_flags = []

    def fake_backend(**kwargs):
        append_logs.append(kwargs["append_log"])
        quiet_flags.append(kwargs["quiet"])
        calls.append("backend")
        return make_step_result("backend")

    def fake_unit(**kwargs):
        append_logs.append(kwargs["append_log"])
        quiet_flags.append(kwargs["quiet"])
        calls.append("frontend-unit")
        return make_step_result("frontend-unit")

    def fake_e2e(**kwargs):
        append_logs.append(kwargs["append_log"])
        quiet_flags.append(kwargs["quiet"])
        calls.append("frontend-e2e")
        return make_step_result("frontend-e2e")

    class BoomExecutor:
        def __init__(self, *_args, **_kwargs):
            raise AssertionError("ThreadPoolExecutor should not be used")

    monkeypatch.setattr(run_tests_all_suites, "run_backend", fake_backend)
    monkeypatch.setattr(run_tests_all_suites, "run_frontend_unit", fake_unit)
    monkeypatch.setattr(run_tests_all_suites, "run_frontend_e2e", fake_e2e)
    monkeypatch.setattr(run_tests_all_suites, "print_final_report", lambda *_args, **_kwargs: None)
    monkeypatch.setattr(run_tests_all_suites, "ThreadPoolExecutor", BoomExecutor)
    monkeypatch.setattr(
        sys,
        "argv",
        ["run-tests-all-suites.py", "--report-dir", str(tmp_path)],
    )

    exit_code = run_tests_all_suites.main()

    assert exit_code == 0
    assert calls == ["backend", "frontend-unit", "frontend-e2e"]
    assert append_logs == [False, False, False]
    assert quiet_flags == [False, False, False]


def test_main_parallel_verbose_sets_quiet_false(tmp_path, monkeypatch):
    """--parallel --verbose forces quiet=False on every suite runner call."""
    quiet_flags = []

    def fake_backend(**kwargs):
        quiet_flags.append(kwargs["quiet"])
        return make_step_result("backend")

    def fake_unit(**kwargs):
        quiet_flags.append(kwargs["quiet"])
        return make_step_result("frontend-unit")

    def fake_e2e(**kwargs):
        quiet_flags.append(kwargs["quiet"])
        return make_step_result("frontend-e2e")

    monkeypatch.setattr(run_tests_all_suites, "run_backend", fake_backend)
    monkeypatch.setattr(run_tests_all_suites, "run_frontend_unit", fake_unit)
    monkeypatch.setattr(run_tests_all_suites, "run_frontend_e2e", fake_e2e)
    monkeypatch.setattr(run_tests_all_suites, "ThreadPoolExecutor", _SimpleParallelExecutor)
    monkeypatch.setattr(run_tests_all_suites, "as_completed", _fake_as_completed)
    monkeypatch.setattr(run_tests_all_suites, "print_final_report", lambda *_args, **_kwargs: None)
    monkeypatch.setattr(
        sys,
        "argv",
        [
            "run-tests-all-suites.py",
            "--parallel",
            "--verbose",
            "--report-dir",
            str(tmp_path),
        ],
    )

    exit_code = run_tests_all_suites.main()

    assert exit_code == 0
    assert quiet_flags == [False, False, False]


def test_main_sequential_quiet_sets_quiet_true(tmp_path, monkeypatch):
    """--quiet flag propagates quiet=True to every suite runner call in sequential mode."""
    quiet_flags = []

    def fake_backend(**kwargs):
        quiet_flags.append(kwargs["quiet"])
        return make_step_result("backend")

    def fake_unit(**kwargs):
        quiet_flags.append(kwargs["quiet"])
        return make_step_result("frontend-unit")

    def fake_e2e(**kwargs):
        quiet_flags.append(kwargs["quiet"])
        return make_step_result("frontend-e2e")

    monkeypatch.setattr(run_tests_all_suites, "run_backend", fake_backend)
    monkeypatch.setattr(run_tests_all_suites, "run_frontend_unit", fake_unit)
    monkeypatch.setattr(run_tests_all_suites, "run_frontend_e2e", fake_e2e)
    monkeypatch.setattr(run_tests_all_suites, "print_final_report", lambda *_args, **_kwargs: None)
    monkeypatch.setattr(
        sys,
        "argv",
        [
            "run-tests-all-suites.py",
            "--quiet",
            "--report-dir",
            str(tmp_path),
        ],
    )

    exit_code = run_tests_all_suites.main()

    assert exit_code == 0
    assert quiet_flags == [True, True, True]


def test_main_parallel_uses_thread_pool(tmp_path, monkeypatch):
    """--parallel mode uses ThreadPoolExecutor with max_workers=3 and submits all three suites."""
    calls = []
    executor_state = {}

    def fake_backend(**_kwargs):
        calls.append("backend")
        return make_step_result("backend")

    def fake_unit(**_kwargs):
        calls.append("frontend-unit")
        return make_step_result("frontend-unit")

    def fake_e2e(**_kwargs):
        calls.append("frontend-e2e")
        return make_step_result("frontend-e2e")

    monkeypatch.setattr(run_tests_all_suites, "run_backend", fake_backend)
    monkeypatch.setattr(run_tests_all_suites, "run_frontend_unit", fake_unit)
    monkeypatch.setattr(run_tests_all_suites, "run_frontend_e2e", fake_e2e)
    monkeypatch.setattr(run_tests_all_suites, "ThreadPoolExecutor", _make_tracking_executor(executor_state))
    monkeypatch.setattr(run_tests_all_suites, "as_completed", _fake_as_completed)
    monkeypatch.setattr(run_tests_all_suites, "_LiveProgress", _DummyProgress)
    monkeypatch.setattr(run_tests_all_suites, "print_final_report", lambda *_args, **_kwargs: None)
    monkeypatch.setattr(
        sys,
        "argv",
        ["run-tests-all-suites.py", "--parallel", "--report-dir", str(tmp_path)],
    )

    exit_code = run_tests_all_suites.main()

    assert exit_code == 0
    assert executor_state["max_workers"] == 3
    assert len(executor_state["instance"].submitted) == 3
    assert calls == ["backend", "frontend-unit", "frontend-e2e"]


def test_main_resume_runs_suites_when_summary_missing(tmp_path, monkeypatch):
    """--resume runs all suites with append_log=True when no resume summary file exists."""
    calls = []
    append_logs = []

    def fake_backend(**kwargs):
        append_logs.append(kwargs["append_log"])
        calls.append("backend")
        return make_step_result("backend")

    def fake_unit(**kwargs):
        append_logs.append(kwargs["append_log"])
        calls.append("frontend-unit")
        return make_step_result("frontend-unit")

    def fake_e2e(**kwargs):
        append_logs.append(kwargs["append_log"])
        calls.append("frontend-e2e")
        return make_step_result("frontend-e2e")

    monkeypatch.setattr(run_tests_all_suites, "run_backend", fake_backend)
    monkeypatch.setattr(run_tests_all_suites, "run_frontend_unit", fake_unit)
    monkeypatch.setattr(run_tests_all_suites, "run_frontend_e2e", fake_e2e)
    monkeypatch.setattr(run_tests_all_suites, "print_final_report", lambda *_args, **_kwargs: None)
    monkeypatch.setattr(
        sys,
        "argv",
        ["run-tests-all-suites.py", "--resume", "--report-dir", str(tmp_path)],
    )

    exit_code = run_tests_all_suites.main()

    assert exit_code == 0
    assert calls == ["backend", "frontend-unit", "frontend-e2e"]
    assert append_logs == [True, True, True]


def test_main_resume_exits_when_suites_ok(tmp_path, monkeypatch):
    """--resume skips execution and exits 0 when the summary file shows all suites passed."""
    resume_path = tmp_path / run_tests_all_suites.RESUME_FILENAME
    results = [
        make_step_result("backend"),
        make_step_result("frontend-unit"),
        make_step_result("frontend-e2e"),
    ]
    summary = run_tests_all_suites.build_resume_summary(
        results,
        run_id="run123",
        repo_root=tmp_path,
        suite_order=["backend", "frontend-unit", "frontend-e2e"],
    )
    resume_path.write_text(json.dumps(summary, indent=2), encoding="utf-8")

    printed = []

    def fail_backend(**_kwargs):
        raise AssertionError("Runner should not execute")

    def fake_print(message, *_args, **_kwargs):
        printed.append(message)

    monkeypatch.setattr(run_tests_all_suites, "run_backend", fail_backend)
    monkeypatch.setattr(run_tests_all_suites, "print_final_report", lambda *_args, **_kwargs: None)
    monkeypatch.setattr(builtins, "print", fake_print)
    monkeypatch.setattr(
        sys,
        "argv",
        ["run-tests-all-suites.py", "--resume", "--report-dir", str(tmp_path)],
    )

    exit_code = run_tests_all_suites.main()

    assert exit_code == 0
    assert "All suites passed in the last run" in " ".join(printed)


def test_main_resume_runs_failed_suites_only(tmp_path, monkeypatch):
    """--resume re-runs only the suites marked failed in the existing summary file."""
    resume_path = tmp_path / run_tests_all_suites.RESUME_FILENAME
    results = [
        make_step_result("backend"),
        make_step_result("frontend-unit", status="failed", returncode=1),
        make_step_result("frontend-e2e"),
    ]
    summary = run_tests_all_suites.build_resume_summary(
        results,
        run_id="run123",
        repo_root=tmp_path,
        suite_order=["backend", "frontend-unit", "frontend-e2e"],
    )
    resume_path.write_text(json.dumps(summary, indent=2), encoding="utf-8")

    calls = []
    append_logs = []

    def fake_backend(**kwargs):
        append_logs.append(kwargs["append_log"])
        calls.append("backend")
        return make_step_result("backend")

    def fake_unit(**kwargs):
        append_logs.append(kwargs["append_log"])
        calls.append("frontend-unit")
        return make_step_result("frontend-unit")

    def fake_e2e(**kwargs):
        append_logs.append(kwargs["append_log"])
        calls.append("frontend-e2e")
        return make_step_result("frontend-e2e")

    monkeypatch.setattr(run_tests_all_suites, "run_backend", fake_backend)
    monkeypatch.setattr(run_tests_all_suites, "run_frontend_unit", fake_unit)
    monkeypatch.setattr(run_tests_all_suites, "run_frontend_e2e", fake_e2e)
    monkeypatch.setattr(run_tests_all_suites, "print_final_report", lambda *_args, **_kwargs: None)
    monkeypatch.setattr(
        sys,
        "argv",
        ["run-tests-all-suites.py", "--resume", "--report-dir", str(tmp_path)],
    )

    exit_code = run_tests_all_suites.main()

    assert exit_code == 0
    assert calls == ["frontend-unit"]
    assert append_logs == [True]


def test_main_writes_resume_summary_file(tmp_path, monkeypatch):
    """main() writes a resume summary JSON file containing a run_id after a successful run."""
    def fake_backend(**_kwargs):
        return make_step_result("backend")

    def fake_unit(**_kwargs):
        return make_step_result("frontend-unit")

    def fake_e2e(**_kwargs):
        return make_step_result("frontend-e2e")

    monkeypatch.setattr(run_tests_all_suites, "run_backend", fake_backend)
    monkeypatch.setattr(run_tests_all_suites, "run_frontend_unit", fake_unit)
    monkeypatch.setattr(run_tests_all_suites, "run_frontend_e2e", fake_e2e)
    monkeypatch.setattr(run_tests_all_suites, "print_final_report", lambda *_args, **_kwargs: None)
    monkeypatch.setattr(
        sys,
        "argv",
        ["run-tests-all-suites.py", "--report-dir", str(tmp_path)],
    )

    exit_code = run_tests_all_suites.main()

    resume_path = tmp_path / run_tests_all_suites.RESUME_FILENAME
    payload = json.loads(resume_path.read_text(encoding="utf-8"))

    assert exit_code == 0
    assert payload["run_id"]
